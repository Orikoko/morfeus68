export interface FXPrice {
  pair: string;
  price: number;
  timestamp: string;
  source: 'live' | 'mock';
}

export interface FXPriceRequest {
  pairs: string[];
}

export interface FXPriceResponse {
  prices: FXPrice[];
  timestamp: string;
}