import { motion } from 'framer-motion';

interface Props {
  message?: string;
}

export default function LoadingFallback({ message = 'Loading...' }: Props) {
  return (
    <div className="min-h-[200px] flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}