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
import { formatCurrency, formatCrypto, formatDate } from '../lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Merchant({ walletAddress }) {
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
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription className="mt-2">
            Connect your merchant wallet to start accepting payments
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Today's Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <BarChartIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'dashboard'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'qr'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          Generate QR
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'history'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="date" className="text-slate-600 dark:text-slate-400" />
                      <YAxis className="text-slate-600 dark:text-slate-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
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
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400">
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
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    No transactions yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx._id || tx.refId}
                        className="p-4 glass rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'error' : 'warning'}>
                              {tx.status}
                            </Badge>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(tx.timestamp || tx.createdAt)}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(tx.inrAmount || 0)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCrypto(order.amount, order.currency)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Order ID: {order.refId}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Instructions
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
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
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx._id || tx.refId}
                        className="p-4 glass rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'error' : 'warning'}>
                              {tx.status}
                            </Badge>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(tx.timestamp || tx.createdAt)}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white text-lg">
                            {formatCurrency(tx.inrAmount || 0)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatCrypto(tx.cryptoAmount, tx.currency)}
                          </p>
                          {tx.txHash && (
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                              TX: {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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
