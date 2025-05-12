import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import type { TradeLog } from '../../types/trade';

const TRADE_LOG_FILE = path.join(process.cwd(), 'data', 'trade-logs.json');

async function ensureDirectoryExists() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readTradeLogs(): Promise<TradeLog[]> {
  try {
    await ensureDirectoryExists();
    const content = await fs.readFile(TRADE_LOG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writeTradeLogs(logs: TradeLog[]) {
  await ensureDirectoryExists();
  await fs.writeFile(TRADE_LOG_FILE, JSON.stringify(logs, null, 2));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pair, label, score, summary, outcome, agent_analysis } = req.body;

    if (!pair || !label || !score || !summary || !outcome || !agent_analysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTrade: TradeLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      pair,
      label,
      score,
      summary,
      outcome,
      agent_analysis
    };

    const existingLogs = await readTradeLogs();
    await writeTradeLogs([...existingLogs, newTrade]);

    return res.status(200).json({ message: 'Trade logged successfully', trade: newTrade });
  } catch (error) {
    console.error('Trade Logging Error:', error);
    return res.status(500).json({ error: 'Failed to log trade' });
  }
}