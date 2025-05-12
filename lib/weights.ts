interface AgentWeights {
  macro: number;
  technical: number;
  sentiment: number;
  intermarket: number;
}

// Initial weights for each agent
let weights: AgentWeights = {
  macro: 1.0,
  technical: 1.0,
  sentiment: 1.0,
  intermarket: 1.0
};

const WEIGHT_ADJUSTMENT = 0.05; // 5% adjustment per feedback
const MIN_WEIGHT = 0.5;        // Minimum weight threshold
const MAX_WEIGHT = 2.0;        // Maximum weight threshold

/**
 * Updates an agent's weight based on prediction accuracy
 */
export function updateWeight(
  agent: keyof AgentWeights,
  result: 'correct' | 'incorrect'
): void {
  const adjustment = result === 'correct' ? WEIGHT_ADJUSTMENT : -WEIGHT_ADJUSTMENT;
  const currentWeight = weights[agent];
  const newWeight = currentWeight + adjustment;
  
  // Ensure weight stays within bounds
  weights[agent] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newWeight));
}

/**
 * Returns current weights for all agents
 */
export function getWeights(): AgentWeights {
  return { ...weights };
}

/**
 * Applies weights to agent votes to determine final bias
 */
export function applyWeights(
  agentVotes: Record<string, string>,
  weights: AgentWeights
): {
  label: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
} {
  const voteScores = {
    bullish: 1,
    neutral: 0,
    bearish: -1
  };

  let weightedSum = 0;
  let totalWeight = 0;

  // Calculate weighted vote sum
  Object.entries(agentVotes).forEach(([agent, vote]) => {
    const agentWeight = weights[agent as keyof AgentWeights];
    const voteScore = voteScores[vote as keyof typeof voteScores];
    
    weightedSum += voteScore * agentWeight;
    totalWeight += agentWeight;
  });

  // Normalize to get final score between -1 and 1
  const normalizedScore = weightedSum / totalWeight;

  // Convert to confidence percentage (0-100)
  const confidence = Math.round(Math.abs(normalizedScore) * 100);

  // Determine label based on normalized score
  let label: 'bullish' | 'bearish' | 'neutral';
  if (normalizedScore > 0.33) {
    label = 'bullish';
  } else if (normalizedScore < -0.33) {
    label = 'bearish';
  } else {
    label = 'neutral';
  }

  return { label, confidence };
}