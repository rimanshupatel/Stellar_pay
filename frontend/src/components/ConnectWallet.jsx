import { useState, useEffect } from 'react';
import { isConnected, isAllowed, setAllowed, getAddress } from '@stellar/freighter-api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Wallet, CheckCircle } from 'lucide-react';
import { formatAddress } from '../lib/utils';

export default function ConnectWallet({ onConnect, address }) {
  const [hasAPI, setHasAPI] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        if (await isConnected()) {
          setHasAPI(true);
          if (await isAllowed()) {
            const { address } = await getAddress();
            if (address) onConnect(address);
          }
        }
      } catch (e) {
        console.error('Freighter check failed', e);
      }
    };
    checkFreighter();
  }, [onConnect]);

  const handleConnect = async () => {
    if (!hasAPI) {
      alert('Please install Freighter wallet extension first!\n\nVisit: https://freighter.app');
      return;
    }

    setLoading(true);
    try {
      await setAllowed();
      const { address } = await getAddress();
      if (address) {
        onConnect(address);
      }
    } catch (e) {
      console.error('Connection failed', e);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (address) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="success" className="flex items-center space-x-2 px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-mono text-xs font-medium">{formatAddress(address)}</span>
        </Badge>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      size="sm"
      variant="primary"
      className="flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4" />
      <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
    </Button>
  );
}
