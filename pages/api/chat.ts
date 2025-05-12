import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // This is a placeholder response. You'll need to integrate your actual ChatGPT API call here
    const response = `This is a placeholder response to: "${message}". Please integrate your ChatGPT API here.`;

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}