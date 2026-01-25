import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import User from './pages/User';
import Merchant from './pages/Merchant';
import './App.css';
import { useAuth } from './lib/useAuth';
import { Loader } from './components/ui/Loader';
import AuthPage from './pages/AuthPage';
import { Toaster } from './components/ui/Toast';
import Footer from './components/Footer';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const { user, loading } = useAuth();

  // Clear wallet address when user logs out
  useEffect(() => {
    if (!user) {
      setWalletAddress(null);
    }
  }, [user]);

  const clearWallet = () => {
    setWalletAddress(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      {loading ? (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <Router>
          <div className="min-h-screen bg-[#FAFAFA]">
            <Navbar
              walletAddress={walletAddress}
              onConnect={setWalletAddress}
              onClearWallet={clearWallet}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={
                  user ? (
                    <Navigate to={user?.role === "user" ? "/user" : user?.role === "merchant" ? "/merchant" : "/"} replace />
                  ) : (
                    <AuthPage />
                  )
                }
              />

              {/* Protected Routes */}
              <Route
                path="/user"
                element={
                  user?.role === "user" ? (
                    <User walletAddress={walletAddress} onConnect={setWalletAddress} />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/merchant"
                element={
                  user?.role === "merchant" ? (
                    <Merchant walletAddress={walletAddress} onConnect={setWalletAddress} />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
            </Routes>
            <Footer />
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
