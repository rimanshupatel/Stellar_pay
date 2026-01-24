import React, { useState, useEffect } from 'react';
import { isConnected, isAllowed, setAllowed, getAddress } from '@stellar/freighter-api';

const ConnectWallet = ({ onConnect, address }) => {
    const [hasAPI, setHasAPI] = useState(false);

    useEffect(() => {
        // Check if Freighter is installed
        const checkFreighter = async () => {
            if (await isConnected()) {
                setHasAPI(true);
                if (await isAllowed()) {
                    const { address } = await getAddress();
                    if (address) onConnect(address);
                }
            }
        };
        checkFreighter();
    }, []);

    const handleConnect = async () => {
        if (!hasAPI) {
            alert("Freighter wallet not installed!");
            return;
        }

        try {
            await setAllowed();
            const { address } = await getAddress();
            if (address) onConnect(address);
        } catch (e) {
            console.error("Connection failed", e);
        }
    };

    return (
        <div>
            {address ? (
                <button disabled style={{ background: '#4CAF50', color: 'white' }}>
                    {address.substring(0, 4)}...{address.substring(address.length - 4)}
                </button>
            ) : (
                <button onClick={handleConnect}>Connect Wallet</button>
            )}
        </div>
    );
};

export default ConnectWallet;
