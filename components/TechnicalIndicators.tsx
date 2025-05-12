import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  pair: string;
}

interface Indicators {
  rsi: number;
  macd: {
    histogram: number;
    signal: number;
    value: number;
  };
  ma: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
}

export default function TechnicalIndicators({ pair }: Props) {
  const [data, setData] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIndicators() {
      try {
        const response = await fetch(`/api/technical-indicators?pair=${pair.replace('/', '')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch indicators');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load indicators');
      } finally {
        setLoading(false);
      }
    }

    fetchIndicators();
  }, [pair]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-800 rounded w-2/3" />
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
      className="space-y-4"
    >
      <div>
        <div className="text-sm text-gray-400 mb-1">RSI</div>
        <div className="flex items-center gap-2">
          <div className="flex-grow h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.rsi}%` }}
              className={`h-full ${
                data.rsi > 70 ? 'bg-red-500' :
                data.rsi < 30 ? 'bg-green-500' :
                'bg-blue-500'
              }`}
            />
          </div>
          <span className="text-sm font-medium">{data.rsi.toFixed(1)}</span>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">MACD</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-gray-400">Value</div>
            <div className={data.macd.value >= 0 ? 'text-green-400' : 'text-red-400'}>
              {data.macd.value.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Signal</div>
            <div>{data.macd.signal.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-gray-400">Histogram</div>
            <div className={data.macd.histogram >= 0 ? 'text-green-400' : 'text-red-400'}>
              {data.macd.histogram.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-1">Moving Averages</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-gray-400">MA20</div>
            <div>{data.ma.ma20.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-gray-400">MA50</div>
            <div>{data.ma.ma50.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-gray-400">MA200</div>
            <div>{data.ma.ma200.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}