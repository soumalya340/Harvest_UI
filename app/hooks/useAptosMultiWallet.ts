'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';

// Define wallet types
export type WalletType = 'petra' | 'pontem' | 'martian' | 'fewcha' | 'rise';

// Define wallet capabilities interface
interface WalletCapabilities {
  signMessage: boolean;
  accountSwitching: boolean;
  networkSwitching: boolean;
  rawTransactions: boolean;
  eventListeners: boolean;
}

// Wallet configuration
const WALLET_CONFIGS = {
  petra: {
    name: 'Petra',
    capabilities: {
      signMessage: true,
      accountSwitching: true,
      networkSwitching: true,
      rawTransactions: true,
      eventListeners: true,
    },
    provider: () =>
      typeof window !== 'undefined' && (window as any)?.aptos,
    downloadUrl: 'https://petra.app/',
  },
  pontem: {
    name: 'Pontem',
    capabilities: {
      signMessage: true,
      accountSwitching: true,
      networkSwitching: true,
      rawTransactions: true,
      eventListeners: true,
    },
    provider: () =>
      typeof window !== 'undefined' && (window as any)?.pontem,
    downloadUrl: 'https://pontem.network/',
  },
  martian: {
    name: 'Martian',
    capabilities: {
      signMessage: true,
      accountSwitching: true,
      networkSwitching: true,
      rawTransactions: true,
      eventListeners: true,
    },
    provider: () =>
      typeof window !== 'undefined' && (window as any)?.martian,
    downloadUrl: 'https://martianwallet.xyz/',
  },
  fewcha: {
    name: 'Fewcha',
    capabilities: {
      signMessage: true,
      accountSwitching: true,
      networkSwitching: true,
      rawTransactions: true,
      eventListeners: true,
    },
    provider: () =>
      typeof window !== 'undefined' && (window as any)?.fewcha,
    downloadUrl: 'https://fewcha.app/',
  },
  rise: {
    name: 'Rise',
    capabilities: {
      signMessage: true,
      accountSwitching: true,
      networkSwitching: true,
      rawTransactions: true,
      eventListeners: true,
    },
    provider: () =>
      typeof window !== 'undefined' && (window as any)?.rise,
    downloadUrl: 'https://risewallet.io/',
  },
} as const;

// Wallet events
export const WALLET_EVENTS = {
  CONNECTED: 'aptos-wallet-connected',
  DISCONNECTED: 'aptos-wallet-disconnected',
  ACCOUNT_CHANGED: 'aptos-wallet-account-changed',
  ERROR: 'aptos-wallet-error',
} as const;

// Storage utility functions
const STORAGE_KEY = 'aptos-multiwallet.selectedWallet';

const setStoredWalletType = (walletType: WalletType) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, walletType);
      return;
    }
  } catch (e) {
    console.warn('localStorage not available');
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(STORAGE_KEY, walletType);
    }
  } catch (e) {
    console.warn('sessionStorage not available');
  }
};

const getStoredWalletType = (): WalletType => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.keys(WALLET_CONFIGS).includes(stored)) {
        return stored as WalletType;
      }
    }
  } catch (e) {
    console.warn('localStorage not available');
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && Object.keys(WALLET_CONFIGS).includes(stored)) {
        return stored as WalletType;
      }
    }
  } catch (e) {
    console.warn('sessionStorage not available');
  }

  return 'petra'; // Default to Petra
};

