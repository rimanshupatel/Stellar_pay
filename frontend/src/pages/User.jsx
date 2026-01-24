import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { signTransaction } from '@stellar/freighter-api';
import { TransactionBuilder, Networks, Horizon, Asset, BASE_FEE, Operation, ScVal, Address, Int128, nativeToScVal, xdr } from '@stellar/stellar-sdk';

import { STELLAR_CONFIG } from '../stellarConfig';

const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

// Check if account has a trustline for the given asset
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

const User = ({ walletAddress }) => {
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState("");
    const isBusy = BUSY_STATUSES.includes(status);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
            );

            scanner.render((decodedText) => {
                // Format: merchantAddress|amount|currency|refId
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
            }, () => {
                // Error handler - errors are silently ignored
            });

            return () => {
                scanner.clear().catch(e => console.error(e));
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
            // Validate inputs
            if (!scanResult.merchant || !scanResult.amount || !scanResult.currency) {
                throw new Error("Invalid payment details. Please scan the QR code again.");
            }

            // Validate merchant address format (Stellar addresses start with G)
            if (!scanResult.merchant.startsWith('G') || scanResult.merchant.length !== 56) {
                throw new Error(`Invalid merchant address: ${scanResult.merchant}`);
            }

            // Validate amount
            const amount = parseFloat(scanResult.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error(`Invalid amount: ${scanResult.amount}`);
            }

            const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
            const source = await server.loadAccount(walletAddress);

            // Determine Asset
            let asset;
            if (scanResult.currency === 'USDC') {
                asset = new Asset(STELLAR_CONFIG.assets.USDC.code, STELLAR_CONFIG.assets.USDC.issuer);
            } else {
                asset = Asset.native();
            }

            const networkPassphrase = NETWORK_PASSPHRASE;

            // For USDC: require a trustline before building the payment
            if (scanResult.currency === "USDC") {
                if (!hasTrustline(source, asset)) {
                    setStatus("Add a USDC trustline first using the button below.");
                    return;
                }
            }

            const tx = new TransactionBuilder(source, {
                fee: BASE_FEE,
                networkPassphrase: networkPassphrase
            })
                .addOperation(Operation.payment({
                    destination: scanResult.merchant,
                    asset: asset,
                    amount: String(scanResult.amount) // Ensure amount is a string
                }))
                .setTimeout(30)
                .build();

            setStatus("Signing with Freighter...");
            // Verify the transaction network before signing
            // Testnet network ID should be: cee0302d59844d32bdca915c8203dd44b33fbb7edc19051ea37abedf28ecd472
            const txNetworkId = tx.networkId;
            const expectedTestnetIdHex = 'cee0302d59844d32bdca915c8203dd44b33fbb7edc19051ea37abedf28ecd472';
            let txNetworkIdHex = 'none';
            if (txNetworkId) {
                // Convert Uint8Array to hex string
                txNetworkIdHex = Array.from(txNetworkId)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            }
            console.log("Transaction network ID:", txNetworkIdHex);
            console.log("Expected testnet ID:", expectedTestnetIdHex);
            console.log("Network passphrase:", networkPassphrase);

            if (txNetworkIdHex !== 'none' && txNetworkIdHex !== expectedTestnetIdHex) {
                throw new Error(`Transaction network mismatch! Expected testnet (${expectedTestnetIdHex}) but got: ${txNetworkIdHex}. This transaction is built for the wrong network.`);
            }

            // signTransaction returns { signedTxXdr } or { error }
            // Pass both network and networkPassphrase to ensure Freighter uses testnet
            const signedTx = await signTransaction(tx.toXDR(), {
                network: "TESTNET",
                networkPassphrase: networkPassphrase
            });

            // Check for Freighter errors - these come in the response object
            if (signedTx.error) {
                const errorMsg = typeof signedTx.error === 'string'
                    ? signedTx.error
                    : (signedTx.error.message || JSON.stringify(signedTx.error));
                throw new Error(`Freighter signing error: ${errorMsg}`);
            }

            if (!signedTx.signedTxXdr) {
                throw new Error("Transaction signing failed: No signed XDR returned from Freighter");
            }

            setStatus("Submitting to Network...");
            // Parse the signed transaction
            let signedTransaction;
            try {
                signedTransaction = TransactionBuilder.fromXDR(signedTx.signedTxXdr, networkPassphrase);
            } catch (parseError) {
                throw new Error(`Failed to parse signed transaction: ${parseError.message}`);
            }

            // Verify the transaction before submitting
            console.log("Submitting transaction:", {
                source: signedTransaction.source,
                sequence: signedTransaction.sequence,
                operations: signedTransaction.operations.length,
                networkPassphrase: networkPassphrase,
                fee: signedTransaction.fee
            });

            // Log operation details for debugging
            signedTransaction.operations.forEach((op, idx) => {
                console.log(`Operation ${idx}:`, op.type, op);
            });

            let result;
            try {
                result = await server.submitTransaction(signedTransaction);
            } catch (submitError) {
                throw submitError;
            }

            console.log("Payment Result:", result);
            setStatus(`Payment Successful! Hash: ${result.hash} `);
            alert("Payment Successful!");

        } catch (e) {
            console.error("Payment error:", e);
            let errorMessage = "Unknown error occurred";

            // Handle different error types, with special handling for Horizon/Axios errors
            if (e && typeof e === 'object') {
                // Handle Horizon API errors (AxiosError or SDK wrapped errors)
                // Check multiple possible locations for the response data
                const responseData = e.response?.data || e.response || e.data || e;

                // Check for result_codes in various possible locations (try all paths)
                let resultCodes = null;
                if (e.response?.data?.extras?.result_codes) {
                    resultCodes = e.response.data.extras.result_codes;
                } else if (responseData.extras?.result_codes) {
                    resultCodes = responseData.extras.result_codes;
                } else if (responseData.result_codes) {
                    resultCodes = responseData.result_codes;
                } else if (e.extras?.result_codes) {
                    resultCodes = e.extras.result_codes;
                } else if (e.response?.extras?.result_codes) {
                    resultCodes = e.response.extras.result_codes;
                }

                if (resultCodes) {
                    const transactionCode = resultCodes.transaction || "UNKNOWN";
                    const operationCodes = resultCodes.operations || [];

                    // One clear message for op_no_trust (no repetitive text)
                    if (operationCodes.includes("op_no_trust") || operationCodes.includes("op_source_no_trust") || operationCodes.includes("op_dest_no_trust")) {
                        errorMessage = "No USDC trustline. Use the \"Add USDC Trustline\" button below, then try again. (The merchant may also need a trustline.)";
                    } else {
                        const shortMessages = {
                            op_underfunded: "Insufficient balance.",
                            op_low_reserve: "Balance too low (reserve).",
                            op_line_full: "Trustline limit reached.",
                            op_not_authorized: "Not authorized.",
                            op_no_destination: "Destination account does not exist. Use a valid merchant address.",
                            tx_bad_seq: "Invalid sequence; try again.",
                            tx_insufficient_balance: "Insufficient balance.",
                            tx_no_source_account: "Source account not found."
                        };
                        const firstOp = operationCodes[0];
                        errorMessage = shortMessages[firstOp] || shortMessages[transactionCode] || `Transaction failed: ${firstOp || transactionCode}`;
                    }
                } else if (responseData.detail) {
                    // If detail mentions result_codes, try to extract them
                    if (responseData.detail.includes('result_codes') && responseData.extras) {
                        console.error("Detail mentions result_codes, checking extras:", responseData.extras);
                        // Try to find result_codes in extras
                        if (responseData.extras.result_codes) {
                            resultCodes = responseData.extras.result_codes;
                            const transactionCode = resultCodes.transaction || 'UNKNOWN';
                            const operationCodes = resultCodes.operations || [];
                            errorMessage = `Transaction Failed: ${transactionCode}`;
                            if (operationCodes.length > 0) {
                                errorMessage += ` | Operations: ${operationCodes.join(', ')}`;
                            }
                        } else {
                            errorMessage = responseData.detail;
                        }
                    } else {
                        errorMessage = responseData.detail;
                    }
                } else if (responseData.title) {
                    errorMessage = responseData.title;
                    if (responseData.detail) {
                        errorMessage += `: ${responseData.detail}`;
                    }
                } else if (responseData.type) {
                    errorMessage = `${responseData.type}: ${responseData.detail || JSON.stringify(responseData)}`;
                } else if (e.message) {
                    errorMessage = e.message;
                } else {
                    errorMessage = JSON.stringify(responseData);
                }
            } else if (e instanceof Error) {
                errorMessage = e.message;
            } else if (typeof e === 'string') {
                errorMessage = e;
            }

            setStatus(`Payment Failed: ${errorMessage}`);
            alert(`Payment Failed: ${errorMessage}`);
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
            if (!signed.signedTxXdr) throw new Error("No signed XDR from Freighter");
            await server.submitTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE));
            setStatus("");
            alert("USDC trustline added. You can pay with USDC now.");
        } catch (err) {
            const msg = err?.response?.data?.detail || err?.message || String(err);
            setStatus(`Failed to add trustline: ${msg}`);
            alert(`Failed to add trustline: ${msg}`);
        }
    };

    const handleContractPay = async () => {
        if (!walletAddress) {
            alert("Connect Wallet first!");
            return;
        }

        const { paymentContractId } = STELLAR_CONFIG;
        if (!paymentContractId) {
            alert("Contract ID not set! Check stellarConfig.js");
            return;
        }

        setStatus("Preparing Transaction...");
        try {
            const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
            const source = await server.loadAccount(walletAddress); // Check if account exists

            // Determine Asset and its Contract ID (SAC)
            // For Testnet/Mainnet, Native XLM Contract is 'CAS3J7GYQI3FHKGC43IK4JRABIJ7MMW4TRPQS4L2B2J7F5JFW5SMUKBK' is NOT constant.
            // It is derived.
            // EASIER: Use the 'Contract' class from SDK if available to get address. 
            // OR: Just accept that for this demo, we might struggle with Native SAC without a lookup.
            // BUT for USDC, we have the Issuer. The Asset(...).contractId(passphrase) gives it!

            let asset;
            let tokenAddress;

            const networkPassphrase = NETWORK_PASSPHRASE;

            if (scanResult.currency === 'USDC') {
                asset = new Asset(STELLAR_CONFIG.assets.USDC.code, STELLAR_CONFIG.assets.USDC.issuer);
                tokenAddress = asset.contractId(networkPassphrase);
                if (!hasTrustline(source, asset)) {
                    setStatus("Add a USDC trustline first using the \"Add USDC Trustline\" button.");
                    return;
                }
            } else {
                asset = Asset.native();
                tokenAddress = asset.contractId(networkPassphrase);
            }

            console.log("Token Address:", tokenAddress);
            console.log("Payment Contract:", paymentContractId);

            // Amount in stroops (i128)
            const amountI128 = new Int128([0, 0], BigInt(Math.floor(parseFloat(scanResult.amount) * 10000000)));

            // 1. Approve Operation (Token.approve(spender, amount, live_until))
            // Spender = Payment Contract
            // Expiration = Current Ledger + something.
            // To keep it simple, usually just approving 'amount' is fine but 'approve' needs 'expiration_ledger'.
            // Wait, Soroban Token 'approve' signature: fn approve(from: Address, spender: Address, amount: i128, expiration_ledger: u32)
            // We need current ledger.

            // Let's get latest ledger.
            const latestLedger = await server.fetchLatestLedger();
            const expirationLedger = latestLedger.sequence + 100; // valid for 100 ledgers (~8 mins)

            const approveOp = Operation.invokeHostFunction({
                func: xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new xdr.InvokeContractArgs({
                        contractAddress: new Address(tokenAddress).toScAddress(),
                        functionName: "approve",
                        args: [
                            new Address(walletAddress).toScVal(), // from
                            new Address(paymentContractId).toScVal(), // spender
                            new ScVal.scvI128(amountI128), // amount
                            nativeToScVal(expirationLedger, { type: 'u32' }) // expiration
                        ]
                    })
                ),
                auth: [] // Sub-invocations auth handling by SDK/Wallet usually, but explicit top-level needs auth? 
                // Actually 'approve' requires 'from' auth. Freighter handles signing.
            });

            // 2. Pay Operation (PaymentContract.pay(from, to, token, amount, ref_id))
            const payOp = Operation.invokeHostFunction({
                func: xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new xdr.InvokeContractArgs({
                        contractAddress: new Address(paymentContractId).toScAddress(),
                        functionName: "pay",
                        args: [
                            new Address(walletAddress).toScVal(), // from
                            new Address(scanResult.merchant).toScVal(), // to
                            new Address(tokenAddress).toScVal(), // token
                            new ScVal.scvI128(amountI128), // amount
                            nativeToScVal(scanResult.refId, { type: 'symbol' }) // ref_id
                        ]
                    })
                ),
                auth: []
            });
            const tx = new TransactionBuilder(source, {
                fee: BASE_FEE,
                networkPassphrase: networkPassphrase
            })
                .addOperation(approveOp)
                .addOperation(payOp)
                .setTimeout(30)
                .build();

            setStatus("Signing with Freighter...");
            // Verify the transaction network before signing
            // Testnet network ID should be: cee0302d59844d32bdca915c8203dd44b33fbb7edc19051ea37abedf28ecd472
            const txNetworkId = tx.networkId;
            const expectedTestnetIdHex = 'cee0302d59844d32bdca915c8203dd44b33fbb7edc19051ea37abedf28ecd472';
            let txNetworkIdHex = 'none';
            if (txNetworkId) {
                // Convert Uint8Array to hex string
                txNetworkIdHex = Array.from(txNetworkId)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            }
            console.log("Transaction network ID:", txNetworkIdHex);
            console.log("Expected testnet ID:", expectedTestnetIdHex);
            console.log("Network passphrase:", networkPassphrase);

            if (txNetworkIdHex !== 'none' && txNetworkIdHex !== expectedTestnetIdHex) {
                throw new Error(`Transaction network mismatch! Expected testnet (${expectedTestnetIdHex}) but got: ${txNetworkIdHex}. This transaction is built for the wrong network.`);
            }

            // signTransaction returns { signedTxXdr } or { error }
            // Pass both network and networkPassphrase to ensure Freighter uses testnet
            const signedTx = await signTransaction(tx.toXDR(), {
                network: "TESTNET",
                networkPassphrase: networkPassphrase
            });

            // Check for Freighter errors - these come in the response object
            if (signedTx.error) {
                const errorMsg = typeof signedTx.error === 'string'
                    ? signedTx.error
                    : (signedTx.error.message || JSON.stringify(signedTx.error));
                throw new Error(`Freighter signing error: ${errorMsg}`);
            }

            if (!signedTx.signedTxXdr) {
                throw new Error("Transaction signing failed: No signed XDR returned from Freighter");
            }

            setStatus("Submitting to Network...");
            // For Soroban checking, we often use `server.sendTransaction` and then poll `getTransaction` 
            // to check status.Horizon submit might fail if it's strict on Soroban, but Testnet Horizon handles it usually.
            // Ideally use rpc server. But let's try Horizon submit first as it proxies or standard flow.
            // Actually, Soroban transactions usually go to RPC.
            // But `server` here is Horizon.
            // Let's try submitting to Horizon. If it fails, we'll know.
            // (New SDKs support RPC properly, but we removed RPC imports to fix script).

            const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedTx.signedTxXdr, networkPassphrase));

            console.log("Payment Result:", result);
            setStatus(`Contract Payment Successful! Hash: ${result.hash} `);
            alert("Contract Payment Successful!");

        } catch (e) {
            console.error("Contract payment error:", e);
            let errorMessage = "Unknown error occurred";
            const rd = e?.response?.data;
            const rc = rd?.extras?.result_codes || e?.response?.data?.extras?.result_codes;
            if (rc) {
                const ops = rc.operations || [];
                if (ops.some((c) => ["op_no_trust", "op_source_no_trust", "op_dest_no_trust"].includes(c))) {
                    errorMessage = "No USDC trustline. Use \"Add USDC Trustline\" first, then try again.";
                } else {
                    errorMessage = `Transaction failed: ${ops[0] || rc.transaction || "unknown"}`;
                }
            } else if (e instanceof Error) {
                errorMessage = e.message;
            } else if (typeof e === "string") {
                errorMessage = e;
            } else if (e?.message) {
                errorMessage = e.message;
            } else if (rd?.detail) {
                errorMessage = rd.detail;
            }
            setStatus(`Error: ${errorMessage}`);
            alert(`Contract Payment Failed: ${errorMessage}`);
        }
    };
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>User Dashboard</h1>

            {!scanResult ? (
                <div className="card">
                    <h3>Scan QR Code</h3>
                    {scanning ? (
                        <div id="reader" width="500px"></div>
                    ) : (
                        <>
                            {status && <p style={{ color: '#e0aaff', marginBottom: '0.5rem' }}>{status}</p>}
                            <button onClick={() => setScanning(true)}>Start Scanner</button>
                            <button
                                onClick={() => setScanResult({
                                    merchant: walletAddress,
                                    amount: "1",
                                    currency: "XLM",
                                    refId: "simulated_order_123"
                                })}
                                disabled={!walletAddress}
                                style={{ marginLeft: '1rem', background: '#9c27b0', color: 'white' }}
                                title={!walletAddress ? "Connect wallet first to simulate (pay to self)" : "Simulate: pay 1 XLM to yourself"}
                            >
                                Simulate Scan (XLM)
                            </button>
                            <button
                                onClick={handleAddUSDCTrustline}
                                disabled={status === "Adding USDC trustline..."}
                                style={{ marginLeft: '1rem', background: '#FF9800', color: 'white' }}
                            >
                                Add USDC Trustline
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="card">
                    <h3>Confirm Payment</h3>
                    <p><strong>To Merchant:</strong> {scanResult.merchant}</p>
                    <p><strong>Amount:</strong> {scanResult.amount} {scanResult.currency}</p>
                    <p><strong>Order ID:</strong> {scanResult.refId}</p>

                    {status && <p style={{ color: '#e0aaff' }}>{status}</p>}

                    <div style={{ marginTop: '2rem' }}>
                        <button onClick={handlePay} disabled={isBusy} style={{ background: '#4CAF50', color: 'white' }}>
                            Pay Now
                        </button>
                        <button onClick={handleContractPay} disabled={isBusy} style={{ background: '#2196F3', color: 'white', marginLeft: '1rem' }}>
                            Pay w/ Contract
                        </button>
                        {scanResult?.currency === "USDC" && (
                            <button
                                onClick={handleAddUSDCTrustline}
                                disabled={status === "Adding USDC trustline..."}
                                style={{ background: '#FF9800', color: 'white', marginLeft: '1rem' }}
                            >
                                Add USDC Trustline
                            </button>
                        )}
                        <button onClick={() => { setScanResult(null); setStatus(""); }} style={{ background: 'red', marginLeft: '1rem' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;
