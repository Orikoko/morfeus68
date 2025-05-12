'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';
import RecapArchive from '../components/RecapArchive';

export default function Recaps() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Session Recaps</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RecapArchive />
        </motion.div>
      </div>
    </div>
  );
}