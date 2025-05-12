export interface SessionRecapData {
  session: 'asia' | 'london' | 'us';
  timestamp: string;
  top_pairs: Array<{
    pair: string;
    edge_score: number;
    change: number;
  }>;
  market_regime: 'trend' | 'mean-reversion' | 'breakout';
  indicators: {
    volatility: number;
    macro_sentiment: number;
    intermarket_signal: number;
  };
  summary: string;
}

export interface RecapResponse {
  timestamp: string;
  session: string;
  data: SessionRecapData;
}

export interface RecapEntry {
  date: string;
  session: 'asia' | 'london' | 'us';
  regime: 'trend' | 'mean-reversion' | 'breakout' | 'range';
  summary: string;
  topPairs: Array<{
    pair: string;
    bias: string;
    change: number;
  }>;
}