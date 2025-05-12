import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SentimentData {
  sentiment: string;
  value: number;
  timestamp: string;
}

export default function SentimentMeter() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSentiment() {
      try {
        const response = await fetch('/api/market-sentiment');
        if (!response.ok) {
          throw new Error('Failed to fetch sentiment');
        }
        const data = await response.json();
        setSentiment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sentiment');
      } finally {
        setLoading(false);
      }
    }

    fetchSentiment();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-2 bg-gray-800 rounded w-full" />
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

  if (!sentiment) return null;

  const getColor = (value: number) => {
    if (value <= 25) return 'bg-red-500';
    if (value <= 45) return 'bg-orange-500';
    if (value <= 55) return 'bg-yellow-500';
    if (value <= 75) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Market Sentiment</h3>
        <span className="text-sm text-gray-400">
          {new Date(sentiment.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Fear</span>
          <span>Greed</span>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sentiment.value}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${getColor(sentiment.value)}`}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold capitalize">
            {sentiment.sentiment}
          </span>
          <span className="text-2xl font-bold">
            {sentiment.value}
          </span>
        </div>
      </div>
    </div>
  );
}