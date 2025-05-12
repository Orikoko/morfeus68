'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'login' | 'signup';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `${activeTab === 'login' ? 'Login' : 'Signup'} failed`);
      }

      if (activeTab === 'login') {
        router.push('/dashboard');
      } else {
        setSuccessMessage('Account created successfully! Please log in.');
        setActiveTab('login');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-xl p-8 shadow-xl"
        >
          {/* Tab Navigation */}
          <div className="flex mb-8 bg-gray-800 rounded-lg p-1">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-red-900/50 border border-red-800 text-red-300 p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-green-900/50 border border-green-800 text-green-300 p-3 rounded-lg"
            >
              {successMessage}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {activeTab === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  loading
                    ? 'bg-blue-800 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading
                  ? activeTab === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : activeTab === 'login'
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}