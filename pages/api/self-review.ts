import type { NextApiRequest, NextApiResponse } from 'next';
import { getMemory } from '../../lib/memory';
import { getWeights } from '../../lib/weights';
import { addJournalEntry } from '../../lib/journal';
import type { ReviewResponse, DailyStats } from '../../types/review';

function groupByDate(entries: ReturnType<typeof getMemory>): Record<string, typeof entries> {
  return entries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);
}

function calculateAgentAccuracy(entries: ReturnType<typeof getMemory>) {
  const accuracy = {
    macro: 0,
    technical: 0,
    sentiment: 0,
    intermarket: 0
  };

  let total = 0;

  entries.forEach(entry => {
    if (entry.outcome) {
      total++;
      Object.entries(entry.agentVotes).forEach(([agent, vote]) => {
        if (
          (vote === 'bullish' && entry.outcome === 'correct') ||
          (vote === 'bearish' && entry.outcome === 'incorrect')
        ) {
          accuracy[agent as keyof typeof accuracy]++;
        }
      });
    }
  });

  if (total === 0) return accuracy;

  return Object.entries(accuracy).reduce((acc, [agent, correct]) => {
    acc[agent as keyof typeof accuracy] = (correct / total) * 100;
    return acc;
  }, {} as typeof accuracy);
}

function analyzePairPerformance(entries: ReturnType<typeof getMemory>) {
  const pairStats = entries.reduce((acc, entry) => {
    if (!entry.outcome) return acc;
    
    acc[entry.pair] = acc[entry.pair] || { wins: 0, total: 0 };
    acc[entry.pair].total++;
    if (entry.outcome === 'correct') {
      acc[entry.pair].wins++;
    }
    
    return acc;
  }, {} as Record<string, { wins: number; total: number; }>);

  return Object.entries(pairStats)
    .map(([pair, stats]) => ({
      pair,
      win_rate: (stats.wins / stats.total) * 100,
      trades: stats.total
    }))
    .sort((a, b) => b.win_rate - a.win_rate);
}

function suggestWeightAdjustments(
  entries: ReturnType<typeof getMemory>,
  currentWeights: ReturnType<typeof getWeights>
) {
  const accuracy = calculateAgentAccuracy(entries);
  
  return Object.entries(accuracy).map(([agent, accuracyRate]) => {
    const currentWeight = currentWeights[agent as keyof typeof currentWeights];
    const targetWeight = accuracyRate > 75 ? 1.5 :
                        accuracyRate > 60 ? 1.2 :
                        accuracyRate > 50 ? 1.0 : 0.8;
    
    return {
      agent,
      current_weight: currentWeight,
      suggested_adjustment: targetWeight - currentWeight,
      reason: `${agent} showed ${accuracyRate.toFixed(1)}% accuracy`
    };
  });
}

function generateReflectionSummary(
  stats: DailyStats[],
  adjustments: ReviewResponse['agent_adjustments']
): string {
  const recentStats = stats[0];
  if (!recentStats) return 'Insufficient data for analysis';

  const topAgent = adjustments.reduce((a, b) => 
    a.current_weight > b.current_weight ? a : b
  );

  const summary = [
    `Analysis of recent trading sessions shows ${recentStats.win_rate.toFixed(1)}% overall win rate.`,
    `${topAgent.agent} remains our strongest signal with ${
      topAgent.current_weight.toFixed(2)} weight.`,
    recentStats.top_pairs.length > 0 
      ? `Best performance seen in ${recentStats.top_pairs[0].pair} with ${
          recentStats.top_pairs[0].win_rate.toFixed(1)}% win rate.`
      : '',
    adjustments.some(a => Math.abs(a.suggested_adjustment) > 0.1)
      ? 'Significant agent weight adjustments recommended based on recent performance.'
      : 'Agent weights remain well-balanced based on recent performance.'
  ].filter(Boolean).join(' ');

  return summary;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      days_analyzed: 0,
      daily_stats: [],
      agent_adjustments: [],
      reflection_summary: 'Method not allowed'
    });
  }

  try {
    const memory = getMemory();
    const currentWeights = getWeights();
    const dailyEntries = groupByDate(memory);
    
    const daily_stats: DailyStats[] = Object.entries(dailyEntries)
      .map(([date, entries]) => {
        const pairStats = analyzePairPerformance(entries);
        const wins = entries.filter(e => e.outcome === 'correct').length;
        
        return {
          date,
          total_trades: entries.length,
          win_rate: (wins / entries.length) * 100,
          agent_accuracy: calculateAgentAccuracy(entries),
          top_pairs: pairStats.slice(0, 3),
          bottom_pairs: pairStats.slice(-3).reverse()
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    const agent_adjustments = suggestWeightAdjustments(memory, currentWeights);
    const reflection_summary = generateReflectionSummary(daily_stats, agent_adjustments);

    // Add to journal
    addJournalEntry({
      timestamp: new Date().toISOString(),
      daily_stats: {
        win_rate: daily_stats[0]?.win_rate || 0,
        top_agent: agent_adjustments[0]?.agent || '',
        bottom_agent: agent_adjustments[agent_adjustments.length - 1]?.agent || '',
        notable_pairs: daily_stats[0]?.top_pairs.map(p => p.pair) || []
      },
      reflection: reflection_summary
    });

    const response: ReviewResponse = {
      timestamp: new Date().toISOString(),
      days_analyzed: daily_stats.length,
      daily_stats,
      agent_adjustments,
      reflection_summary
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Self Review Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      days_analyzed: 0,
      daily_stats: [],
      agent_adjustments: [],
      reflection_summary: 'Review failed due to internal error'
    });
  }
}