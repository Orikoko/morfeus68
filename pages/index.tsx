'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import VoiceInput from '../components/VoiceInput';
import RecapModal from '../components/RecapModal';
import SessionRecap from '../components/SessionRecap';
import PairCard from '../components/PairCard';
import SentimentMeter from '../components/SentimentMeter';
import MobileNav from '../components/MobileNav';
import Navigation from '../components/Navigation';
import { setAutoTrade, getAutoTradeEnabled } from '../lib/settings';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface FXPair {
  pair: string;
  region: 'Asia' | 'Europe' | 'North America';
}

export default function MorfeusInterface() {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPair, setCurrentPair] = useState('EUR/USD');
  const [autoTradeEnabled, setAutoTradeEnabledState] = useState(false);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { displayedText, isComplete } = useTypingEffect(
    messages[messages.length - 1]?.type === 'ai' ? messages[messages.length - 1].content : '',
    30
  );

  const [pairs] = useState<FXPair[]>([
    // Asia Region
    { pair: 'USD/JPY', region: 'Asia' },
    { pair: 'AUD/USD', region: 'Asia' },
    { pair: 'NZD/USD', region: 'Asia' },
    { pair: 'AUD/JPY', region: 'Asia' },
    { pair: 'NZD/JPY', region: 'Asia' },
    { pair: 'AUD/NZD', region: 'Asia' },

    // Europe Region
    { pair: 'EUR/USD', region: 'Europe' },
    { pair: 'GBP/USD', region: 'Europe' },
    { pair: 'EUR/CHF', region: 'Europe' },
    { pair: 'GBP/CHF', region: 'Europe' },
    { pair: 'EUR/GBP', region: 'Europe' },
    { pair: 'USD/CHF', region: 'Europe' },

    // North America Region
    { pair: 'USD/CAD', region: 'North America' },
    { pair: 'EUR/CAD', region: 'North America' },
    { pair: 'GBP/CAD', region: 'North America' },
    { pair: 'CAD/JPY', region: 'North America' },
    { pair: 'AUD/CAD', region: 'North America' },
    { pair: 'NZD/CAD', region: 'North America' }
  ]);

  useEffect(() => {
    setAutoTradeEnabledState(getAutoTradeEnabled());
  }, []);

  const handleAutoTradeToggle = () => {
    const newState = !autoTradeEnabled;
    setAutoTradeEnabledState(newState);
    setAutoTrade(newState);
  };

  const handleExport = async (format: 'pdf' | 'markdown') => {
    try {
      setExportLoading(true);
      const response = await fetch('/api/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          grid: messages
            .filter(m => m.type === 'ai')
            .map(m => ({
              pair: currentPair,
              edge_score: 75,
              label: 'trend',
              summary: m.content,
              timestamp: new Date().toISOString()
            })),
          history: messages.map(m => ({
            timestamp: new Date().toISOString(),
            message: m.content,
            type: m.type
          }))
        })
      });

      const data = await response.json();

      if (format === 'pdf') {
        window.open(data.url, '_blank');
      } else {
        const blob = new Blob([data.content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `morfeus-session-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const filteredPairs = pairs.filter(pair => {
    const matchesSearch = pair.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || pair.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const groupedPairs = filteredPairs.reduce((acc, pair) => {
    if (!acc[pair.region]) {
      acc[pair.region] = [];
    }
    acc[pair.region].push(pair);
    return acc;
  }, {} as Record<string, FXPair[]>);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: command }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/command-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'ai', content: data.response }]);

      if (data.action) {
        switch (data.action.type) {
          case 'getBias':
            setCurrentPair(data.action.data.pair);
            break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'ai', content: 'Failed to process command' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  const handleVoiceResult = (transcript: string) => {
    handleCommand(transcript);
  };

  const handleVoiceError = (error: string) => {
    setMessages(prev => [...prev, { type: 'ai', content: `Voice Error: ${error}` }]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Updated Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Morfeus</h1>
          <Navigation />
          <MobileNav />
        </header>

        {/* Auto-Trade Toggle */}
        <div className="mb-6 flex items-center justify-between backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-4 border border-neutral-800/50">
          <div>
            <h3 className="text-lg font-semibold">Auto-Trading</h3>
            <p className="text-sm text-gray-400">Automatically execute trades when edge score ≥ 75%</p>
          </div>
          <button
            onClick={handleAutoTradeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoTradeEnabled ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoTradeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <SessionRecap />
          </div>
          <div>
            <SentimentMeter />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search pairs (e.g., USD, EUR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Regions</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
          </select>
        </div>

        {/* Currency Pairs Grid */}
        <div className="space-y-8">
          {Object.entries(groupedPairs).map(([region, pairs]) => (
            <motion.div
              key={region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50"
            >
              <h3 className="text-xl font-semibold mb-4">{region} Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pairs.map((pair, index) => (
                  <motion.div
                    key={pair.pair}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="transition duration-300 hover:shadow-[0_0_20px_#14b8a6]"
                  >
                    <PairCard
                      pair={pair.pair}
                      onClick={() => setCurrentPair(pair.pair)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Command Interface */}
        <div className="mt-8 backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={isLoading ? {
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              } : {
                scale: 1,
                opacity: 0.4
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-5xl font-black bg-gradient-to-r from-red-600 via-pink-500 to-red-700 text-transparent bg-clip-text"
            >
              M
            </motion.div>
          </div>

          <div className="space-y-4 mb-4 h-48 overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'user' ? (
                  <div className="bg-blue-600 rounded-lg p-3 max-w-[80%]">
                    {message.content}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-green-400 italic border-l-4 border-teal-600 bg-black/30 rounded-lg p-3 max-w-[80%] backdrop-blur-sm"
                  >
                    {message === messages[messages.length - 1]
                      ? displayedText
                      : message.content}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {messages.length > 0 && messages[messages.length - 1].type === 'ai' && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
                className="bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-2 font-medium shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('markdown')}
                disabled={exportLoading}
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md px-4 py-2 font-medium shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Export as Markdown
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a command (e.g., 'show bias for USDJPY')..."
              className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <VoiceInput
              onResult={handleVoiceResult}
              onError={handleVoiceError}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isLoading 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>

        <RecapModal
          show={isRecapModalOpen}
          onClose={() => setIsRecapModalOpen(false)}
        />
      </div>
    </div>
  );
}