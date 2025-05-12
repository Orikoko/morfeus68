import type { NextApiRequest, NextApiResponse } from 'next';
import type { MacroAnalysis } from '../../types/macro';

const MOCK_DATA: Record<string, MacroAnalysis> = {
  US: {
    country: 'US',
    timestamp: new Date().toISOString(),
    indicators: {
      inflation: {
        name: 'CPI YoY',
        value: 3.1,
        previous: 3.4,
        unit: '%',
        date: '2025-02-01'
      },
      gdp_growth: {
        name: 'GDP Growth Rate',
        value: 2.1,
        previous: 1.9,
        unit: '%',
        date: '2024-Q4'
      },
      unemployment: {
        name: 'Unemployment Rate',
        value: 3.7,
        previous: 3.8,
        unit: '%',
        date: '2025-02-01'
      },
      interest_rate: {
        name: 'Federal Funds Rate',
        value: 4.75,
        previous: 5.00,
        unit: '%',
        date: '2025-02-01'
      }
    },
    currency_impact: {
      bias: 'bearish',
      confidence: 75,
      reasoning: 'Declining inflation and interest rates suggest continued Fed dovishness'
    },
    summary: 'US macroeconomic conditions show cooling inflation at 3.1% (down from 3.4%) while GDP growth remains resilient at 2.1%. The labor market stays tight with unemployment at 3.7%. The Fed\'s dovish pivot is reflected in lower rates, suggesting a bearish USD bias.'
  },
  JP: {
    country: 'JP',
    timestamp: new Date().toISOString(),
    indicators: {
      inflation: {
        name: 'CPI YoY',
        value: 2.0,
        previous: 2.3,
        unit: '%',
        date: '2025-02-01'
      },
      gdp_growth: {
        name: 'GDP Growth Rate',
        value: 1.2,
        previous: 1.1,
        unit: '%',
        date: '2024-Q4'
      },
      unemployment: {
        name: 'Unemployment Rate',
        value: 2.5,
        previous: 2.6,
        unit: '%',
        date: '2025-02-01'
      },
      interest_rate: {
        name: 'BOJ Policy Rate',
        value: 0.25,
        previous: 0.10,
        unit: '%',
        date: '2025-02-01'
      }
    },
    currency_impact: {
      bias: 'bullish',
      confidence: 80,
      reasoning: 'BOJ policy normalization and improving growth outlook support JPY strength'
    },
    summary: 'Japanese economy shows signs of sustainable growth with inflation moderating to 2.0%. The BOJ\'s policy normalization continues with rates at 0.25%. Improving labor market and growth dynamics suggest continued JPY strength.'
  },
  EU: {
    country: 'EU',
    timestamp: new Date().toISOString(),
    indicators: {
      inflation: {
        name: 'HICP YoY',
        value: 2.8,
        previous: 2.9,
        unit: '%',
        date: '2025-02-01'
      },
      gdp_growth: {
        name: 'GDP Growth Rate',
        value: 0.9,
        previous: 0.8,
        unit: '%',
        date: '2024-Q4'
      },
      unemployment: {
        name: 'Unemployment Rate',
        value: 6.4,
        previous: 6.5,
        unit: '%',
        date: '2025-02-01'
      },
      interest_rate: {
        name: 'ECB Deposit Rate',
        value: 3.75,
        previous: 4.00,
        unit: '%',
        date: '2025-02-01'
      }
    },
    currency_impact: {
      bias: 'neutral',
      confidence: 60,
      reasoning: 'Mixed signals from improving growth but persistent inflation concerns'
    },
    summary: 'Eurozone shows marginal improvement in economic conditions with GDP growth at 0.9% and inflation moderating to 2.8%. Labor market remains stable with unemployment at 6.4%. ECB maintains cautious stance despite rate cuts, suggesting neutral EUR outlook.'
  }
};

function analyzeMacroTrends(data: MacroAnalysis): void {
  const { indicators } = data;
  
  // Update currency impact based on indicator trends
  const inflationTrend = indicators.inflation.value - indicators.inflation.previous;
  const growthTrend = indicators.gdp_growth.value - indicators.gdp_growth.previous;
  const rateTrend = indicators.interest_rate.value - indicators.interest_rate.previous;
  
  if (inflationTrend < -0.2 && rateTrend < 0) {
    data.currency_impact.bias = 'bearish';
    data.currency_impact.confidence = 75;
  } else if (inflationTrend > 0.2 && growthTrend > 0) {
    data.currency_impact.bias = 'bullish';
    data.currency_impact.confidence = 70;
  } else {
    data.currency_impact.bias = 'neutral';
    data.currency_impact.confidence = 60;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MacroAnalysis | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { country } = req.query;

    if (!country || typeof country !== 'string') {
      return res.status(400).json({ error: 'Country parameter required' });
    }

    const upperCountry = country.toUpperCase();
    const data = MOCK_DATA[upperCountry];

    if (!data) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Ensure analysis is up to date
    analyzeMacroTrends(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Macro Data API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch macro data' });
  }
}