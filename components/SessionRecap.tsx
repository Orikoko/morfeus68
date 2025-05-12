'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SessionRecapData } from '../types/recap';

export default function SessionRecap() {
  const [sessions, setSessions] = useState<SessionRecapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecaps() {
      try {
        const sessionTypes = ['asia', 'london', 'us'];
        const recaps = await Promise.all(
          sessionTypes.map(async (session) => {
            try {
              const response = await fetch(`/api/generate-session-recap?session=${session}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              return data.data;
            } catch (error) {
              console.error(`Failed to fetch ${session} session:`, error);
              return {
                session,
                timestamp: new Date().toISOString(),
                top_pairs: [],
                market_regime: 'trend',
                indicators: { volatility: 0, macro_sentiment: 0, intermarket_signal: 0 },
                summary: `${session} session data temporarily unavailable`
              };
            }
          })
        );
        setSessions(recaps);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch session recaps:', error);
        setError('Failed to load session recaps. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRecaps();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50 animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4" />
            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-neutral-800 rounded w-full" />
              ))}
            </div>
            <div className="h-20 bg-neutral-800 rounded w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 bg-neutral-800 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-900/20 rounded-xl border border-red-800">
        <p className="text-red-400">{error}</p>
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
          className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              {session.session.toUpperCase()} Session
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              session.market_regime === 'trend' ? 'bg-blue-900/50 text-blue-300' :
              session.market_regime === 'breakout' ? 'bg-purple-900/50 text-purple-300' :
              'bg-amber-900/50 text-amber-300'
            }`}>
              {session.market_regime}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {session.top_pairs.map((pair) => (
              <motion.div
                key={pair.pair}
                className="flex items-center justify-between bg-black/30 p-3 rounded-lg backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pair.pair}</span>
                  <span className={`text-sm ${
                    pair.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pair.change > 0 ? '+' : ''}{pair.change.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-300 mb-4">
            {session.summary}
          </p>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Volatility</span>
                <span>{session.indicators.volatility}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.volatility}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Macro Sentiment</span>
                <span>{session.indicators.macro_sentiment}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.macro_sentiment}%` }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Intermarket Signal</span>
                <span>{session.indicators.intermarket_signal}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.indicators.intermarket_signal}%` }}
                  className="h-full bg-purple-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}