import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function Navigation() {
  const router = useRouter();
  
  const isActive = (path: string) => router.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/recaps', label: 'Recaps' },
    { path: '/trade-log', label: 'Trade Log' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <nav className="hidden md:flex gap-4">
      {menuItems.map(({ path, label }) => (
        <motion.div
          key={path}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={path}
            className={`block px-4 py-2 rounded-md transition-all duration-200 ${
              isActive(path)
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                : 'bg-neutral-800 hover:bg-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20'
            }`}
          >
            {label}
          </Link>
        </motion.div>
      ))}
    </nav>
  );
}