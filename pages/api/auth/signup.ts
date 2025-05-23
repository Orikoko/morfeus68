import type { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real app, you would store this in a database
    const hashedPassword = await hashPassword(password);
    
    // Simulate successful signup
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
}