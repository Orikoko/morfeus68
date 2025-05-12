import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentResponse {
  score: number;  // 0-100
  reasoning: string;
}

interface MorfeusResponse {
  pair: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  edge_score: number;
  summary: string;
  agent_analysis: {
    macro: AgentResponse;
    technical: AgentResponse;
    sentiment: AgentResponse;
  };
}

// Simulated agent analysis functions
const macroAnalysis = (pair: string): AgentResponse => {
  const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
  return {
    score: randomScore,
    reasoning: `Global economic conditions and central bank policies indicate ${randomScore > 80 ? 'strong' : 'moderate'} ${randomScore > 50 ? 'upward' : 'downward'} pressure on ${pair}.`
  };
};

const technicalAnalysis = (pair: string): AgentResponse => {
  const randomScore = Math.floor(Math.random() * 40) + 60;
  return {
    score: randomScore,
    reasoning: `Price action and key technical indicators show ${randomScore > 80 ? 'strong' : 'moderate'} ${randomScore > 50 ? 'bullish' : 'bearish'} momentum for ${pair}.`
  };
};

const sentimentAnalysis = (pair: string): AgentResponse => {
  const randomScore = Math.floor(Math.random() * 40) + 60;
  return {
    score: randomScore,
    reasoning: `Market sentiment analysis reveals ${randomScore > 80 ? 'significant' : 'moderate'} ${randomScore > 50 ? 'positive' : 'negative'} bias in ${pair} positioning.`
  };
};

const determineOverallBias = (score: number): 'bullish' | 'bearish' | 'neutral' => {
  if (score >= 70) return 'bullish';
  if (score <= 30) return 'bearish';
  return 'neutral';
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MorfeusResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pair } = req.body;

    if (!pair || typeof pair !== 'string') {
      return res.status(400).json({ error: 'Invalid pair format' });
    }

    // Get analysis from each agent
    const macro = macroAnalysis(pair);
    const technical = technicalAnalysis(pair);
    const sentiment = sentimentAnalysis(pair);

    // Calculate aggregate edge score (weighted average)
    const edge_score = Math.floor(
      (macro.score * 0.4) +      // 40% weight to macro
      (technical.score * 0.4) +  // 40% weight to technical
      (sentiment.score * 0.2)    // 20% weight to sentiment
    );

    // Determine overall bias
    const bias = determineOverallBias(edge_score);

    // Generate combined summary
    const summary = `Analysis of ${pair} shows ${bias} bias with ${edge_score}% edge score. ${
      macro.reasoning} ${technical.reasoning} ${sentiment.reasoning}`;

    const response: MorfeusResponse = {
      pair,
      bias,
      edge_score,
      summary,
      agent_analysis: {
        macro,
        technical,
        sentiment
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Morfeus Core API Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}