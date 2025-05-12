export interface MarketData {
  instrument: string;
  price: number;
  change_percent: number;
  correlation: number;
}

export interface IntermarketAnalysis {
  timestamp: string;
  fx_pair: string;
  market_data: MarketData[];
  correlation_conflicts: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    instruments: string[];
  }[];
  risk_signals: {
    type: 'risk_on' | 'risk_off' | 'mixed';
    confidence: number;
    reasoning: string;
  };
  insight_summary: string;
}