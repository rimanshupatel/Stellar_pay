import React, { useState } from 'react';
import QRCode from 'react-qr-code';

// Mock backend URL if not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Merchant = ({ walletAddress }) => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USDC');
    const [order, setOrder] = useState(null);
    const [released, setReleased] = useState(false);

    const generateQR = async () => {
        if (!walletAddress) {
            alert("Please connect wallet first (to receive funds)");
            return;
        }

        // Call backend to create order
        try {
            const res = await fetch(`${API_URL}/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantAddress: walletAddress,
                    amount,
                    currency
                })
            });
            const data = await res.json();
            setOrder(data);
            setReleased(false);
        } catch (e) {
            console.error(e);
            alert("Failed to generate QR");
        }
    };

    const handleRelease = async () => {
        if (!order) return;
        try {
            await fetch(`${API_URL}/release-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refId: order.refId })
            });
            setReleased(true);
            alert("Currency Released to User!");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Merchant Dashboard</h1>

            {!order ? (
                <div className="card">
                    <h3>New Payment Request</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Amount:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="10.00"
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Currency:</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value)}>
                            <option value="USDC">USDC (Testnet)</option>
                            <option value="XLM">XLM</option>
                        </select>
                    </div>
                    <button onClick={generateQR}>Generate Release QR</button>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>Scan to Pay</h3>
                    <div style={{ background: 'white', padding: '16px', display: 'inline-block' }}>
                        <QRCode value={order.qrData} size={256} />
                    </div>
                    <p>Order ID: {order.refId}</p>
                    <p>Ask user to scan this code.</p>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <h4>Actions</h4>
                        <p>Once you verify payment (e.g. check your wallet), release the cash.</p>
                        <button
                            onClick={handleRelease}
                            style={{ background: released ? 'grey' : 'blue', color: 'white', fontSize: '1.2rem' }}
                            disabled={released}
                        >
                            {released ? "Released" : "Release Local Currency"}
                        </button>
                    </div>

                    <button onClick={() => setOrder(null)} style={{ marginTop: '1rem', background: 'transparent', color: 'black' }}>
                        Create New Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default Merchant;
