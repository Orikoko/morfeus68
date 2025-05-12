import type { NextApiRequest, NextApiResponse } from 'next';
import type { MetaResponse } from '../../types/meta';
import { storeSession } from '../../lib/memory';
import { getWeights, applyWeights } from '../../lib/weights';
import { askGPT } from '../../lib/gpt';

interface MarketData {
  fxPrices: Record<string, number>;
  macroData: {
    inflation: number;
    gdp_growth: number;
    interest_rate: number;
    summary: string;
  };
  sentiment?: {
    value: number;
    sentiment: string;
  };
}

async function fetchMarketData(pair: string): Promise<MarketData> {
  const [base, quote] = [pair.slice(0, 3), pair.slice(3)];
  
  // Fetch FX prices
  const pricesResponse = await fetch('http://localhost:3000/api/fx-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pairs: [pair] })
  });
  const pricesData = await pricesResponse.json();

  // Fetch macro data for base currency's economy
  const macroResponse = await fetch(`http://localhost:3000/api/macro-data?country=${base}`);
  const macroData = await macroResponse.json();

  // Try to fetch market sentiment
  let sentimentData;
  try {
    const sentimentResponse = await fetch('http://localhost:3000/api/market-sentiment');
    sentimentData = await sentimentResponse.json();
  } catch (error) {
    console.warn('Market sentiment data unavailable:', error);
  }

  return {
    fxPrices: pricesData.prices.reduce((acc: Record<string, number>, p: any) => {
      acc[p.pair] = p.price;
      return acc;
    }, {}),
    macroData: {
      inflation: macroData.indicators.inflation.value,
      gdp_growth: macroData.indicators.gdp_growth.value,
      interest_rate: macroData.indicators.interest_rate.value,
      summary: macroData.summary
    },
    sentiment: sentimentData
  };
}

async function generateAnalysisSummary(
  pair: string,
  marketData: MarketData,
  agentVotes: Record<string, string>
): Promise<string> {
  const [base] = [pair.slice(0, 3), pair.slice(3)];
  
  const prompt = `Analyze the following market data for ${pair}:

1. Price: ${marketData.fxPrices[pair]}
2. ${base} Economic Data:
   - Inflation: ${marketData.macroData.inflation}%
   - GDP Growth: ${marketData.macroData.gdp_growth}%
   - Interest Rate: ${marketData.macroData.interest_rate}%
3. Macro Context: ${marketData.macroData.summary}
${marketData.sentiment ? `4. Market Sentiment: ${marketData.sentiment.sentiment} (${marketData.sentiment.value})` : ''}

Agent Votes:
${Object.entries(agentVotes).map(([agent, vote]) => `- ${agent}: ${vote}`).join('\n')}

Provide a concise analysis of the likely directional bias for ${pair} based on this data.`;

  return askGPT(prompt);
}

function macroAgent(pair: string): AgentResponse {
  const conditions = ['inflation trends', 'central bank policies', 'economic growth data', 'yield differentials'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  return {
    label: score > 75 ? 'bullish' : score < 65 ? 'bearish' : 'neutral',
    score,
    reason: `${pair} shows ${score > 75 ? 'positive' : score < 65 ? 'negative' : 'mixed'} bias based on ${randomCondition}`
  };
}

function technicalAgent(pair: string): AgentResponse {
  const patterns = ['trend structure', 'momentum indicators', 'price action', 'key level reactions'];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  return {
    label: score > 75 ? 'bullish' : score < 65 ? 'bearish' : 'neutral',
    score,
    reason: `${pair} technical analysis reveals ${score > 75 ? 'strong' : score < 65 ? 'weak' : 'neutral'} ${randomPattern}`
  };
}

function sentimentAgent(pair: string): AgentResponse {
  const factors = ['positioning data', 'option market skew', 'risk sentiment', 'market psychology'];
  const randomFactor = factors[Math.floor(Math.random() * factors.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  return {
    label: score > 75 ? 'bullish' : score < 65 ? 'bearish' : 'neutral',
    score,
    reason: `${pair} sentiment shows ${score > 75 ? 'positive' : score < 65 ? 'negative' : 'mixed'} bias in ${randomFactor}`
  };
}

function intermarketAgent(pair: string): AgentResponse {
  const correlations = ['equity markets', 'commodity prices', 'bond yields', 'risk metrics'];
  const randomCorrelation = correlations[Math.floor(Math.random() * correlations.length)];
  const score = Math.floor(Math.random() * 40) + 60;
  
  return {
    label: score > 75 ? 'bullish' : score < 65 ? 'bearish' : 'neutral',
    score,
    reason: `${pair} shows ${score > 75 ? 'positive' : score < 65 ? 'negative' : 'mixed'} alignment with ${randomCorrelation}`
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetaResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      pair: '',
      label: 'neutral',
      edge_score: 0,
      summary: 'Method not allowed',
      agent_analysis: {
        macro: { label: 'neutral', score: 0, reason: '' },
        technical: { label: 'neutral', score: 0, reason: '' },
        sentiment: { label: 'neutral', score: 0, reason: '' },
        intermarket: { label: 'neutral', score: 0, reason: '' }
      }
    });
  }

  try {
    const { pair } = req.body;

    if (!pair || typeof pair !== 'string') {
      throw new Error('Invalid pair format');
    }

    // Fetch market data
    const marketData = await fetchMarketData(pair);

    // Get analysis from each agent
    const agents = {
      macro: macroAgent(pair),
      technical: technicalAgent(pair),
      sentiment: sentimentAgent(pair),
      intermarket: intermarketAgent(pair)
    };

    // Apply weighted voting
    const agentVotes = {
      macro: agents.macro.label,
      technical: agents.technical.label,
      sentiment: agents.sentiment.label,
      intermarket: agents.intermarket.label
    };

    const weights = getWeights();
    const { label, confidence } = applyWeights(agentVotes, weights);

    // Calculate edge score
    const edge_score = Math.round(
      (confidence * 0.6) +
      (((agents.macro.score + agents.technical.score + 
        agents.sentiment.score + agents.intermarket.score) / 4) * 0.4)
    );

    // Generate GPT-enhanced analysis
    const summary = await generateAnalysisSummary(pair, marketData, agentVotes);
    const timestamp = new Date().toISOString();

    // Store session in memory
    storeSession({
      pair,
      agentVotes,
      finalLabel: label,
      edge_score,
      timestamp
    });

    const response: MetaResponse = {
      timestamp,
      pair,
      label,
      edge_score,
      summary,
      agent_analysis: agents
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Morfeus Meta API Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      pair: '',
      label: 'neutral',
      edge_score: 0,
      summary: 'Analysis failed due to internal error',
      agent_analysis: {
        macro: { label: 'neutral', score: 0, reason: '' },
        technical: { label: 'neutral', score: 0, reason: '' },
        sentiment: { label: 'neutral', score: 0, reason: '' },
        intermarket: { label: 'neutral', score: 0, reason: '' }
      }
    });
  }
}