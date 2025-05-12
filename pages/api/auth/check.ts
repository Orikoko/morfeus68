import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = await requireAuth(req);
    
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ email: auth.email });
  } catch (error) {
    console.error('Auth Check Error:', error);
    return res.status(500).json({ error: 'Authentication check failed' });
  }
}