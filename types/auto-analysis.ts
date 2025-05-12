export interface PairState {
  pair: string;
  timestamp: string;
  volatility: number;
  sentiment: number;
  yield_spread: number;
  previous_bias: 'bullish' | 'bearish' | 'neutral';
  current_bias: 'bullish' | 'bearish' | 'neutral';
  summary: string;
}

export interface AutoAnalysisResponse {
  timestamp: string;
  pairs_analyzed: number;
  bias_changes: PairState[];
  market_summary: string;
}