import type { NextApiRequest, NextApiResponse } from 'next';
import type { IntermarketAnalysis, MarketData } from '../../types/intermarket';

function generateMarketData(instrument: string, basePrice: number): MarketData {
  const change = (Math.random() * 4) - 2; // -2% to +2% change
  const correlation = (Math.random() * 2) - 1; // -1 to 1 correlation

  return {
    instrument,
    price: basePrice * (1 + change / 100),
    change_percent: Math.round(change * 100) / 100,
    correlation: Math.round(correlation * 100) / 100
  };
}

function analyzeCorrelationConflicts(marketData: MarketData[], fxBias: 'bullish' | 'bearish'): IntermarketAnalysis['correlation_conflicts'] {
  const conflicts = [];

  // Check Gold vs USD correlation conflict
  const gold = marketData.find(d => d.instrument === 'XAUUSD');
  if (gold && ((fxBias === 'bullish' && gold.change_percent > 1) || 
               (fxBias === 'bearish' && gold.change_percent < -1))) {
    conflicts.push({
      description: `Unusual Gold strength despite ${fxBias} USD bias`,
      severity: 'high',
      instruments: ['XAUUSD', 'USD']
    });
  }

  // Check VIX correlation with risk sentiment
  const vix = marketData.find(d => d.instrument === 'VIX');
  const spx = marketData.find(d => d.instrument === 'SPX');
  if (vix && spx && vix.change_percent > 5 && spx.change_percent > 0) {
    conflicts.push({
      description: 'Divergence between VIX spike and SPX strength',
      severity: 'medium',
      instruments: ['VIX', 'SPX']
    });
  }

  return conflicts;
}

function determineRiskEnvironment(marketData: MarketData[]): IntermarketAnalysis['risk_signals'] {
  const vix = marketData.find(d => d.instrument === 'VIX');
  const spx = marketData.find(d => d.instrument === 'SPX');
  const gold = marketData.find(d => d.instrument === 'XAUUSD');
  
  let riskOnSignals = 0;
  let riskOffSignals = 0;

  if (vix && vix.change_percent > 3) riskOffSignals++;
  if (spx && spx.change_percent > 0.5) riskOnSignals++;
  if (gold && gold.change_percent > 1) riskOffSignals++;

  const type = riskOnSignals > riskOffSignals ? 'risk_on' : 
               riskOffSignals > riskOnSignals ? 'risk_off' : 'mixed';

  const confidence = Math.abs(riskOnSignals - riskOffSignals) * 33.33;

  return {
    type,
    confidence,
    reasoning: `Market shows ${type} characteristics with ${confidence}% confidence based on ${
      [
        vix && `VIX ${vix.change_percent > 0 ? 'up' : 'down'} ${Math.abs(vix.change_percent)}%`,
        spx && `SPX ${spx.change_percent > 0 ? 'up' : 'down'} ${Math.abs(spx.change_percent)}%`,
        gold && `Gold ${gold.change_percent > 0 ? 'up' : 'down'} ${Math.abs(gold.change_percent)}%`
      ].filter(Boolean).join(', ')
    }`
  };
}

function generateInsightSummary(
  marketData: MarketData[],
  conflicts: IntermarketAnalysis['correlation_conflicts'],
  riskSignals: IntermarketAnalysis['risk_signals']
): string {
  const significantMoves = marketData
    .filter(d => Math.abs(d.change_percent) > 1)
    .map(d => `${d.instrument} ${d.change_percent > 0 ? 'up' : 'down'} ${Math.abs(d.change_percent)}%`);

  const conflictWarnings = conflicts.map(c => c.description);
  
  return [
    significantMoves.length > 0 ? `Notable market moves: ${significantMoves.join(', ')}.` : '',
    conflictWarnings.length > 0 ? `Warning: ${conflictWarnings.join('. ')}.` : '',
    `Overall market environment shows ${riskSignals.type} characteristics with ${riskSignals.confidence}% confidence.`,
    riskSignals.reasoning
  ].filter(Boolean).join(' ');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IntermarketAnalysis>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      fx_pair: '',
      market_data: [],
      correlation_conflicts: [],
      risk_signals: {
        type: 'mixed',
        confidence: 0,
        reasoning: 'Method not allowed'
      },
      insight_summary: 'Method not allowed'
    });
  }

  try {
    const { pair, bias } = req.body;

    if (!pair || !bias) {
      throw new Error('Missing required parameters');
    }

    // Generate simulated market data
    const marketData: MarketData[] = [
      generateMarketData('XAUUSD', 2000), // Gold
      generateMarketData('WTI', 75),      // Oil
      generateMarketData('SPX', 4800),    // S&P 500
      generateMarketData('VIX', 15),      // Volatility Index
      generateMarketData('US10Y', 4.2)    // 10-year Treasury Yield
    ];

    // Analyze correlation conflicts
    const correlationConflicts = analyzeCorrelationConflicts(marketData, bias);

    // Determine risk environment
    const riskSignals = determineRiskEnvironment(marketData);

    // Generate comprehensive summary
    const insightSummary = generateInsightSummary(
      marketData,
      correlationConflicts,
      riskSignals
    );

    const analysis: IntermarketAnalysis = {
      timestamp: new Date().toISOString(),
      fx_pair: pair,
      market_data: marketData,
      correlation_conflicts: correlationConflicts,
      risk_signals: riskSignals,
      insight_summary: insightSummary
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Intermarket Analysis Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      fx_pair: '',
      market_data: [],
      correlation_conflicts: [],
      risk_signals: {
        type: 'mixed',
        confidence: 0,
        reasoning: 'Analysis failed due to internal error'
      },
      insight_summary: 'Analysis failed due to internal error'
    });
  }
}