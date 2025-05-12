'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getRecaps } from '../lib/recaps';

interface RecapModalProps {
  show: boolean;
  onClose: () => void;
}

export default function RecapModal({ show, onClose }: RecapModalProps) {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'pdf'>('pdf');

  if (!show) return null;

  const recaps = getRecaps();

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: exportFormat,
          recaps
        })
      });

      const data = await response.json();

      if (exportFormat === 'pdf') {
        // Open PDF in new tab
        window.open(data.url, '_blank');
      } else {
        // Download markdown file
        const blob = new Blob([data.content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-recaps-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Daily Session Recaps</h2>
          <div className="flex items-center gap-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'markdown' | 'pdf')}
              className="bg-gray-800 rounded-lg px-3 py-1 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="markdown">Markdown</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recaps.map((recap) => (
            <div
              key={`${recap.date}-${recap.session}`}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {recap.session.toUpperCase()} Session
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  recap.regime === 'trend' ? 'bg-green-900/50 text-green-300' :
                  recap.regime === 'range' ? 'bg-blue-900/50 text-blue-300' :
                  'bg-purple-900/50 text-purple-300'
                }`}>
                  {recap.regime}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Top Pairs</h4>
                  <div className="space-y-2">
                    {recap.topPairs.map((pair) => (
                      <div key={pair.pair} className="flex justify-between items-center">
                        <span className="font-medium">{pair.pair}</span>
                        <span className={pair.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {pair.change >= 0 ? '+' : ''}{pair.change}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Summary</h4>
                  <p className="text-sm text-gray-300">{recap.summary}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Macro Notes</h4>
                  <p className="text-sm text-gray-300">{recap.macroNotes}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Volatility</h4>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${recap.volatility}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}