import { motion } from 'framer-motion';
import RealTimePrice from './RealTimePrice';
import TechnicalIndicators from './TechnicalIndicators';

interface Props {
  pair: string;
  onClick?: () => void;
}

export default function PairCard({ pair, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50 hover:border-teal-500/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-teal-500/10"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold group-hover:text-teal-400 transition-colors">
          {pair}
        </h3>
        <RealTimePrice pair={pair} />
      </div>

      <TechnicalIndicators pair={pair} />
    </motion.button>
  );
}