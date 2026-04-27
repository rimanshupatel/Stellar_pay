import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
  QrCode, TrendingUp, DollarSign, Download,
  CheckCircle, Clock, XCircle, RefreshCw,
  BarChart as BarChartIcon, FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import ConnectWallet from '../components/ConnectWallet';
import { formatCurrency, formatCrypto, formatDate } from '../lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Merchant({ walletAddress, onConnect }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [order, setOrder] = useState(null);
  const [released, setReleased] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    pendingOrders: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (walletAddress) {
      loadTransactions();
      loadStats();
    }
  }, [walletAddress]);

  const loadTransactions = async () => {
    if (!walletAddress) return;
    try {
      const res = await axios.get(`${API_URL}/merchant/${walletAddress}/transactions`);
      setTransactions(res.data || []);
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  };

  const loadStats = async () => {
    if (!walletAddress) return;
    try {
      const res = await axios.get(`${API_URL}/merchant/${walletAddress}/stats`);
      if (res.data) {
        setStats(res.data);
      }
    } catch (e) {
      // Calculate from transactions if API fails
      const total = transactions.reduce((sum, tx) => sum + (tx.inrAmount || 0), 0);
      const today = transactions
        .filter(tx => {
          const txDate = new Date(tx.timestamp || tx.createdAt);
          const today = new Date();
          return txDate.toDateString() === today.toDateString();
        })
        .reduce((sum, tx) => sum + (tx.inrAmount || 0), 0);
      setStats({
        totalRevenue: total,
        todayRevenue: today,
        totalTransactions: transactions.length,
        pendingOrders: transactions.filter(tx => tx.status === 'pending').length
      });
    }
  };

  const generateQR = async () => {
    if (!walletAddress) {
      alert("Please connect wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

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
      loadTransactions();
      loadStats();
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = transactions
    .filter(tx => tx.status === 'success')
    .reduce((acc, tx) => {
      const date = formatDate(tx.timestamp || tx.createdAt).split(',')[0];
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += tx.inrAmount || 0;
        existing.count += 1;
      } else {
        acc.push({ date, revenue: tx.inrAmount || 0, count: 1 });
      }
      return acc;
    }, [])
    .slice(-7)
    .reverse();

  if (!walletAddress) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24">
        <Card className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription className="mt-3 mb-8">
            Connect your merchant wallet to start accepting payments. You'll need the Freighter wallet extension installed.
          </CardDescription>
          <div className="flex justify-center">
            <ConnectWallet onConnect={onConnect} address={null} />
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-900">Don't have Freighter?</strong>
            </p>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-900 hover:underline font-medium"
            >
              Install Freighter Wallet →
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-24 relative z-10">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-[-1] gradient-mesh opacity-60 pointer-events-none"></div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="glass-card card-hover border-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center justify-between relative z-10 p-1">
                    <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {formatCurrency(stats.totalRevenue)}
                    </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 transform group-hover:scale-110 transition-transform duration-500">
                    <DollarSign className="w-6 h-6 text-white" />
                    </div>
                </div>
            </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="glass-card card-hover border-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center justify-between relative z-10 p-1">
                    <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">Today's Revenue</p>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {formatCurrency(stats.todayRevenue)}
                    </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                </div>
            </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="glass-card card-hover border-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center justify-between relative z-10 p-1">
                    <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">Transactions</p>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {stats.totalTransactions}
                    </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 transform group-hover:scale-110 transition-transform duration-500">
                    <BarChartIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="glass-card card-hover border-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center justify-between relative z-10 p-1">
                    <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">Pending Orders</p>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {stats.pendingOrders}
                    </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 transform group-hover:scale-110 transition-transform duration-500">
                    <Clock className="w-6 h-6 text-white" />
                    </div>
                </div>
            </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100/80 rounded-full p-1.5 w-fit border border-gray-200/60">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'qr'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Generate QR
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Transaction History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                <CardDescription>Daily revenue and transaction count</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Revenue (INR)"
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Transactions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 text-gray-600">
                    No data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.slice(0, 5).length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No transactions yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx._id || tx.refId}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'error' : 'warning'}>
                              {tx.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {formatDate(tx.timestamp || tx.createdAt)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(tx.inrAmount || 0)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCrypto(tx.cryptoAmount, tx.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'qr' && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {!order ? (
              <Card>
                <CardHeader>
                  <CardTitle>Generate Payment QR Code</CardTitle>
                  <CardDescription>Enter amount and currency to create a payment request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="USDC">USDC (Testnet)</option>
                      <option value="XLM">XLM</option>
                    </select>
                  </div>
                  <Button onClick={generateQR} size="lg" className="w-full">
                    Generate QR Code
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment QR Code</CardTitle>
                      <CardDescription>Order ID: {order.refId}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOrder(null);
                        setAmount('');
                        setReleased(false);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="p-6 bg-white rounded-2xl shadow-xl">
                      <QRCode value={order.qrData} size={256} />
                    </div>
                    <div className="mt-6 text-center space-y-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCrypto(order.amount, order.currency)}
                      </p>
                      <p className="text-gray-600">
                        Order ID: {order.refId}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Instructions
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 leading-relaxed">
                      <li>Customer scans this QR code with their wallet</li>
                      <li>They confirm and approve the payment</li>
                      <li>Once payment is confirmed, release the local currency</li>
                    </ol>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleRelease}
                      disabled={released}
                      variant={released ? 'secondary' : 'primary'}
                      size="lg"
                      className="flex-1"
                    >
                      {released ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Released
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5 mr-2" />
                          Release Currency
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        const qr = document.querySelector('svg');
                        if (qr) {
                          const svgData = new XMLSerializer().serializeToString(qr);
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                            canvas.toBlob((blob) => {
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `payment-qr-${order.refId}.png`;
                              a.click();
                            });
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }
                      }}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All payment transactions</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csv = [
                        ['Date', 'Amount (INR)', 'Crypto Amount', 'Currency', 'Status', 'TX Hash'],
                        ...transactions.map(tx => [
                          formatDate(tx.timestamp || tx.createdAt),
                          tx.inrAmount || 0,
                          tx.cryptoAmount,
                          tx.currency,
                          tx.status,
                          tx.txHash || 'N/A'
                        ])
                      ].map(row => row.join(',')).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `transactions-${Date.now()}.csv`;
                      a.click();
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx._id || tx.refId}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'error' : 'warning'}>
                              {tx.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {formatDate(tx.timestamp || tx.createdAt)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(tx.inrAmount || 0)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCrypto(tx.cryptoAmount, tx.currency)}
                          </p>
                          {tx.txHash && (
                            <p className="text-xs font-mono text-gray-500 mt-1">
                              TX: {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Order: {tx.refId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
