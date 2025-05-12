import type { NextApiRequest, NextApiResponse } from 'next';
import type { CommandResponse } from '../../types/command';
import { parseCommand } from '../../lib/command-parser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommandResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      response: 'Method not allowed'
    });
  }

  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({
        response: 'Invalid transcript format'
      });
    }

    const result = await parseCommand(transcript);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Voice Command Error:', error);
    return res.status(500).json({
      response: 'Failed to process voice command'
    });
  }
}