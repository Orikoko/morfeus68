export interface AgentResponse {
  label: 'bullish' | 'bearish' | 'neutral';
  score: number;
  reason: string;
}

export interface MetaResponse {
  timestamp: string;
  pair: string;
  label: 'bullish' | 'bearish' | 'neutral';
  edge_score: number;
  summary: string;
  agent_analysis: {
    macro: AgentResponse;
    technical: AgentResponse;
    sentiment: AgentResponse;
    intermarket: AgentResponse;
  };
}