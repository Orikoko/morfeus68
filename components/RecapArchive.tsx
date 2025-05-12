import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RecapEntry } from '../types/recap';
import { getRecaps } from '../lib/recaps';

export default function RecapArchive() {
  const [recaps, setRecaps] = useState<RecapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allRecaps = getRecaps();
      setRecaps(allRecaps);
      setError(null);
    } catch (err) {
      setError('Failed to load recaps');
      console.error('Recap loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded w-full" />
              <div className="h-2 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 rounded-xl p-4">
        {error}
      </div>
    );
  }

  if (recaps.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-400">
        No recaps available yet. Check back after the next trading session.
      </div>
    );
  }

  // Group recaps by date
  const groupedRecaps = recaps.reduce((acc, recap) => {
    if (!acc[recap.date]) {
      acc[recap.date] = [];
    }
    acc[recap.date].push(recap);
    return acc;
  }, {} as Record<string, RecapEntry[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedRecaps)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, dayRecaps]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">{date}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayRecaps
                .sort((a, b) => {
                  const sessionOrder = { asia: 0, london: 1, us: 2 };
                  return sessionOrder[a.session] - sessionOrder[b.session];
                })
                .map((recap) => (
                  <div
                    key={`${date}-${recap.session}`}
                    className="bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        {recap.session.toUpperCase()} Session
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        recap.regime === 'trend' ? 'bg-blue-900/50 text-blue-300' :
                        recap.regime === 'range' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-purple-900/50 text-purple-300'
                      }`}>
                        {recap.regime}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">
                      {recap.summary}
                    </p>

                    <div className="space-y-2">
                      {recap.topPairs.map((pair) => (
                        <div
                          key={pair.pair}
                          className="flex justify-between text-sm"
                        >
                          <span>{pair.pair}</span>
                          <span className={pair.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pair.change >= 0 ? '+' : ''}{pair.change}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
}