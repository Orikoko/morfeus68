import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithRetry, apiCache } from '../../lib/fetch-utils';

interface FearGreedResponse {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
}

interface SentimentResponse {
  sentiment: string;
  value: number;
  timestamp: string;
}

const DEFAULT_SENTIMENT: SentimentResponse = {
  sentiment: 'neutral',
  value: 50,
  timestamp: new Date().toISOString()
};

async function fetchFearGreedIndex(): Promise<SentimentResponse> {
  try {
    const data = await fetchWithRetry<FearGreedResponse>(
      'https://api.alternative.me/fng/',
      {
        cache: {
          key: 'fear-greed-index',
          ttl: 3600 // 1 hour
        },
        maxRetries: 12,
        baseDelay: 5000,
        timeout: 15000
      }
    );

    const latest = data.data[0];
    return {
      sentiment: latest.value_classification,
      value: parseInt(latest.value, 10),
      timestamp: latest.timestamp
    };
  } catch (error) {
    console.error('Fear & Greed API Error:', error);
    
    // Check for cached data as fallback
    const cachedData = apiCache.get<SentimentResponse>('fear-greed-index');
    if (cachedData) {
      console.warn('Using cached fallback data due to fetch error');
      return cachedData;
    }
    
    console.warn('No cached data available, returning default sentiment');
    return DEFAULT_SENTIMENT;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SentimentResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json(DEFAULT_SENTIMENT);
  }

  try {
    const sentiment = await fetchFearGreedIndex();
    return res.status(200).json(sentiment);
  } catch (error) {
    console.error('Market Sentiment Error:', error);
    return res.status(200).json(DEFAULT_SENTIMENT);
  }
}