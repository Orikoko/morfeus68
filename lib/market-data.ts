import * as Finnhub from 'finnhub';
import { AlphaVantageAPI } from 'alpha-vantage-cli';
import NodeCache from 'node-cache';

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

export interface MarketData {
  price: number;
  change: number;
  volume: number;
  timestamp: string;
}

// Initialize APIs with fallback empty strings
const finnhubClient = new Finnhub.ApiClient({
  apiKey: process.env.FINNHUB_API_KEY || ''
});

const finnhub = new Finnhub.DefaultApi(finnhubClient);

const alphaVantage = new AlphaVantageAPI({
  key: process.env.ALPHA_VANTAGE_API_KEY || ''
});

async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 8,
  baseDelay: number = 3000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Simple promise execution without custom timeout
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);

      if (attempt === maxRetries - 1) {
        console.error('All retry attempts failed:', error);
        throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }
      
      const jitter = Math.random() * 2000;
      const delay = baseDelay * Math.pow(2, attempt) + jitter;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function getFXPrice(pair: string): Promise<MarketData> {
  const cacheKey = `fx-${pair}`;
  const cachedData = cache.get<MarketData>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    // Mock data for development/fallback
    const mockData: MarketData = {
      price: 1.0 + Math.random() * 0.1,
      change: (Math.random() * 2 - 1) * 0.5,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString()
    };

    // If no API keys, return mock data
    if (!process.env.FINNHUB_API_KEY && !process.env.ALPHA_VANTAGE_API_KEY) {
      console.warn('No API keys configured, using mock data');
      return mockData;
    }

    // Try Finnhub first
    if (process.env.FINNHUB_API_KEY) {
      try {
        const finnhubData = await fetchWithRetry(() => 
          finnhub.forexCandles(
            pair,
            'D',
            Math.floor(Date.now()/1000) - 86400,
            Math.floor(Date.now()/1000)
          )
        );

        if (finnhubData?.c && finnhubData.c.length > 0) {
          const data: MarketData = {
            price: finnhubData.c[finnhubData.c.length - 1],
            change: ((finnhubData.c[finnhubData.c.length - 1] - finnhubData.o[0]) / finnhubData.o[0]) * 100,
            volume: finnhubData.v ? finnhubData.v[finnhubData.v.length - 1] : 0,
            timestamp: new Date().toISOString()
          };

          cache.set(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.warn('Finnhub API error:', error);
      }
    }

    // Fallback to Alpha Vantage
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      try {
        const avData = await fetchWithRetry(async () => {
          try {
            const response = await alphaVantage.forex.rate(pair);
            // Log the response for debugging
            console.debug('Alpha Vantage response:', response);
            return response;
          } catch (err) {
            console.error('Alpha Vantage raw error:', err);
            throw err;
          }
        });
        
        if (avData && 
            typeof avData === 'object' && 
            '5. Exchange Rate' in avData && 
            '8. Bid Price' in avData && 
            '9. Ask Price' in avData && 
            '6. Last Refreshed' in avData) {
          const data: MarketData = {
            price: parseFloat(avData['5. Exchange Rate']),
            change: parseFloat(avData['8. Bid Price']) - parseFloat(avData['9. Ask Price']),
            volume: 0,
            timestamp: avData['6. Last Refreshed']
          };

          // Validate the parsed data
          if (!isNaN(data.price) && !isNaN(data.change)) {
            cache.set(cacheKey, data);
            return data;
          }
        }
        throw new Error('Invalid or missing data in Alpha Vantage response');
      } catch (error) {
        console.warn('Alpha Vantage API error:', error);
      }
    }

    // If both APIs fail, use cached data if available
    if (cachedData) {
      console.warn('APIs failed, using cached data');
      return cachedData;
    }

    // If no cached data, return mock data
    console.warn('All API calls failed and no cache available, using mock data');
    return mockData;
  } catch (error) {
    console.error('FX Price Error:', error);
    throw new Error('Failed to fetch FX price data');
  }
}

export async function getTechnicalIndicators(pair: string) {
  const cacheKey = `tech-${pair}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  // Generate mock technical indicators
  const mockIndicators = {
    rsi: 50 + (Math.random() * 20 - 10),
    macd: {
      histogram: (Math.random() * 0.4 - 0.2),
      signal: (Math.random() * 0.4 - 0.2),
      value: (Math.random() * 0.4 - 0.2)
    },
    ma: {
      ma20: 1.2000 + (Math.random() * 0.1),
      ma50: 1.1900 + (Math.random() * 0.1),
      ma200: 1.1800 + (Math.random() * 0.1)
    }
  };

  cache.set(cacheKey, mockIndicators);
  return mockIndicators;
}

export async function getMarketSentiment(pair: string) {
  const cacheKey = `sentiment-${pair}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const sentiment = await fetchWithRetry(() => 
      finnhub.forexIndicators(pair)
    );
    cache.set(cacheKey, sentiment);
    return sentiment;
  } catch (error) {
    console.error('Market Sentiment Error:', error);
    return cachedData || null;
  }
}