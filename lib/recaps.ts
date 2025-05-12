interface RecapEntry {
  date: string;
  session: 'asia' | 'london' | 'us';
  summary: string;
  topPairs: Array<{
    pair: string;
    bias: string;
    change: number;
  }>;
  volatility: number;
  regime: 'trend' | 'range' | 'breakout';
  macroNotes: string;
}

// Store recaps in memory
const recaps: RecapEntry[] = [];

export function addRecap(entry: RecapEntry): void {
  recaps.unshift(entry);
  
  // Keep last 30 days of recaps
  if (recaps.length > 30) {
    recaps.length = 30;
  }
}

export function getRecaps(): RecapEntry[] {
  return recaps;
}

export function getRecap(session: string): RecapEntry | undefined {
  const today = new Date().toISOString().split('T')[0];
  return recaps.find(r => r.date === today && r.session === session);
}

export function storeRecap(data: any): void {
  const entry: RecapEntry = {
    date: new Date().toISOString().split('T')[0],
    session: data.session,
    summary: data.summary || 'No summary available',
    topPairs: data.top_pairs?.map((p: any) => ({
      pair: p.pair,
      bias: p.edge_score > 75 ? 'bullish' : p.edge_score < 25 ? 'bearish' : 'neutral',
      change: p.change || 0
    })) || [],
    volatility: data.indicators?.volatility || 0,
    regime: data.market_regime || 'range',
    macroNotes: data.macro_context || 'No macro data available'
  };
  
  addRecap(entry);
}