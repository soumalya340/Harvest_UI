'use client';

import { ConnectWalletHandler } from './ConnectWalletHandler';

export function WalletButton() {
  return (
    <ConnectWalletHandler>
      {({ isConnected, accounts, loading, balance, handleConnect, handleDisconnect }) => {
        if (isConnected && accounts[0]) {
          return (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
                  </p>
                  {balance && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {balance} APT
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          );
        }

        return (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        );
      }}
    </ConnectWalletHandler>
  );
}
