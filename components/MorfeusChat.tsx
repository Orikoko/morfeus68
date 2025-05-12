import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function MorfeusChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Analysis for your query: "${input}"\n\nBased on current market conditions and technical analysis, the outlook appears bullish with strong momentum indicators supporting this view.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="terminal-cell h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="terminal-header">Morfeus AI Terminal</h2>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-2 w-2 rounded-full bg-[var(--terminal-green)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-terminal mb-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-[var(--terminal-blue)] text-white'
                    : 'bg-[var(--terminal-gray)] text-[var(--terminal-text)]'
                }`}
              >
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {message.content}
                </pre>
                <div className="mt-1 text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[var(--terminal-gray)] rounded-lg p-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex space-x-2"
              >
                <span className="w-2 h-2 bg-[var(--terminal-blue)] rounded-full" />
                <span className="w-2 h-2 bg-[var(--terminal-blue)] rounded-full" />
                <span className="w-2 h-2 bg-[var(--terminal-blue)] rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about market analysis, trends, or specific pairs..."
          className="flex-1 bg-[var(--terminal-gray)] text-[var(--terminal-text)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--terminal-blue)]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            isLoading || !input.trim()
              ? 'bg-[var(--terminal-gray)] cursor-not-allowed'
              : 'bg-[var(--terminal-blue)] hover:bg-[var(--terminal-blue)]/80'
          }`}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Processing...
            </>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
}