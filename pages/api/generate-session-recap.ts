import type { NextApiRequest, NextApiResponse } from 'next';
import type { RecapResponse } from '../../types/recap';
import * as recaps from '../../lib/recaps';
import { askGPT } from '../../lib/gpt';
import { fetchWithRetry } from '../../lib/fetch-utils';

async function fetchPrices(pairs: string[]) {
  try {
    const formattedPairs = pairs.map(pair => pair.replace('/', ''));
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    
    // Increased cache TTL and added more detailed error handling
    const data = await fetchWithRetry(
      `${baseUrl}/api/fx-prices`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: {
          key: `fx-prices-${formattedPairs.join('-')}`,
          ttl: 600 // Increased to 10 minutes
        },
        maxRetries: 12,
        baseDelay: 5000,
        timeout: 15000
      }
    );

    if (!data || typeof data !== 'object') {
      console.warn('Invalid response format - empty or non-object response:', data);
      return getFallbackPrices(formattedPairs);
    }

    if (!data.prices || !Array.isArray(data.prices)) {
      console.warn('Invalid response format from FX prices API:', data);
      return getFallbackPrices(formattedPairs);
    }

    return data;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return getFallbackPrices(pairs);
  }
}

// Helper function to generate fallback price data
function getFallbackPrices(pairs: string[]) {
  return { 
    prices: pairs.map(pair => ({ 
      pair, 
      change: 0,
      timestamp: new Date().toISOString() 
    })),
    fallback: true // Flag to indicate this is fallback data
  };
}

async function fetchMacroData(region: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    
    const data = await fetchWithRetry(
      `${baseUrl}/api/macro-data?country=${region}`,
      {
        cache: {
          key: `macro-data-${region}`,
          ttl: 7200 // Increased to 2 hours
        },
        maxRetries: 12,
        baseDelay: 5000,
        timeout: 15000
      }
    );

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid macro data response format');
    }

    return data;
  } catch (error) {
    console.error('Error fetching macro data:', error);
    return { 
      summary: 'Macro data temporarily unavailable', 
      currency_impact: { confidence: 50 },
      fallback: true
    };
  }
}

async function generateSummary(
  session: string,
  prices: any,
  macro: any,
  regime: string
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return `${session} session analysis currently unavailable. Please check back later.`;
    }

    const prompt = `Generate a concise forex market recap for the ${session} session:
      Market Data: ${prices.map((p: any) => `${p.pair}: ${p.change}%`).join(', ')}
      Macro Context: ${macro.summary || 'No macro data available'}
      Market Regime: ${regime}
      Provide a 2-3 sentence summary focusing on key moves and their drivers.`;

    return await askGPT(prompt);
  } catch (error) {
    console.error('Failed to generate GPT summary:', error);
    return `${session} session showed typical market activity with mixed movements across major pairs.`;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecapResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      session: '',
      data: {
        session: 'asia',
        timestamp: new Date().toISOString(),
        top_pairs: [],
        market_regime: 'trend',
        indicators: { volatility: 0, macro_sentiment: 0, intermarket_signal: 0 },
        summary: 'Method not allowed'
      }
    });
  }

  try {
    const { session } = req.query;
    if (!session || typeof session !== 'string') {
      throw new Error('Session parameter required');
    }

    const existingRecap = recaps.getRecap(session);
    if (existingRecap) {
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        session,
        data: {
          session: session as 'asia' | 'london' | 'us',
          timestamp: new Date().toISOString(),
          top_pairs: existingRecap.topPairs.map(p => ({
            pair: p.pair,
            edge_score: p.bias === 'bullish' ? 75 : p.bias === 'bearish' ? 25 : 50,
            change: p.change
          })),
          market_regime: existingRecap.regime,
          indicators: {
            volatility: existingRecap.volatility,
            macro_sentiment: 50,
            intermarket_signal: 50
          },
          summary: existingRecap.summary
        }
      });
    }

    const pairs = session === 'asia' 
      ? ['USD/JPY', 'AUD/JPY', 'EUR/JPY', 'GBP/JPY']
      : session === 'london'
      ? ['EUR/USD', 'GBP/USD', 'EUR/GBP', 'GBP/CHF']
      : ['EUR/USD', 'USD/CAD', 'AUD/USD', 'NZD/USD'];

    const [prices, macro] = await Promise.all([
      fetchPrices(pairs),
      fetchMacroData(session === 'asia' ? 'JP' : session === 'london' ? 'EU' : 'US')
    ]);

    const volatility = Math.max(
      ...prices.prices.map((p: any) => Math.abs(p.change || 0))
    ) * 20;

    const regime = volatility > 70 ? 'breakout' 
                : volatility < 30 ? 'range' 
                : 'trend';

    const summary = await generateSummary(session, prices.prices, macro, regime);

    const recapData = {
      session: session as 'asia' | 'london' | 'us',
      timestamp: new Date().toISOString(),
      top_pairs: prices.prices
        .sort((a: any, b: any) => Math.abs(b.change || 0) - Math.abs(a.change || 0))
        .slice(0, 3)
        .map((p: any) => ({
          pair: p.pair,
          edge_score: Math.round(Math.abs(p.change || 0) * 10 + 65),
          change: p.change || 0
        })),
      market_regime: regime,
      indicators: {
        volatility,
        macro_sentiment: macro.currency_impact?.confidence || 50,
        intermarket_signal: Math.round(Math.random() * 30 + 50)
      },
      summary,
      macro_context: macro.summary || 'Macro data unavailable',
      using_fallback: prices.fallback || macro.fallback
    };

    recaps.storeRecap(recapData);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      session,
      data: recapData
    });
  } catch (error) {
    console.error('Session Recap Generation Error:', error);
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      session: typeof req.query.session === 'string' ? req.query.session : '',
      data: {
        session: 'asia',
        timestamp: new Date().toISOString(),
        top_pairs: [],
        market_regime: 'trend',
        indicators: { volatility: 0, macro_sentiment: 0, intermarket_signal: 0 },
        summary: error instanceof Error ? error.message : 'Failed to generate session recap'
      }
    });
  }
}