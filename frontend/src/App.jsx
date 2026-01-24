import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import User from './pages/User';
import Merchant from './pages/Merchant';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar walletAddress={walletAddress} onConnect={setWalletAddress} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/user" element={<User walletAddress={walletAddress} />} />
          <Route path="/merchant" element={<Merchant walletAddress={walletAddress} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
