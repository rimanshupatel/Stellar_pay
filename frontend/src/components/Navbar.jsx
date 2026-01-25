import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import ConnectWallet from './ConnectWallet';

export default function Navbar({ walletAddress, onConnect }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
        scrolled
          ? 'glass rounded-2xl shadow-lg border-gray-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            StellarPay
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1 bg-gray-50/80 rounded-full px-1.5 py-1.5 border border-gray-200/60">
          <Link
            to="/user"
            className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/user')
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {isActive('/user') && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Pay</span>
          </Link>
          <Link
            to="/merchant"
            className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/merchant')
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {isActive('/merchant') && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Merchant</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <ConnectWallet onConnect={onConnect} address={walletAddress} />
        </div>
      </div>
    </motion.nav>
  );
}
