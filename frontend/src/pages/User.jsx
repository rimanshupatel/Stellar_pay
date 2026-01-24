import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { signTransaction } from '@stellar/freighter-api';
import { TransactionBuilder, Horizon, Asset, BASE_FEE, Operation } from '@stellar/stellar-sdk';
import {
    QrCode, Wallet, CheckCircle, XCircle,
    Clock, TrendingUp, Scan, X, AlertCircle, History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { STELLAR_CONFIG } from '../stellarConfig';
import { formatCurrency, formatCrypto, formatAddress, formatDate } from '../lib/utils';
import axios from 'axios';

const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function hasTrustline(account, asset) {
    if (asset.isNative()) return true;
    const code = asset.getCode();
    const issuer = asset.getIssuer();
    return account.balances.some(
        (b) =>
            (b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12") &&
            b.asset_code === code &&
            b.asset_issuer === issuer
    );
}

const BUSY_STATUSES = [
    "Building Transaction...",
    "Signing with Freighter...",
    "Submitting to Network...",
    "Adding USDC trustline...",
    "Preparing Transaction..."
];

export default function User({ walletAddress }) {
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState("");
    const [balance, setBalance] = useState({ xlm: '0', usdc: '0' });
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('pay');
    const isBusy = BUSY_STATUSES.includes(status);

    useEffect(() => {
        if (walletAddress) {
            loadBalance();
            loadTransactions();
        }
    }, [walletAddress]);

    const loadBalance = async () => {
        if (!walletAddress) return;
        try {
            const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
            const account = await server.loadAccount(walletAddress);
            const xlmBalance = account.balances.find(b => b.asset_type === 'native');
            const usdcBalance = account.balances.find(
                b => b.asset_code === 'USDC' && b.asset_issuer === STELLAR_CONFIG.assets.USDC.issuer
            );
            setBalance({
                xlm: xlmBalance?.balance || '0',
                usdc: usdcBalance?.balance || '0'
            });
        } catch (e) {
            console.error('Failed to load balance', e);
        }
    };

    const loadTransactions = async () => {
        if (!walletAddress) return;
        try {
            const res = await axios.get(`${API_URL}/transactions/${walletAddress}`);
            setTransactions(res.data || []);
        } catch (e) {
            console.error('Failed to load transactions', e);
        }
    };

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 300, height: 300 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    const parts = decodedText.split('|');
                    if (parts.length === 4) {
                        setScanResult({
                            merchant: parts[0],
                            amount: parts[1],
                            currency: parts[2],
                            refId: parts[3]
                        });
                        scanner.clear();
                        setScanning(false);
                    }
                },
                () => { }
            );

            return () => {
                scanner.clear().catch(() => { });
            };
        }
    }, [scanning]);

    const handlePay = async () => {
        if (!walletAddress) {
            alert("Connect Wallet first!");
            return;
        }

        setStatus("Building Transaction...");
        try {
            if (!scanResult.merchant || !scanResult.amount || !scanResult.currency) {
                throw new Error("Invalid payment details.");
            }

            if (!scanResult.merchant.startsWith('G') || scanResult.merchant.length !== 56) {
                throw new Error(`Invalid merchant address`);
            }

            const amount = parseFloat(scanResult.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error(`Invalid amount`);
            }

            const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
            const source = await server.loadAccount(walletAddress);

            let asset;
            if (scanResult.currency === 'USDC') {
                asset = new Asset(STELLAR_CONFIG.assets.USDC.code, STELLAR_CONFIG.assets.USDC.issuer);
                if (!hasTrustline(source, asset)) {
                    setStatus("Add a USDC trustline first using the button below.");
                    return;
                }
            } else {
                asset = Asset.native();
            }

            const tx = new TransactionBuilder(source, {
                fee: BASE_FEE,
                networkPassphrase: NETWORK_PASSPHRASE
            })
                .addOperation(Operation.payment({
                    destination: scanResult.merchant,
                    asset: asset,
                    amount: String(scanResult.amount)
                }))
                .setTimeout(30)
                .build();

            setStatus("Signing with Freighter...");
            const signedTx = await signTransaction(tx.toXDR(), {
                network: "TESTNET",
                networkPassphrase: NETWORK_PASSPHRASE
            });

            if (signedTx.error) {
                throw new Error(signedTx.error);
            }

            if (!signedTx.signedTxXdr) {
                throw new Error("Transaction signing failed");
            }

            setStatus("Submitting to Network...");
            const signedTransaction = TransactionBuilder.fromXDR(signedTx.signedTxXdr, NETWORK_PASSPHRASE);
            const result = await server.submitTransaction(signedTransaction);

            // Save to database
            try {
                await axios.post(`${API_URL}/transactions`, {
                    walletAddress,
                    merchantId: scanResult.merchant,
                    cryptoAmount: scanResult.amount,
                    currency: scanResult.currency,
                    inrAmount: parseFloat(scanResult.amount) * 80, // Mock conversion
                    status: 'success',
                    txHash: result.hash,
                    refId: scanResult.refId
                });
                loadTransactions();
            } catch (e) {
                console.error('Failed to save transaction', e);
            }

            setStatus("Payment Successful!");
            setTimeout(() => {
                setScanResult(null);
                setStatus("");
                loadBalance();
            }, 2000);

        } catch (e) {
            console.error("Payment error:", e);
            const errorMsg = e?.response?.data?.detail || e?.message || "Payment failed";
            setStatus(`Payment Failed: ${errorMsg}`);
        }
    };

    const handleAddUSDCTrustline = async () => {
        if (!walletAddress) {
            alert("Connect wallet first.");
            return;
        }
        setStatus("Adding USDC trustline...");
        try {
            const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
            const source = await server.loadAccount(walletAddress);
            const asset = new Asset(STELLAR_CONFIG.assets.USDC.code, STELLAR_CONFIG.assets.USDC.issuer);
            if (hasTrustline(source, asset)) {
                setStatus("");
                alert("You already have a USDC trustline.");
                return;
            }
            const tx = new TransactionBuilder(source, {
                fee: BASE_FEE,
                networkPassphrase: NETWORK_PASSPHRASE
            })
                .addOperation(Operation.changeTrust({ asset, limit: "1000000000" }))
                .setTimeout(30)
                .build();
            const signed = await signTransaction(tx.toXDR(), { network: "TESTNET", networkPassphrase: NETWORK_PASSPHRASE });
            if (signed.error) throw new Error(signed.error);
            if (!signed.signedTxXdr) throw new Error("No signed XDR");
            await server.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE));
            setStatus("");
            alert("USDC trustline added!");
            loadBalance();
        } catch (err) {
            const msg = err?.response?.data?.detail || err?.message || String(err);
            setStatus(`Failed: ${msg}`);
        }
    };

    if (!walletAddress) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <Card className="text-center">
                    <History className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <CardTitle>Connect Your Wallet</CardTitle>
                    <CardDescription className="mt-2">
                        Please connect your Stellar wallet to start making payments
                    </CardDescription>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">XLM Balance</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCrypto(balance.xlm, 'XLM')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">USDC Balance</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCrypto(balance.usdc, 'USDC')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Payments</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {transactions.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <History className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('pay')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'pay'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                >
                    Pay
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
                {activeTab === 'pay' && (
                    <motion.div
                        key="pay"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {!scanResult ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Scan QR Code to Pay</CardTitle>
                                    <CardDescription>Point your camera at the merchant's QR code</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {scanning ? (
                                        <div className="flex flex-col items-center">
                                            <div id="qr-reader" className="w-full max-w-md"></div>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setScanning(false);
                                                    const reader = document.getElementById('qr-reader');
                                                    if (reader) reader.innerHTML = '';
                                                }}
                                                className="mt-4"
                                            >
                                                Cancel Scan
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="w-64 h-64 rounded-2xl border-4 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                                <QrCode className="w-24 h-24 text-slate-400" />
                                            </div>
                                            <Button
                                                onClick={() => setScanning(true)}
                                                size="lg"
                                                className="flex items-center space-x-2"
                                            >
                                                <Scan className="w-5 h-5" />
                                                <span>Start QR Scanner</span>
                                            </Button>
                                            <Button
                                                onClick={() => setScanResult({
                                                    merchant: walletAddress,
                                                    amount: "1",
                                                    currency: "XLM",
                                                    refId: "demo_" + Date.now()
                                                })}
                                                variant="outline"
                                                size="lg"
                                            >
                                                Simulate Payment (Demo)
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Confirm Payment</CardTitle>
                                            <CardDescription>Review payment details before confirming</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setScanResult(null);
                                                setStatus("");
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 glass rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400">Merchant</span>
                                            <span className="font-mono text-sm">{formatAddress(scanResult.merchant)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 glass rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400">Amount</span>
                                            <span className="text-2xl font-bold">
                                                {formatCrypto(scanResult.amount, scanResult.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 glass rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400">Order ID</span>
                                            <span className="font-mono text-sm">{scanResult.refId}</span>
                                        </div>
                                    </div>

                                    {status && (
                                        <div className={`p-4 rounded-lg flex items-center space-x-3 ${status.includes('Successful')
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                            : status.includes('Failed') || status.includes('Failed')
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                            }`}>
                                            {isBusy ? (
                                                <Loader size="sm" />
                                            ) : status.includes('Successful') ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : status.includes('Failed') ? (
                                                <XCircle className="w-5 h-5" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5" />
                                            )}
                                            <span className="font-medium">{status}</span>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={handlePay}
                                            disabled={isBusy}
                                            size="lg"
                                            className="flex-1 flex items-center justify-center space-x-2"
                                        >
                                            {isBusy ? (
                                                <>
                                                    <Loader size="sm" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Confirm Payment</span>
                                                </>
                                            )}
                                        </Button>
                                        {scanResult?.currency === "USDC" && (
                                            <Button
                                                onClick={handleAddUSDCTrustline}
                                                disabled={status === "Adding USDC trustline..."}
                                                variant="outline"
                                                size="lg"
                                            >
                                                Add USDC Trustline
                                            </Button>
                                        )}
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
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>All your past payments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="w-16 h-16 mx-auto mb-4 text-slate-400" />
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
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {formatCrypto(tx.cryptoAmount, tx.currency)}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {formatCurrency(tx.inrAmount || 0)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                        {tx.txHash ? formatAddress(tx.txHash) : 'N/A'}
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