// Aptos client configuration
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const useAptosMultiWallet = () => {
  const router = useRouter();

  // Initialize wallet selection from storage
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(getStoredWalletType);
  const [walletCapabilities, setWalletCapabilities] = useState<WalletCapabilities>(
    WALLET_CONFIGS[getStoredWalletType()].capabilities
  );

  // Provider state
  const [aptosProvider, setAptosProvider] = useState<any>(
    WALLET_CONFIGS[selectedWallet].provider()
  );

  // Wallet states
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [network, setNetwork] = useState<string>('testnet');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<{ hash: string }[]>([]);

  const addTransaction = (hash: string) => {
    setTransactions((prev) => [{ hash }, ...prev]);
  };

  // Get current wallet provider
  const getCurrentProvider = () => {
    return aptosProvider;
  };

  // Check if extension is installed
  const checkExtensionInstalled = async (walletType?: WalletType) => {
    const walletToCheck = walletType || selectedWallet;
    const provider = WALLET_CONFIGS[walletToCheck].provider();
    const isInstalled = !!provider;
    if (walletToCheck === selectedWallet) {
      setIsExtensionInstalled(isInstalled);
    }
    return isInstalled;
  };

  // Update selected wallet
  const updateSelectedWallet = (walletType: WalletType) => {
    setSelectedWallet(walletType);
    setWalletCapabilities(WALLET_CONFIGS[walletType].capabilities);
    setAptosProvider(WALLET_CONFIGS[walletType].provider());
    setStoredWalletType(walletType);
  };

  // Update accounts
  const updateAccounts = async () => {
    const provider = getCurrentProvider();
    if (!provider) return;

    try {
      const account = await provider.account();
      if (account) {
        const address = typeof account === 'string' ? account : account.address;
        setAccounts([address]);
        setConnected(true);
        window.dispatchEvent(new Event(WALLET_EVENTS.CONNECTED));
        await updateBalance(address);
      }
    } catch (error) {
      console.error('Error updating accounts:', error);
    }
  };

  // Update balance
  const updateBalance = async (address: string) => {
    try {
      const accountAddress = AccountAddress.fromString(address);
      // Get APT balance directly
      const resources = await aptos.getAccountResources({ accountAddress });
      const coinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      if (coinResource && 'data' in coinResource) {
        const coinData = coinResource.data as { coin: { value: string } };
        const balanceValue = BigInt(coinData.coin.value);
        setBalance((Number(balanceValue) / 1e8).toFixed(4)); // Convert from octas to APT
      } else {
        setBalance('0');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      setBalance('0');
    }
  };

  // Get network data
  const getNetworkData = async () => {
    const provider = getCurrentProvider();
    if (!provider) return;

    try {
      if (provider.network) {
        const networkData = await provider.network();
        setNetwork(networkData.networkName || 'testnet');
      }
    } catch (error) {
      console.error('Error getting network data:', error);
    }
  };

  // Connect wallet
  const connectWallet = async (walletType?: WalletType) => {
    if (walletType) {
      updateSelectedWallet(walletType);
    }

    const provider = walletType
      ? WALLET_CONFIGS[walletType].provider()
      : getCurrentProvider();

    if (!provider) {
      throw new Error(
        `Please install the ${walletType || selectedWallet} extension`
      );
    }

    setLoading(true);

    try {
      // Connect to wallet
      const response = await provider.connect();
      const account = response.account || response.address || response;
      const address = typeof account === 'string' ? account : account.address;

      setAccounts([address]);
      setConnected(true);
      await updateBalance(address);
      await getNetworkData();

      window.dispatchEvent(new Event(WALLET_EVENTS.CONNECTED));

      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENTS.ERROR, { detail: error.message })
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    const provider = getCurrentProvider();
    if (!provider) return;

    try {
      if (provider.disconnect) {
        await provider.disconnect();
      }
      setAccounts([]);
      setConnected(false);
      setBalance('0');
      window.dispatchEvent(new Event(WALLET_EVENTS.DISCONNECTED));
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Sign and submit transaction
  const signAndSubmitTransaction = async (transaction: any) => {
    const provider = getCurrentProvider();
    if (!provider || !accounts[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      // Most Aptos wallets expect the transaction to be built already
      // The transaction should have a sender set, but if not, we'll use the connected account
      let transactionToSign = transaction;
      
      // If transaction doesn't have sender, try to add it
      if (!transaction.sender && transaction.data) {
        transactionToSign = await aptos.transaction.build.simple({
          sender: accounts[0],
          data: transaction.data,
        });
      }
      
      // Sign and submit using wallet provider
      const response = await provider.signAndSubmitTransaction(transactionToSign);
      addTransaction(response.hash);
      return response;
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign message
  const signMessage = async (message: string) => {
    const provider = getCurrentProvider();
    if (!provider || !accounts[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      if (provider.signMessage) {
        return await provider.signMessage({ message });
      }
      throw new Error('Sign message not supported by this wallet');
    } catch (error: any) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Initialize on mount
  useEffect(() => {
    checkExtensionInstalled();
    
    // Listen for account changes
    const provider = getCurrentProvider();
    if (provider && provider.onAccountChange) {
      provider.onAccountChange((newAccount: any) => {
        const address = typeof newAccount === 'string' ? newAccount : newAccount.address;
        setAccounts([address]);
        updateBalance(address);
        window.dispatchEvent(new Event(WALLET_EVENTS.ACCOUNT_CHANGED));
      });
    }

    // Auto-connect if previously connected
    const storedWallet = getStoredWalletType();
    const storedProvider = WALLET_CONFIGS[storedWallet].provider();
    if (storedProvider && storedProvider.isConnected) {
      storedProvider.isConnected().then((isConnected: boolean) => {
        if (isConnected) {
          updateAccounts();
        }
      });
    }
  }, [selectedWallet]);

  return {
    // State
    selectedWallet,
    accounts,
    account: accounts[0] || null,
    network,
    balance,
    loading,
    connected,
    isExtensionInstalled,
    transactions,
    walletCapabilities,

    // Methods
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction,
    signMessage,
    updateAccounts,
    updateBalance,
    getCurrentProvider,
    checkExtensionInstalled,
    updateSelectedWallet,
    addTransaction,
  };
};

export default useAptosMultiWallet;
