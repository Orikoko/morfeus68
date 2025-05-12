'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process request');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl"
      >
        <div>
          <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>
          <p className="mt-2 text-center text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}

        {submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="bg-green-900/50 border border-green-800 text-green-300 p-4 rounded-lg">
              If an account exists with this email, you will receive reset instructions shortly.
            </div>
            <Link
              href="/login"
              className="block text-blue-400 hover:text-blue-300"
            >
              Return to login
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg text-white font-medium ${
                loading
                  ? 'bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Reset password'}
            </button>

            <div className="text-center text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}