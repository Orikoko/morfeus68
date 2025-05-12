'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [riskPercentage, setRiskPercentage] = useState(2);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50"
          >
            <h2 className="text-xl font-semibold mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between">
                  <span>Notifications</span>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-teal-600' : 'bg-neutral-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>
              </div>

              <div>
                <label className="block mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-neutral-800 rounded-lg px-4 py-2"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Risk Percentage per Trade</label>
                <input
                  type="number"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(Number(e.target.value))}
                  className="w-full bg-neutral-800 rounded-lg px-4 py-2"
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50"
          >
            <h2 className="text-xl font-semibold mb-6">API Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2">API Key</label>
                <input
                  type="password"
                  className="w-full bg-neutral-800 rounded-lg px-4 py-2"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block mb-2">Webhook URL</label>
                <input
                  type="url"
                  className="w-full bg-neutral-800 rounded-lg px-4 py-2"
                  placeholder="https://"
                />
              </div>

              <button className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}