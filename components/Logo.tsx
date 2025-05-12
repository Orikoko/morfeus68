import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-4"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-teal-400 to-blue-600 text-transparent bg-clip-text inline-block">
        MORFEUS PRO
      </h1>
      <div className="h-0.5 w-24 mx-auto mt-2 bg-gradient-to-r from-blue-500/20 via-teal-400/20 to-blue-600/20" />
    </motion.div>
  );
}