import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Merchant from './pages/Merchant';
import User from './pages/User';
import ConnectWallet from './components/ConnectWallet';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
            <Link to="/merchant" style={{ marginRight: '1rem' }}>Merchant</Link>
            <Link to="/user">User</Link>
          </div>
          <ConnectWallet onConnect={setWalletAddress} address={walletAddress} />
        </nav>

        <main style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ textAlign: 'center' }}>
                <h1>Stellar Soroban Payment App</h1>
                <p>Select your role:</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                  <Link to="/merchant" className="card">
                    <h2>Merchant</h2>
                    <p>Generate QR & Receive Payments</p>
                  </Link>
                  <Link to="/user" className="card">
                    <h2>User</h2>
                    <p>Scan QR & Pay with Wallet</p>
                  </Link>
                </div>
              </div>
            } />
            <Route path="/merchant" element={<Merchant walletAddress={walletAddress} />} />
            <Route path="/user" element={<User walletAddress={walletAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
