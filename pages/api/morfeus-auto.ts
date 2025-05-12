import type { NextApiRequest, NextApiResponse } from 'next';
import type { PairState, AutoAnalysisResponse } from '../../types/auto-analysis';

// Predefined currency pairs to monitor
const MONITORED_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD',
  'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP'
];

// Simulated previous state storage (in production, use a database)
let previousStates: Map<string, PairState> = new Map();

function generateMarketIndicators(pair: string): {
  volatility: number;
  sentiment: number;
  yield_spread: number;
} {
  // Simulate market condition changes
  const baseVolatility = Math.random() * 100;
  const baseSentiment = Math.random() * 100;
  const baseYieldSpread = (Math.random() * 4) - 2; // -2 to +2 range

  // Add some persistence to avoid totally random changes
  const previousState = previousStates.get(pair);
  if (previousState) {
    return {
      volatility: (baseVolatility + previousState.volatility) / 2,
      sentiment: (baseSentiment + previousState.sentiment) / 2,
      yield_spread: (baseYieldSpread + previousState.yield_spread) / 2
    };
  }

  return {
    volatility: baseVolatility,
    sentiment: baseSentiment,
    yield_spread: baseYieldSpread
  };
}

function determineBias(indicators: {
  volatility: number;
  sentiment: number;
  yield_spread: number;
}): 'bullish' | 'bearish' | 'neutral' {
  const { volatility, sentiment, yield_spread } = indicators;
  
  // Complex bias determination based on multiple factors
  const sentimentScore = sentiment > 50 ? 1 : -1;
  const volatilityImpact = volatility > 75 ? -0.5 : 0.5; // High volatility tends bearish
  const yieldImpact = yield_spread > 0 ? 0.5 : -0.5;
  
  const totalScore = sentimentScore + volatilityImpact + yieldImpact;
  
  if (totalScore > 0.5) return 'bullish';
  if (totalScore < -0.5) return 'bearish';
  return 'neutral';
}

function generateSummary(
  pair: string,
  indicators: {
    volatility: number;
    sentiment: number;
    yield_spread: number;
  },
  bias: 'bullish' | 'bearish' | 'neutral'
): string {
  const { volatility, sentiment, yield_spread } = indicators;
  
  const volatilityDesc = volatility > 75 ? 'high' : volatility < 25 ? 'low' : 'moderate';
  const sentimentDesc = sentiment > 75 ? 'strong' : sentiment < 25 ? 'weak' : 'mixed';
  const yieldDesc = yield_spread > 1 ? 'supportive' : yield_spread < -1 ? 'concerning' : 'neutral';

  return `${pair} bias has shifted to ${bias} amid ${volatilityDesc} volatility, ${sentimentDesc} sentiment, and ${yieldDesc} yield dynamics.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutoAnalysisResponse>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      pairs_analyzed: 0,
      bias_changes: [],
      market_summary: 'Method not allowed'
    });
  }

  try {
    const biasChanges: PairState[] = [];
    const timestamp = new Date().toISOString();

    for (const pair of MONITORED_PAIRS) {
      // Generate new market state
      const indicators = generateMarketIndicators(pair);
      const currentBias = determineBias(indicators);
      
      // Get previous state
      const previousState = previousStates.get(pair);
      const previousBias = previousState?.current_bias || 'neutral';

      // Create new state
      const newState: PairState = {
        pair,
        timestamp,
        ...indicators,
        previous_bias: previousBias,
        current_bias: currentBias,
        summary: generateSummary(pair, indicators, currentBias)
      };

      // Store new state
      previousStates.set(pair, newState);

      // Check if bias changed
      if (currentBias !== previousBias) {
        biasChanges.push(newState);
      }
    }

    // Generate overall market summary
    const marketSummary = biasChanges.length > 0
      ? `Detected ${biasChanges.length} bias changes. Most significant shifts in ${
          biasChanges.slice(0, 2).map(c => c.pair).join(', ')
        }.`
      : 'No significant bias changes detected in monitored pairs.';

    return res.status(200).json({
      timestamp,
      pairs_analyzed: MONITORED_PAIRS.length,
      bias_changes: biasChanges,
      market_summary: marketSummary
    });
  } catch (error) {
    console.error('Morfeus Auto Analysis Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      pairs_analyzed: 0,
      bias_changes: [],
      market_summary: 'Analysis failed due to internal error'
    });
  }
}