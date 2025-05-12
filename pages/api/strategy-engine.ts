import type { NextApiRequest, NextApiResponse } from 'next';
import type { MarketRegime, RegimeIndicators, StrategyResponse } from '../../types/strategy';

function generateRegimeIndicators(): RegimeIndicators {
  return {
    volatility_score: Math.round(Math.random() * 100),
    sentiment_divergence: Math.round(Math.random() * 100),
    intermarket_alignment: Math.round(Math.random() * 100)
  };
}

function determineMarketRegime(indicators: RegimeIndicators): {
  regime: MarketRegime;
  confidence: number;
} {
  const { volatility_score, sentiment_divergence, intermarket_alignment } = indicators;
  
  // High volatility + high alignment = breakout
  if (volatility_score > 70 && intermarket_alignment > 60) {
    return { regime: 'breakout', confidence: Math.min(volatility_score, intermarket_alignment) };
  }
  
  // Low volatility + high divergence = mean-reversion
  if (volatility_score < 30 && sentiment_divergence > 60) {
    return { regime: 'mean-reversion', confidence: Math.min(100 - volatility_score, sentiment_divergence) };
  }
  
  // High alignment + moderate volatility = trend
  if (intermarket_alignment > 60 && volatility_score >= 30 && volatility_score <= 70) {
    return { regime: 'trend', confidence: intermarket_alignment };
  }
  
  // Default to trend with lower confidence
  return { regime: 'trend', confidence: 50 };
}

function generateSignalInterpretation(
  regime: MarketRegime,
  pair: string
): StrategyResponse['signal_interpretation'] {
  switch (regime) {
    case 'breakout':
      return {
        entry_logic: `Enter ${pair} on strong momentum confirmation with volume surge`,
        exit_conditions: 'Trail stops aggressively on first sign of momentum exhaustion',
        risk_parameters: {
          stop_loss_type: 'atr-based',
          target_multiple: 3,
          position_sizing: 1
        }
      };
    
    case 'mean-reversion':
      return {
        entry_logic: `Enter ${pair} on extreme oversold/overbought conditions with divergence`,
        exit_conditions: 'Take profit at mean value, tighten stops on reversion',
        risk_parameters: {
          stop_loss_type: 'fixed',
          target_multiple: 1.5,
          position_sizing: 0.75
        }
      };
    
    case 'trend':
      return {
        entry_logic: `Enter ${pair} on pullbacks to key moving averages with trend alignment`,
        exit_conditions: 'Hold for trend duration, exit on trend line break',
        risk_parameters: {
          stop_loss_type: 'swing',
          target_multiple: 2.5,
          position_sizing: 1.25
        }
      };
  }
}

function generateRecommendation(
  pair: string,
  regime: MarketRegime,
  confidence: number,
  indicators: RegimeIndicators
): string {
  const confidenceLevel = confidence > 80 ? 'high' : confidence > 60 ? 'moderate' : 'low';
  const volatilityDesc = indicators.volatility_score > 70 ? 'elevated' : 
                        indicators.volatility_score < 30 ? 'subdued' : 'moderate';
  
  switch (regime) {
    case 'breakout':
      return `${pair} shows strong breakout conditions with ${confidenceLevel} confidence. ` +
             `Volatility is ${volatilityDesc}, suggesting momentum follow-through potential. ` +
             `Favor aggressive entries on clear breakout levels with tight risk control.`;
    
    case 'mean-reversion':
      return `${pair} exhibits mean-reversion characteristics with ${confidenceLevel} confidence. ` +
             `Current volatility is ${volatilityDesc}, ideal for range-bound strategies. ` +
             `Look for extreme moves with technical divergence for optimal entry points.`;
    
    case 'trend':
      return `${pair} displays trending behavior with ${confidenceLevel} confidence. ` +
             `${volatilityDesc} volatility suggests ${
               indicators.volatility_score > 70 ? 'wider stops required' : 
               indicators.volatility_score < 30 ? 'tighter stops possible' : 
               'standard position sizing appropriate'}. ` +
             `Focus on trend-following entries with strong intermarket confirmation.`;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StrategyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      current_regime: 'trend',
      regime_indicators: {
        volatility_score: 0,
        sentiment_divergence: 0,
        intermarket_alignment: 0
      },
      confidence_score: 0,
      signal_interpretation: {
        entry_logic: '',
        exit_conditions: '',
        risk_parameters: {
          stop_loss_type: 'fixed',
          target_multiple: 0,
          position_sizing: 0
        }
      },
      recommendation_summary: 'Method not allowed'
    });
  }

  try {
    const { pair } = req.body;

    if (!pair) {
      throw new Error('Missing required parameter: pair');
    }

    // Generate regime indicators
    const indicators = generateRegimeIndicators();

    // Determine current regime
    const { regime, confidence } = determineMarketRegime(indicators);

    // Generate signal interpretation
    const signalInterpretation = generateSignalInterpretation(regime, pair);

    // Generate recommendation summary
    const recommendationSummary = generateRecommendation(pair, regime, confidence, indicators);

    const response: StrategyResponse = {
      timestamp: new Date().toISOString(),
      current_regime: regime,
      regime_indicators: indicators,
      confidence_score: confidence,
      signal_interpretation: signalInterpretation,
      recommendation_summary: recommendationSummary
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Strategy Engine Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      current_regime: 'trend',
      regime_indicators: {
        volatility_score: 0,
        sentiment_divergence: 0,
        intermarket_alignment: 0
      },
      confidence_score: 0,
      signal_interpretation: {
        entry_logic: '',
        exit_conditions: '',
        risk_parameters: {
          stop_loss_type: 'fixed',
          target_multiple: 0,
          position_sizing: 0
        }
      },
      recommendation_summary: 'Analysis failed due to internal error'
    });
  }
}