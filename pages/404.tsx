import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl text-center"
      >
        <div className="space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-500 via-teal-400 to-blue-600 text-transparent bg-clip-text">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}