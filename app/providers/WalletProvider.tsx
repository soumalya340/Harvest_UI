'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import useAptosMultiWallet from '../hooks/useAptosMultiWallet';
import { WALLET_EVENTS } from '../hooks/useAptosMultiWallet';

// Create a context to hold the wallet state
const AptosWalletContext = createContext<any>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const wallet = useAptosMultiWallet();

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletConnected = () => {
      if (!wallet.accounts[0]) {
        // Force a re-render of the component tree
        setForceUpdateKey((prev) => prev + 1);
      }
    };

    window.addEventListener(WALLET_EVENTS.CONNECTED, handleWalletConnected);
    window.addEventListener(WALLET_EVENTS.DISCONNECTED, handleWalletConnected);
    window.addEventListener(WALLET_EVENTS.ACCOUNT_CHANGED, handleWalletConnected);

    return () => {
      window.removeEventListener(WALLET_EVENTS.CONNECTED, handleWalletConnected);
      window.removeEventListener(WALLET_EVENTS.DISCONNECTED, handleWalletConnected);
      window.removeEventListener(WALLET_EVENTS.ACCOUNT_CHANGED, handleWalletConnected);
    };
  }, [wallet.accounts]);

  // The key prop forces the component to re-mount when the wallet connects
  return (
    <AptosWalletContext.Provider value={wallet} key={forceUpdateKey}>
      {children}
    </AptosWalletContext.Provider>
  );
}

// Custom hook to access wallet context
export function useAptosMultiWalletWithRefresh() {
  const context = useContext(AptosWalletContext);
  if (!context) {
    throw new Error('useAptosMultiWalletWithRefresh must be used within WalletProvider');
  }
  return context;
}
