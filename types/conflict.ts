export interface ConflictEntry {
  pair: string;
  timestamp: string;
  conflict_level: 'low' | 'medium' | 'high';
  conflicting_agents: string[];
  agent_votes: {
    macro: string;
    technical: string;
    sentiment: string;
    intermarket: string;
  };
  final_label: string;
  edge_score: number;
}

export interface ConflictAnalysisResponse {
  timestamp: string;
  total_entries_analyzed: number;
  conflict_entries: ConflictEntry[];
  analysis_summary: string;
}