import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import User from './pages/User';
import Merchant from './pages/Merchant';
import './App.css';
import { useAuth } from './lib/useAuth';
import { Loader } from './components/ui/Loader';
import AuthPage from './pages/AuthPage';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const { user, loading } = useAuth();

  return (
    <>
      {loading ? (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <Router>
          <div className="min-h-screen bg-[#FAFAFA]">
            <Navbar walletAddress={walletAddress} onConnect={setWalletAddress} />
            <Routes>
              {user ? (
                user.role === "user" ? (
                  <Route path="/" element={<User walletAddress={walletAddress} />} />
                ) : user.role === "merchant" ? (
                  <Route path="/" element={<Merchant walletAddress={walletAddress} />} />
                ) : (
                  <Route path="/" element={<Landing />} />
                )
              ) : (
                <Route path="/" element={<AuthPage />} />
              )}
              <Route path="/user" element={<User walletAddress={walletAddress} />} />
              <Route path="/merchant" element={<Merchant walletAddress={walletAddress} />} />
            </Routes>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
