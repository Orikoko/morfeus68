import type { NextApiRequest, NextApiResponse } from 'next';
import { getFXPrice } from '../../lib/market-data';

interface FXResponse {
  prices: Array<{
    pair: string;
    price: number | null;
    change: number;
    volume: number;
    timestamp: string;
    error?: string | null;
  }>;
  timestamp: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FXResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      prices: [],
      timestamp: new Date().toISOString(),
      error: 'Method not allowed'
    });
  }

  try {
    const { pairs } = req.body;

    if (!Array.isArray(pairs)) {
      return res.status(400).json({
        prices: [],
        timestamp: new Date().toISOString(),
        error: 'Invalid pairs format'
      });
    }

    const prices = await Promise.all(
      pairs.map(async (pair) => {
        try {
          const data = await getFXPrice(pair);
          return {
            pair,
            ...data,
            error: null
          };
        } catch (error) {
          console.error(`Error fetching ${pair}:`, error);
          return {
            pair,
            price: null,
            change: 0,
            volume: 0,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Failed to fetch price'
          };
        }
      })
    );

    return res.status(200).json({
      prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('FX Prices API Error:', error);
    return res.status(500).json({
      prices: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to fetch FX prices'
    });
  }
}