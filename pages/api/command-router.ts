import type { NextApiRequest, NextApiResponse } from 'next';
import type { CommandRequest, CommandResponse } from '../../types/command';
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
    const { message, source = 'text' } = req.body as CommandRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        response: 'Invalid message format'
      });
    }

    const result = await parseCommand(message);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Command Router Error:', error);
    return res.status(500).json({
      response: 'Failed to process command'
    });
  }
}