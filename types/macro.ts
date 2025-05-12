export interface MacroIndicator {
  name: string;
  value: number;
  previous: number;
  unit: string;
  date: string;
}

export interface MacroAnalysis {
  country: string;
  timestamp: string;
  indicators: {
    inflation: MacroIndicator;
    gdp_growth: MacroIndicator;
    unemployment: MacroIndicator;
    interest_rate: MacroIndicator;
  };
  currency_impact: {
    bias: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    reasoning: string;
  };
  summary: string;
}