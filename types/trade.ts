export interface TradeLog {
  id: string;
  timestamp: string;
  pair: string;
  label: 'bullish' | 'bearish' | 'neutral';
  score: number;
  summary: string;
  outcome: 'win' | 'loss' | 'breakeven';
  agent_analysis: {
    macro: AgentAnalysis;
    technical: AgentAnalysis;
    sentiment: AgentAnalysis;
  };
}

export interface AgentAnalysis {
  score: number;
  reasoning: string;
}

export interface TradeAnalysis {
  overall_accuracy: number;
  trades_analyzed: number;
  agent_accuracy: {
    macro: number;
    technical: number;
    sentiment: number;
  };
  pair_performance: {
    [pair: string]: {
      average_edge_score: number;
      win_rate: number;
      total_trades: number;
    };
  };
}