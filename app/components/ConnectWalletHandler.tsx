'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import useStarkeyWallet from '../hooks/useStarkeyWallet';

// Starkey Wallet configuration
const STARKEY_INFO = {
  name: 'Starkey Wallet',
  icon: '⭐',
  downloadUrl: 'https://chromewebstore.google.com/detail/starkey-wallet/hcjhpkgbmechpabifbggldplacolbkoh',
};

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
  const wallet = useStarkeyWallet();

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionStage, setConnectionStage] = useState<
    'idle' | 'connecting' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!wallet.isExtensionInstalled) {
      setShowWalletModal(true);
      return;
    }

    // Connect directly
    setConnectionStage('connecting');
    setError(null);
    setLoading(true);

    try {
      await wallet.connectWallet();
      setConnectionStage('success');

      setTimeout(() => {
        setConnectionStage('idle');
        if (wallet.accounts[0] && onConnect) {
          onConnect(wallet.accounts[0]);
        }
      }, 500);
    } catch (err: any) {
      setConnectionStage('error');
      setError(err.message || 'Failed to connect Starkey wallet');
      setShowWalletModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = () => {
    window.open(STARKEY_INFO.downloadUrl, '_blank');
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

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">{STARKEY_INFO.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{STARKEY_INFO.name}</h3>
                  {!wallet.isExtensionInstalled ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Starkey wallet extension is not installed
                      </p>
                      <button
                        onClick={handleInstallClick}
                        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Install Starkey Wallet
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Wallet installed
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                Learn more about{' '}
                <a
                  href="https://supra.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Supra Network
                </a>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
