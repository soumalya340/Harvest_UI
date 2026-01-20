'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { WalletType } from '../hooks/useAptosMultiWallet';
import useAptosMultiWallet from '../hooks/useAptosMultiWallet';

// Wallet configuration
const WALLET_INFO = {
  petra: {
    name: 'Petra Wallet',
    icon: '🦁',
    downloadUrl: 'https://petra.app/',
  },
  pontem: {
    name: 'Pontem Wallet',
    icon: '🐬',
    downloadUrl: 'https://pontem.network/',
  },
  martian: {
    name: 'Martian Wallet',
    icon: '👽',
    downloadUrl: 'https://martianwallet.xyz/',
  },
  fewcha: {
    name: 'Fewcha Wallet',
    icon: '🦊',
    downloadUrl: 'https://fewcha.app/',
  },
  rise: {
    name: 'Rise Wallet',
    icon: '🌅',
    downloadUrl: 'https://risewallet.io/',
  },
} as const;

export interface ConnectWalletHandlerProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  children: (props: {
    isConnected: boolean;
    accounts: string[];
    loading: boolean;
    balance: string;
    handleConnect: () => void;
    handleDisconnect: () => void;
  }) => React.ReactNode;
}

export const ConnectWalletHandler: React.FC<ConnectWalletHandlerProps> = ({
  onConnect,
  onDisconnect,
  children,
}) => {
  const wallet = useAptosMultiWallet();

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<
    Array<{
      type: WalletType;
      name: string;
      isInstalled: boolean;
    }>
  >([]);
  const [recentWallet, setRecentWallet] = useState<WalletType | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [connectionStage, setConnectionStage] = useState<
    'idle' | 'connecting' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  // Check available wallets on mount
  useEffect(() => {
    const checkWallets = async () => {
      const wallets: Array<{ type: WalletType; name: string; isInstalled: boolean }> = [];
      
      for (const [key, config] of Object.entries(WALLET_INFO)) {
        const walletType = key as WalletType;
        const isInstalled = await wallet.checkExtensionInstalled(walletType);
        wallets.push({
          type: walletType,
          name: config.name,
          isInstalled,
        });
      }
      
      setAvailableWallets(wallets);
    };

    checkWallets();
  }, [wallet]);

  // Get recent wallet from storage
  useEffect(() => {
    const stored = localStorage.getItem('aptos-multiwallet.selectedWallet');
    if (stored && Object.keys(WALLET_INFO).includes(stored)) {
      setRecentWallet(stored as WalletType);
    }
  }, []);

  const handleConnect = async () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType);
    setConnectionStage('connecting');
    setError(null);
    setLoading(true);

    try {
      wallet.updateSelectedWallet(walletType);
      const connected = await wallet.connectWallet(walletType);
      
      if (connected) {
        setConnectionStage('success');
        setRecentWallet(walletType);
        localStorage.setItem('aptos-multiwallet.selectedWallet', walletType);
        
        setTimeout(() => {
          setShowWalletModal(false);
          setConnectionStage('idle');
          if (wallet.accounts[0] && onConnect) {
            onConnect(wallet.accounts[0]);
          }
        }, 1000);
      }
    } catch (err: any) {
      setConnectionStage('error');
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await wallet.disconnectWallet();
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (err: any) {
      console.error('Error disconnecting:', err);
    }
  };

  return (
    <>
      {children({
        isConnected: wallet.connected,
        accounts: wallet.accounts,
        loading: wallet.loading || loading,
        balance: wallet.balance,
        handleConnect,
        handleDisconnect,
      })}

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Connect Wallet</h2>
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setConnectionStage('idle');
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {connectionStage === 'connecting' && (
                <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">Connecting...</p>
                </div>
              )}

              {connectionStage === 'success' && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Connected successfully!
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {availableWallets.map((walletInfo) => {
                  const walletConfig = WALLET_INFO[walletInfo.type];
                  const isRecent = recentWallet === walletInfo.type;
                  
                  return (
                    <button
                      key={walletInfo.type}
                      onClick={() => handleWalletSelect(walletInfo.type)}
                      disabled={connectionStage === 'connecting'}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        isRecent
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                      } ${
                        connectionStage === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{walletConfig.icon}</span>
                          <div className="text-left">
                            <div className="font-medium">{walletConfig.name}</div>
                            {!walletInfo.isInstalled && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Not installed
                              </div>
                            )}
                          </div>
                        </div>
                        {isRecent && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Recent
                          </span>
                        )}
                        {!walletInfo.isInstalled && (
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                New to Aptos?{' '}
                <a
                  href="https://aptos.dev/guides/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Learn more
                </a>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
