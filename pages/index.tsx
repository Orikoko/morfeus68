import { motion } from 'framer-motion';
import MorfeusChat from '../components/MorfeusChat';
import SessionRecap from '../components/SessionRecap';
import SentimentMeter from '../components/SentimentMeter';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--terminal-black)] text-[var(--terminal-text)] p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <SessionRecap />
            <SentimentMeter />
          </div>
          <div>
            <MorfeusChat />
          </div>
        </div>
      </div>
    </div>
  );
}