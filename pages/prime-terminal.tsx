'use client';

import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';

export default function PrimeTerminal() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Prime Market Terminal</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-8 border border-neutral-800/50 text-center"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-400">
            Our advanced market analysis terminal is currently in development.
            Stay tuned for powerful new features and insights.
          </p>
        </motion.div>
      </div>
    </div>
  );
}