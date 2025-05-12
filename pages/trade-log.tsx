'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TradeLog() {
  const [trades] = useState([
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'LONG',
      entry: 1.0980,
      exit: 1.1130,
      pnl: '+150 pips',
      date: '2025-02-20',
      status: 'closed'
    },
    {
      id: 2,
      pair: 'GBP/USD',
      type: 'SHORT',
      entry: 1.2650,
      exit: 1.2500,
      pnl: '+150 pips',
      date: '2025-02-19',
      status: 'closed'
    },
    {
      id: 3,
      pair: 'USD/JPY',
      type: 'LONG',
      entry: 150.50,
      exit: null,
      pnl: 'Open',
      date: '2025-02-18',
      status: 'open'
    }
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Morfeus</h1>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/trade-log" className="text-white">Trade Log</Link>
            <Link href="/smart-bias-map" className="text-gray-300 hover:text-white">Smart Bias Map</Link>
            <Link href="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          </nav>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Trade History</h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-500">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
                New Trade
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Pair</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Entry</th>
                  <th className="py-3 px-4">Exit</th>
                  <th className="py-3 px-4">P/L</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-3 px-4">{trade.date}</td>
                    <td className="py-3 px-4">{trade.pair}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded ${
                        trade.type === 'LONG' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.entry}</td>
                    <td className="py-3 px-4">{trade.exit || '-'}</td>
                    <td className="py-3 px-4">{trade.pnl}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded ${
                        trade.status === 'open' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}