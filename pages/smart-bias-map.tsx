'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SmartBiasMap() {
  const [currencies] = useState([
    { name: 'USD', strength: 85 },
    { name: 'EUR', strength: 65 },
    { name: 'GBP', strength: 45 },
    { name: 'JPY', strength: 75 },
    { name: 'AUD', strength: 55 },
    { name: 'NZD', strength: 40 },
    { name: 'CAD', strength: 60 }
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Morfeus</h1>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/trade-log" className="text-gray-300 hover:text-white">Trade Log</Link>
            <Link href="/smart-bias-map" className="text-white">Smart Bias Map</Link>
            <Link href="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          </nav>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Currency Strength Map</h2>
            <div className="space-y-4">
              {currencies.map((currency) => (
                <div key={currency.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{currency.name}</span>
                    <span>{currency.strength}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currency.strength}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-teal-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Correlation Matrix</h2>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {['', ...currencies.map(c => c.name)].map((header, i) => (
                <div key={i} className="font-semibold">{header}</div>
              ))}
              {currencies.map((currency, i) => (
                <>
                  <div key={`${currency.name}-header`} className="font-semibold">
                    {currency.name}
                  </div>
                  {currencies.map((_, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`h-8 rounded ${
                        i === j ? 'bg-gray-800' :
                        Math.random() > 0.5 ? 'bg-green-900/50' : 'bg-red-900/50'
                      }`}
                    />
                  ))}
                </>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}