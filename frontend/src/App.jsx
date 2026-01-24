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
      {loading ? <Loader /> :
        (
          <>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <Navbar walletAddress={walletAddress} onConnect={setWalletAddress} />
                <Routes>
                  {user ? user.role === "user" ?
                    <Route path="/" element={<User walletAddress={walletAddress} />} />
                    :
                    user.role === "merchant" ?
                      <Route path="/" element={<Merchant walletAddress={walletAddress} />} />
                      :
                      <Route path="/" element={<Landing />} />
                    :
                    <Route path="/" element={<AuthPage />} />

                  }
                </Routes>
              </div>
            </Router>
          </>
        )
      }
    </>
  );
}

export default App;
