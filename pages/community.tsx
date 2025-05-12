import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import MobileNav from '../components/MobileNav';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isPremium: boolean;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  isPremium: boolean;
  lastSeen?: Date;
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      username: 'JohnTrader',
      avatar: 'https://i.pravatar.cc/150?u=1',
      content: 'EUR/USD showing strong momentum on the 4H timeframe',
      timestamp: new Date(),
      isPremium: true
    },
    {
      id: '2',
      userId: '2',
      username: 'MarketPro',
      avatar: 'https://i.pravatar.cc/150?u=2',
      content: 'Anyone watching the USD/JPY breakout?',
      timestamp: new Date(Date.now() - 300000),
      isPremium: true
    }
  ]);

  const [users] = useState<User[]>([
    {
      id: '1',
      username: 'JohnTrader',
      avatar: 'https://i.pravatar.cc/150?u=1',
      status: 'online',
      isPremium: true
    },
    {
      id: '2',
      username: 'MarketPro',
      avatar: 'https://i.pravatar.cc/150?u=2',
      status: 'online',
      isPremium: true
    },
    {
      id: '3',
      username: 'TechAnalyst',
      avatar: 'https://i.pravatar.cc/150?u=3',
      status: 'away',
      isPremium: true,
      lastSeen: new Date(Date.now() - 900000)
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  const channels = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'technical', name: 'Technical Analysis', unread: 2 },
    { id: 'fundamental', name: 'Fundamental', unread: 5 },
    { id: 'news', name: 'Market News', unread: 0 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      username: 'JohnTrader',
      avatar: 'https://i.pravatar.cc/150?u=1',
      content: input,
      timestamp: new Date(),
      isPremium: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[var(--terminal-black)] text-[var(--terminal-text)]">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">Community Chat</h1>
          <div className="flex items-center gap-4">
            <Navigation />
            <MobileNav />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-5rem)]">
          {/* Channels Sidebar */}
          <div className="col-span-2 terminal-cell">
            <h2 className="terminal-header mb-4">Channels</h2>
            <div className="space-y-2">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    selectedChannel === channel.id
                      ? 'bg-[var(--terminal-blue)]'
                      : 'hover:bg-[var(--terminal-gray)]'
                  }`}
                >
                  <span>{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="bg-[var(--terminal-red)] text-white text-xs px-2 py-0.5 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-7 terminal-cell flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-terminal space-y-4 mb-4">
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-start gap-3 p-3 hover:bg-[var(--terminal-gray)] rounded-lg"
                  >
                    <img
                      src={message.avatar}
                      alt={message.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{message.username}</span>
                        {message.isPremium && (
                          <span className="text-xs bg-[var(--terminal-yellow)] text-black px-1.5 py-0.5 rounded">
                            PRO
                          </span>
                        )}
                        <span className="text-xs text-[var(--terminal-text)]/60">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[var(--terminal-gray)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--terminal-blue)]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-2 bg-[var(--terminal-blue)] rounded-lg hover:bg-[var(--terminal-blue)]/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>

          {/* Users Sidebar */}
          <div className="col-span-3 terminal-cell">
            <h2 className="terminal-header mb-4">Online Users</h2>
            <div className="space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-[var(--terminal-gray)] rounded-lg"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--terminal-dark)] ${
                        user.status === 'online'
                          ? 'bg-[var(--terminal-green)]'
                          : user.status === 'away'
                          ? 'bg-[var(--terminal-yellow)]'
                          : 'bg-[var(--terminal-gray)]'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.username}</span>
                      {user.isPremium && (
                        <span className="text-xs bg-[var(--terminal-yellow)] text-black px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                    </div>
                    {user.status === 'away' && user.lastSeen && (
                      <p className="text-xs text-[var(--terminal-text)]/60">
                        Last seen: {user.lastSeen.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}