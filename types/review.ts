export interface DailyStats {
  date: string;
  total_trades: number;
  win_rate: number;
  agent_accuracy: {
    macro: number;
    technical: number;
    sentiment: number;
    intermarket: number;
  };
  top_pairs: Array<{
    pair: string;
    win_rate: number;
    trades: number;
  }>;
  bottom_pairs: Array<{
    pair: string;
    win_rate: number;
    trades: number;
  }>;
}

export interface ReviewResponse {
  timestamp: string;
  days_analyzed: number;
  daily_stats: DailyStats[];
  agent_adjustments: Array<{
    agent: string;
    current_weight: number;
    suggested_adjustment: number;
    reason: string;
  }>;
  reflection_summary: string;
}