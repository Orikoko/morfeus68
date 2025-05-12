import type { NextApiRequest, NextApiResponse } from 'next';
import { getTelegramToken } from '../../lib/secrets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const telegramToken = getTelegramToken();
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const response = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send Telegram notification');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notification Error:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}