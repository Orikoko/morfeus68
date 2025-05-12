export type MarketRegime = 'trend' | 'mean-reversion' | 'breakout';

export interface RegimeIndicators {
  volatility_score: number;
  sentiment_divergence: number;
  intermarket_alignment: number;
}

export interface StrategyResponse {
  timestamp: string;
  current_regime: MarketRegime;
  regime_indicators: RegimeIndicators;
  confidence_score: number;
  signal_interpretation: {
    entry_logic: string;
    exit_conditions: string;
    risk_parameters: {
      stop_loss_type: 'fixed' | 'atr-based' | 'swing';
      target_multiple: number;
      position_sizing: number;
    };
  };
  recommendation_summary: string;
}