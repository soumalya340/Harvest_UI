'use client';

import React, { createContext, useContext } from 'react';
import useStarkeyWallet from '../hooks/useStarkeyWallet';

// Create a context to share wallet state across the app
const WalletContext = createContext<ReturnType<typeof useStarkeyWallet> | null>(
  null
);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useStarkeyWallet();

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}

// Hook used by components like BoostManager / PoolCard / PoolRegistrationForm
export function useAptosMultiWalletWithRefresh() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error(
      'useAptosMultiWalletWithRefresh must be used within a WalletProvider'
    );
  }
  return ctx;
}
