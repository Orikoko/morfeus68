'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SessionRecap from '../components/SessionRecap';
import SentimentMeter from '../components/SentimentMeter';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
          router.replace('/auth');
        }
      } catch (error) {
        router.replace('/auth');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <SessionRecap />
          </div>
          <div>
            <SentimentMeter />
          </div>
        </div>
      </div>
    </div>
  );
}