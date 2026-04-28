import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, ChevronDown, User, Briefcase, Copy, Check, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';
import ConnectWallet from './ConnectWallet';
import { useAuth } from '../lib/useAuth';
import { formatAddress } from '../lib/utils';
import { toastConfig } from './ui/Toast';

export default function Navbar({ walletAddress, onConnect, onClearWallet }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    if (onClearWallet) {
      onClearWallet();
    }
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toastConfig.success('Wallet address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toastConfig.error('Failed to copy address');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-sm border-b border-gray-200/50'
          : 'bg-transparent'
          }`}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 sm:h-12">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 hover-scale">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                StellarPay
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-md rounded-full px-1.5 py-1.5 border border-gray-200/50 shadow-sm">
                <Link
                  to="/"
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/')
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {isActive('/') && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Home</span>
                </Link>
                {user?.role === "user" && <Link
                  to="/user"
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/user')
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
                </Link>}
                {user?.role === "merchant" && <Link
                  to="/merchant"
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/merchant')
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
                </Link>}
              </div>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200/80 shadow-sm transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                      {user.role === 'merchant' ? (
                        <Briefcase className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-premium border border-gray-200/60 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {walletAddress && (
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Wallet Address</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-mono text-gray-900 truncate flex-1">
                                {walletAddress}
                              </p>
                              <button
                                onClick={() => copyToClipboard(walletAddress)}
                                className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Copy address"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              {walletAddress && !user ? (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 soft-shadow group cursor-pointer" onClick={() => copyToClipboard(walletAddress)}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-mono text-gray-700">
                    {formatAddress(walletAddress)}
                  </span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ) : (
                !user && <ConnectWallet onConnect={onConnect} address={walletAddress} />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Premium Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 260
              }}
              className="
          fixed
          inset-y-0
          right-0
          z-50
          w-full
          max-w-sm
          md:hidden
          overflow-hidden
          border-l
          border-white/40
          bg-white/80
          backdrop-blur-3xl
          shadow-[0_20px_80px_rgba(0,0,0,0.15)]
        "
            >

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-gray-50/90" />

              {/* Floating Blur */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gray-200/40 rounded-full blur-3xl" />

              <div className="relative flex flex-col h-full p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900">
                      StellarPay
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Modern Crypto Payments
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="
                flex
                items-center
                justify-center
                w-11
                h-11
                rounded-2xl
                bg-white/70
                border
                border-gray-200/70
                shadow-md
                hover:scale-105
                hover:bg-white
                transition-all
                duration-300
              "
                  >
                    <X className="w-5 h-5 text-gray-900" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-3">

                  <Link
                    to="/"
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                px-5
                py-4
                text-base
                font-semibold
                transition-all
                duration-300
                ${isActive('/')
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md'
                      }
              `}
                  >
                    <span className="relative z-10">Home</span>
                  </Link>

                  <Link
                    to="/user"
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                px-5
                py-4
                text-base
                font-semibold
                transition-all
                duration-300
                ${isActive('/user')
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md'
                      }
              `}
                  >
                    <span className="relative z-10">Pay</span>
                  </Link>

                  <Link
                    to="/merchant"
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                px-5
                py-4
                text-base
                font-semibold
                transition-all
                duration-300
                ${isActive('/merchant')
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md'
                      }
              `}
                  >
                    <span className="relative z-10">Merchant</span>
                  </Link>
                </nav>

                {/* Bottom User Card */}
                {user && (
                  <div className="mt-auto">

                    <div
                      className="
                  rounded-3xl
                  border
                  border-white/60
                  bg-white/70
                  backdrop-blur-2xl
                  p-5
                  shadow-xl
                  mb-5
                "
                    >
                      <div className="flex items-center gap-4">

                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white font-bold text-lg shadow-lg">
                          {user?.name?.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-base font-bold text-gray-900 truncate">
                            {user.name}
                          </p>

                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="
                  w-full
                  rounded-2xl
                  py-6
                  bg-red-50
                  border
                  border-red-100
                  text-red-600
                  hover:bg-red-100
                  hover:border-red-200
                  transition-all
                  duration-300
                "
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
