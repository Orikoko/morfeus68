import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const isActive = (path: string) => router.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/recaps', label: 'Recaps' },
    { path: '/trade-log', label: 'Trade Log' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <div className="md:hidden relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-0.5 bg-current mb-1 transition-all" />
        <div className="w-6 h-0.5 bg-current mb-1 transition-all" />
        <div className="w-6 h-0.5 bg-current transition-all" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 bg-neutral-900 rounded-xl shadow-lg p-4 w-56 backdrop-blur-sm border border-neutral-800/50"
          >
            <nav className="flex flex-col gap-2">
              {menuItems.map(({ path, label }) => (
                <motion.div
                  key={path}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={path}
                    className={`block px-4 py-2 rounded-lg w-full transition-all duration-200 ${
                      isActive(path)
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                        : 'hover:bg-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}