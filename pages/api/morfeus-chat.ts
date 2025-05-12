import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    // Mock response since we removed the external dependencies
    const result = {
      pair: query,
      label: 'bullish',
      edge_score: 84,
      summary: `Morfeus detects a bullish bias for ${query} based on current sentiment and macro alignment.`,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Morfeus API Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}