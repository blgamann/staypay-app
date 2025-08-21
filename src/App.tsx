import { VaultDashboard } from './layouts/VaultDashboard';
import { Button } from './components/ui/Button';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useState, useEffect } from 'react';
import { kaiaKairos } from './config/wagmi';

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

function App() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [actualChainId, setActualChainId] = useState<number | undefined>();
  
  // Get actual chainId from MetaMask when chain is not in our config
  useEffect(() => {
    const getChainId = async () => {
      if (window.ethereum) {
        try {
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setActualChainId(chainId);
        } catch (error) {
          console.error('Failed to get chainId:', error);
        }
      }
    };
    
    // Always get chainId if MetaMask is available
    getChainId();
    
    // Listen for chain changes
    if (window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setActualChainId(chainId);
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);
  
  // Use chain from config if available, otherwise use actual chainId from MetaMask
  const chainId = chain?.id || actualChainId;
  const isCorrectNetwork = chainId === kaiaKairos.id;
  
  // Get network name from chain object or fallback
  const getNetworkName = () => {
    // Not connected
    if (!isConnected) {
      return 'Not Connected';
    }
    
    // Use chain name if available from wagmi config
    if (chain?.name) {
      return chain.name;
    }
    
    // Use actualChainId if available (from MetaMask)
    const networkId = chainId || actualChainId;
    
    // Fallback for common networks based on chainId
    switch(networkId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 137: return 'Polygon';
      case 56: return 'BNB Smart Chain';
      case 42161: return 'Arbitrum One';
      case 10: return 'Optimism';
      case 8453: return 'Base';
      case 43114: return 'Avalanche';
      case 250: return 'Fantom';
      case 1001: return 'Kaia Kairos Testnet';
      case 8217: return 'Kaia Mainnet';
      case undefined: return 'Unknown Network';
      default: return `Unknown (ID: ${networkId})`;
    }
  };
  
  const currentNetworkName = getNetworkName();
  
  // Debug logging
  useEffect(() => {
    console.log('Current chain:', chain);
    console.log('Chain ID:', chainId);
    console.log('Network name:', currentNetworkName);
  }, [chain, chainId, currentNetworkName]);

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
  
  // Auto-show network modal when connected to wrong network
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      setShowNetworkModal(true);
    }
  }, [isConnected, isCorrectNetwork]);
  
  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: kaiaKairos.id });
      setShowNetworkModal(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="min-h-screen bg-defi-dark">
      <header className="bg-defi-card border-b border-defi-border">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center relative">
            <h1 className="text-2xl font-bold text-white">StayPay</h1>
            
            {/* Wrong Network Warning - Center */}
            {isConnected && !isCorrectNetwork && (
              <div className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 bg-error-500/20 border border-error-500 rounded-xl">
                <p className="text-error-500 font-medium text-sm">
                  ⚠️ Wrong network - Switch to Kairos
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <div className={`flex items-center gap-2 px-4 py-2 bg-defi-darker rounded-xl border ${
                    isCorrectNetwork ? 'border-defi-border' : 'border-error-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isCorrectNetwork ? 'bg-green-500' : 'bg-error-500'
                    }`}></div>
                    <span className="text-defi-light-text font-medium">{currentNetworkName}</span>
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
        <VaultDashboard 
          address={address} 
          isCorrectNetwork={isCorrectNetwork}
          isConnected={isConnected}
          onConnectWallet={connectWallet}
        />
      </main>

      {/* Network Switch Modal */}
      {showNetworkModal && isConnected && !isCorrectNetwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-defi-card rounded-2xl p-6 max-w-sm w-full border border-defi-border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wrong Network</h3>
              <p className="text-defi-medium-text mb-1">
                You're currently on
              </p>
              <p className="text-lg font-semibold text-white">
                {currentNetworkName}
              </p>
              <p className="text-sm text-defi-medium-text mt-3">
                StayPay operates on Kairos Network
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowNetworkModal(false)}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleSwitchNetwork}
                variant="primary"
                fullWidth
              >
                Switch to Kairos
              </Button>
            </div>
          </div>
        </div>
      )}

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