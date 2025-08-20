import { useState } from 'react';
import { VaultDashboard } from './layouts/VaultDashboard';
import { Button } from './components/ui/Button';
import { Card, CardBody } from './components/ui/Card';
import { Badge } from './components/ui/Badge';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">StayPay Vault</h1>
              <Badge variant="info">Kaia Testnet</Badge>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Button 
                  onClick={disconnectWallet}
                  variant="danger"
                >
                  {formatAddress(address)}
                </Button>
              ) : (
                <Button 
                  onClick={connectWallet}
                  variant="primary"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {isConnected ? (
          <VaultDashboard address={address} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Card>
              <CardBody className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to StayPay Vault
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to start using the vault
                </p>
                <Button onClick={connectWallet} size="lg">
                  Connect Wallet
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;