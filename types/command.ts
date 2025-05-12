export interface CommandRequest {
  message: string;
  source?: 'text' | 'voice';
}

export interface CommandResponse {
  response: string;
  action?: {
    type: 'getBias' | 'exportSession' | 'getTopPairs' | 'showConflicts';
    data?: any;
  };
}