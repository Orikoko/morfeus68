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

  useEffect(() => {
    // Simulate data for demo
    setSentiment({
      sentiment: 'Neutral',
      value: 55,
      timestamp: new Date().toISOString()
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="terminal-cell animate-pulse">
        <div className="h-4 bg-[var(--terminal-gray)] rounded w-1/3 mb-4" />
        <div className="h-2 bg-[var(--terminal-gray)] rounded w-full" />
      </div>
    );
  }

  if (!sentiment) return null;

  const getColor = (value: number) => {
    if (value <= 25) return 'bg-[var(--terminal-red)]';
    if (value <= 45) return 'bg-[var(--terminal-yellow)]';
    if (value <= 55) return 'bg-[var(--terminal-blue)]';
    return 'bg-[var(--terminal-green)]';
  };

  const getLabel = (value: number) => {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 45) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
  };

  return (
    <div className="terminal-cell">
      <div className="flex justify-between items-center mb-6">
        <h3 className="terminal-header">Market Risk Sentiment</h3>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-2 w-2 rounded-full bg-[var(--terminal-green)]"
        />
      </div>

      <div className="space-y-6">
        {/* Main Gauge */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span>Fear</span>
            <span>Greed</span>
          </div>
          <div className="indicator-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sentiment.value}%` }}
              transition={{ duration: 1 }}
              className={`indicator-progress ${getColor(sentiment.value)}`}
            />
          </div>
        </div>

        {/* Value Display */}
        <div className="flex justify-between items-baseline">
          <div>
            <div className="text-2xl font-bold">{sentiment.value}</div>
            <div className="text-sm text-[var(--terminal-text)]/60">
              {getLabel(sentiment.value)}
            </div>
          </div>
          <div className={`text-lg ${getColor(sentiment.value).replace('bg-', 'text-')}`}>
            {sentiment.sentiment}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="terminal-cell">
            <div className="text-xs text-[var(--terminal-text)]/60 mb-1">Volatility</div>
            <div className="indicator-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(sentiment.value, 100)}%` }}
                className={`indicator-progress ${getColor(sentiment.value)}`}
              />
            </div>
          </div>
          
          <div className="terminal-cell">
            <div className="text-xs text-[var(--terminal-text)]/60 mb-1">Momentum</div>
            <div className="indicator-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs((sentiment.value - 50) * 2)}%` }}
                className={`indicator-progress ${getColor(sentiment.value)}`}
              />
            </div>
          </div>
          
          <div className="terminal-cell">
            <div className="text-xs text-[var(--terminal-text)]/60 mb-1">Market Depth</div>
            <div className="indicator-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${75}%` }}
                className={`indicator-progress ${getColor(sentiment.value)}`}
              />
            </div>
          </div>
        </div>

        {/* Time Context */}
        <div className="text-xs text-[var(--terminal-text)]/60 text-right">
          Last updated: {new Date(sentiment.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}