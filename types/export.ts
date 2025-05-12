export interface GridData {
  pair: string;
  edge_score: number;
  label: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  timestamp: string;
}

export interface ChatHistory {
  timestamp: string;
  message: string;
  type: 'user' | 'ai';
}

export interface ExportRequest {
  grid: GridData[];
  history: ChatHistory[];
  format: 'pdf' | 'markdown';
}

export interface ExportResponse {
  url?: string;
  content?: string;
  error?: string;
}