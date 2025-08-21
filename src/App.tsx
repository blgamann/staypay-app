import { VaultDashboard } from './layouts/VaultDashboard';
import { Button } from './components/ui/Button';
import { Card, CardBody } from './components/ui/Card';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const connectWallet = () => {
    // Use the first available connector (MetaMask)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setShowDisconnectDialog(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-defi-dark">
      <header className="bg-defi-card border-b border-defi-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">StayPay</h1>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-defi-darker rounded-xl border border-defi-border">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-defi-light-text font-medium">Kairos</span>
                  </div>
                  <Button 
                    onClick={() => setShowDisconnectDialog(true)}
                    variant="secondary"
                  >
                    {address ? formatAddress(address) : ''}
                  </Button>
                </>
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
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Welcome to StayPay
                </h2>
                <p className="text-defi-medium-text mb-6">
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

      {/* Disconnect Dialog */}
      {showDisconnectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-defi-card rounded-2xl p-6 max-w-sm w-full border border-defi-border">
            <h3 className="text-lg font-semibold text-white mb-2">Disconnect Wallet</h3>
            <p className="text-defi-medium-text mb-6">
              Are you sure you want to disconnect your wallet?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDisconnectDialog(false)}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={disconnectWallet}
                variant="danger"
                fullWidth
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;