import { Link, useLocation } from 'react-router-dom';
import { Wallet, Sparkles, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import ConnectWallet from './ConnectWallet';
import { useAuth } from '../lib/useAuth.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ walletAddress, onConnect }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className={`pointer-events-auto flex items-center justify-between px-2 py-2 rounded-full transition-all duration-300 ease-in-out border
            ${scrolled
              ? 'bg-[#0B0B0D]/70 backdrop-blur-xl border-white/10 shadow-2xl w-[90%] max-w-5xl'
              : 'bg-transparent border-transparent w-full max-w-7xl'
            }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 pl-2 sm:pl-4 group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-purple-500/20`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:to-white transition-all">
              StellarPay
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-sm">
            {[
              { path: '/user', label: 'Dashboard' },
              { path: '/merchant', label: 'Merchant' }
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              >
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive(link.path) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 pr-1 sm:pr-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="hidden sm:flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full px-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            )}

            <div className="scale-95 sm:scale-100">
              <ConnectWallet onConnect={onConnect} address={walletAddress} />
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Bottom Nav for small screens */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <div className="bg-[#0B0B0D]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex justify-around items-center">
          <Link to="/user" className={`p-3 rounded-xl flex flex-col items-center gap-1 ${isActive('/user') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link to="/" className={`p-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 -mt-8`}>
            <Sparkles className="w-6 h-6" />
          </Link>
          <Link to="/merchant" className={`p-3 rounded-xl flex flex-col items-center gap-1 ${isActive('/merchant') ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500'}`}>
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-medium">Merchant</span>
          </Link>
        </div>
      </div>
    </>
  );
}
