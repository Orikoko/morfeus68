import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PriceData {
  price: number;
  change: number;
  volume: number;
  timestamp: string;
}

interface Props {
  pair: string;
  refreshInterval?: number;
}

export default function RealTimePrice({ pair, refreshInterval = 5000 }: Props) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    async function fetchPrice() {
      try {
        const response = await fetch('/api/fx-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pairs: [pair.replace('/', '')] })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }

        const result = await response.json();
        if (mounted && result.prices[0]) {
          setData(result.prices[0]);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load price');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPrice();
    intervalId = setInterval(fetchPrice, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [pair, refreshInterval]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-24 mb-2" />
        <div className="h-4 bg-neutral-800 rounded w-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-1"
    >
      <motion.div 
        className="text-2xl font-bold"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
        key={data.price}
      >
        {data.price.toFixed(4)}
      </motion.div>
      <div className={`text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
        {data.volume > 0 && (
          <span className="text-gray-400 ml-2">
            Vol: {data.volume.toLocaleString()}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
}