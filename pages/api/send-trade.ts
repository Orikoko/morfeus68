import type { NextApiRequest, NextApiResponse } from 'next';

interface TradeRequest {
  pair: string;
  direction: 'buy' | 'sell';
  edge_score: number;
  timestamp: string;
}

interface TradeResponse {
  success: boolean;
  message: string;
  trade_id?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TradeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { pair, direction, edge_score, timestamp } = req.body as TradeRequest;

    if (!pair || !direction || !edge_score || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Log the trade
    console.log('Auto Trade Executed:', {
      pair,
      direction,
      edge_score,
      timestamp
    });

    // Simulate trade execution
    const trade_id = `T${Date.now()}`;

    // Here you would typically:
    // 1. Send to a trading platform's API
    // 2. Store in a database
    // 3. Send to a webhook if configured
    
    if (process.env.TRADE_WEBHOOK_URL) {
      try {
        await fetch(process.env.TRADE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade_id,
            pair,
            direction,
            edge_score,
            timestamp
          })
        });
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Trade executed successfully',
      trade_id
    });
  } catch (error) {
    console.error('Send Trade Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute trade'
    });
  }
}