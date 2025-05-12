import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // In a real app, you would:
    // 1. Check if user exists
    // 2. Generate a reset token
    // 3. Send email with reset link
    
    // Always return success to prevent email enumeration
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password Reset Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}