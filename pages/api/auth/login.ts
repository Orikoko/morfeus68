import type { NextApiRequest, NextApiResponse } from 'next';
import { generateToken } from '../../../lib/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'auth_token';

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

    // Verify against environment variables
    const validEmail = process.env.AUTH_EMAIL;
    const validPasswordHash = process.env.AUTH_PASSWORD_HASH;

    if (!validEmail || !validPasswordHash) {
      console.error('Auth credentials not configured');
      return res.status(500).json({ error: 'Authentication not configured' });
    }

    if (email !== validEmail) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, validPasswordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = await generateToken(email);
    
    // Set cookie with token
    res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    }));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}