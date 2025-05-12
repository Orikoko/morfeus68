import type { NextApiRequest, NextApiResponse } from 'next';
import { getTechnicalIndicators } from '../../lib/market-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pair } = req.query;

    if (!pair || typeof pair !== 'string') {
      return res.status(400).json({ error: 'Pair parameter required' });
    }

    const indicators = await getTechnicalIndicators(pair);
    return res.status(200).json(indicators);
  } catch (error) {
    console.error('Technical Indicators API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch technical indicators' });
  }
}