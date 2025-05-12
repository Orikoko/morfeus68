import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SessionRecapData {
  session: 'asia' | 'london' | 'us';
  timestamp: string;
  top_pairs: Array<{
    pair: string;
    edge_score: number;
    change: number;
  }>;
  market_regime: 'trend' | 'breakout' | 'range';
  indicators: {
    volatility: number;
    macro_sentiment: number;
    intermarket_signal: number;
  };
  summary: string;
}

export default function SessionRecap() {
  const [sessions, setSessions] = useState<SessionRecapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setSessions([
      {
        session: 'asia',
        timestamp: new Date().toISOString(),
        top_pairs: [
          { pair: 'USD/JPY', edge_score: 75, change: 0.45 },
          { pair: 'AUD/JPY', edge_score: 65, change: -0.32 },
          { pair: 'EUR/JPY', edge_score: 55, change: 0.21 }
        ],
        market_regime: 'trend',
        indicators: {
          volatility: 65,
          macro_sentiment: 55,
          intermarket_signal: 70
        },
        summary: 'Asian session characterized by strong JPY flows and risk-off sentiment.'
      },
      {
        session: 'london',
        timestamp: new Date().toISOString(),
        top_pairs: [
          { pair: 'EUR/USD', edge_score: 85, change: 0.65 },
          { pair: 'GBP/USD', edge_score: 70, change: 0.43 },
          { pair: 'EUR/GBP', edge_score: 60, change: 0.22 }
        ],
        market_regime: 'breakout',
        indicators: {
          volatility: 75,
          macro_sentiment: 65,
          intermarket_signal: 80
        },
        summary: 'London open driven by strong EUR momentum and positive economic data.'
      },
      {
        session: 'us',
        timestamp: new Date().toISOString(),
        top_pairs: [
          { pair: 'EUR/USD', edge_score: 80, change: 0.55 },
          { pair: 'USD/CAD', edge_score: 75, change: -0.45 },
          { pair: 'AUD/USD', edge_score: 65, change: 0.35 }
        ],
        market_regime: 'range',
        indicators: {
          volatility: 60,
          macro_sentiment: 70,
          intermarket_signal: 65
        },
        summary: 'US session showing consolidation after earlier directional moves.'
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="terminal-cell animate-pulse">
            <div className="h-6 bg-[var(--terminal-gray)] rounded w-1/3 mb-4" />
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-[var(--terminal-gray)] rounded w-full" />
              ))}
            </div>
            <div className="h-20 bg-[var(--terminal-gray)] rounded w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 bg-[var(--terminal-gray)] rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <motion.div
          key={session.session}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="terminal-cell"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="terminal-header">
              {session.session.toUpperCase()} Session
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs ${
              session.market_regime === 'trend' ? 'bg-[var(--terminal-blue)] text-white' :
              session.market_regime === 'breakout' ? 'bg-[var(--terminal-green)] text-white' :
              'bg-[var(--terminal-yellow)] text-black'
            }`}>
              {session.market_regime}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {session.top_pairs.map((pair) => (
              <motion.div
                key={pair.pair}
                className="terminal-cell"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{pair.pair}</span>
                    <span className={`text-sm ${
                      pair.change > 0 ? 'price-up' : 'price-down'
                    }`}>
                      {pair.change > 0 ? '+' : ''}{pair.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm font-mono">
                    {pair.edge_score}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-[var(--terminal-text)]/60 mb-4">
            {session.summary}
          </p>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--terminal-text)]/60">Volatility</span>
                <span>{session.indicators.volatility}%</span>
              </div>
              <div className="indicator-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.volatility}%` }}
                  className="indicator-progress bg-[var(--terminal-blue)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--terminal-text)]/60">Macro Sentiment</span>
                <span>{session.indicators.macro_sentiment}%</span>
              </div>
              <div className="indicator-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.macro_sentiment}%` }}
                  className="indicator-progress bg-[var(--terminal-green)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--terminal-text)]/60">Intermarket Signal</span>
                <span>{session.indicators.intermarket_signal}%</span>
              </div>
              <div className="indicator-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.intermarket_signal}%` }}
                  className="indicator-progress bg-[var(--terminal-yellow)]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}