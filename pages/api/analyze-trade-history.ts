import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import type { TradeLog, TradeAnalysis } from '../../types/trade';

const TRADE_LOG_FILE = path.join(process.cwd(), 'data', 'trade-logs.json');

async function readTradeLogs(): Promise<TradeLog[]> {
  try {
    const content = await fs.readFile(TRADE_LOG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function calculateAgentAccuracy(trades: TradeLog[], agentType: 'macro' | 'technical' | 'sentiment'): number {
  if (trades.length === 0) return 0;

  const correctPredictions = trades.filter(trade => {
    const agentScore = trade.agent_analysis[agentType].score;
    const wasCorrect = (
      (agentScore > 50 && trade.outcome === 'win') ||
      (agentScore < 50 && trade.outcome === 'loss')
    );
    return wasCorrect;
  }).length;

  return (correctPredictions / trades.length) * 100;
}

function analyzePairPerformance(trades: TradeLog[]) {
  const pairStats: { [pair: string]: { scores: number[], outcomes: string[] } } = {};

  trades.forEach(trade => {
    if (!pairStats[trade.pair]) {
      pairStats[trade.pair] = { scores: [], outcomes: [] };
    }
    pairStats[trade.pair].scores.push(trade.score);
    pairStats[trade.pair].outcomes.push(trade.outcome);
  });

  const performance: TradeAnalysis['pair_performance'] = {};

  for (const [pair, stats] of Object.entries(pairStats)) {
    const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    const wins = stats.outcomes.filter(o => o === 'win').length;
    
    performance[pair] = {
      average_edge_score: Math.round(avgScore * 100) / 100,
      win_rate: Math.round((wins / stats.outcomes.length) * 100) / 100,
      total_trades: stats.outcomes.length
    };
  }

  return performance;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const trades = await readTradeLogs();

    if (trades.length === 0) {
      return res.status(200).json({
        message: 'No trades found for analysis',
        trades_analyzed: 0
      });
    }

    const wins = trades.filter(t => t.outcome === 'win').length;
    const overall_accuracy = (wins / trades.length) * 100;

    const analysis: TradeAnalysis = {
      overall_accuracy: Math.round(overall_accuracy * 100) / 100,
      trades_analyzed: trades.length,
      agent_accuracy: {
        macro: Math.round(calculateAgentAccuracy(trades, 'macro') * 100) / 100,
        technical: Math.round(calculateAgentAccuracy(trades, 'technical') * 100) / 100,
        sentiment: Math.round(calculateAgentAccuracy(trades, 'sentiment') * 100) / 100
      },
      pair_performance: analyzePairPerformance(trades)
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Trade Analysis Error:', error);
    return res.status(500).json({ error: 'Failed to analyze trades' });
  }
}