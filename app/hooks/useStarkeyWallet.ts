import { useState, useEffect } from 'react';
import nacl from 'tweetnacl';
import useConversionUtils from './useConversionUtils';

// Wallet events
export const WALLET_EVENTS = {
  CONNECTED: 'starkey-wallet-connected',
  DISCONNECTED: 'starkey-wallet-disconnected',
  ACCOUNT_CHANGED: 'starkey-wallet-account-changed',
  ERROR: 'starkey-wallet-error',
} as const;

// Storage key
const STORAGE_KEY = 'starkey.connected';

const useStarkeyWallet = () => {
  // Get conversion utilities
  const conversionUtils = useConversionUtils();

  // Get Starkey provider
  const getProvider = () =>
    typeof window !== 'undefined' && (window as any)?.starkey?.supra;

  // States
  const [provider, setProvider] = useState<any>(getProvider());
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<{ hash: string }[]>([]);
  const [networkData, setNetworkData] = useState<any>({});

  const addTransaction = (hash: string) => {
    setTransactions((prev) => [{ hash }, ...prev]);
  };

  // Check if Starkey extension is installed
  const checkExtensionInstalled = async () => {
    const starkeyProvider = getProvider();
    setProvider(starkeyProvider);
    const isInstalled = !!starkeyProvider;
    setIsExtensionInstalled(isInstalled);
    return isInstalled;
  };

  // Update accounts from provider
  const updateAccounts = async () => {
    const starkeyProvider = provider || getProvider();
    if (!starkeyProvider) return;

    try {
      const responseAcc = await starkeyProvider.account();
      if (responseAcc && responseAcc.length > 0) {
        setAccounts(responseAcc);
        setConnected(true);
        await updateBalance(responseAcc[0]);
        window.dispatchEvent(new Event(WALLET_EVENTS.CONNECTED));
      }
    } catch (error) {
      console.error('Error updating accounts:', error);
      setAccounts([]);
      setConnected(false);
    }
  };

  // Update balance
  const updateBalance = async (address: string) => {
    const starkeyProvider = provider || getProvider();
    if (!starkeyProvider || !address) {
      setBalance('0');
      return;
    }

    try {
      const balanceResponse = await starkeyProvider.balance();
      if (balanceResponse && balanceResponse.formattedBalance) {
        setBalance(balanceResponse.formattedBalance);
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
    const starkeyProvider = provider || getProvider();
    if (!starkeyProvider) return {};

    try {
      const data = await starkeyProvider.getChainId();
      setNetworkData(data || {});
      return data || {};
    } catch (error) {
      console.error('Error getting network data:', error);
      setNetworkData({});
      return {};
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    const starkeyProvider = provider || getProvider();

    if (!starkeyProvider) {
      const error = 'Starkey wallet extension not installed';
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENTS.ERROR, { detail: error })
      );
      throw new Error(error);
    }

    setLoading(true);

    try {
      // Connect to Starkey
      await starkeyProvider.connect();
      
      // Get accounts
      const responseAcc = await starkeyProvider.account();

      if (!responseAcc || responseAcc.length === 0) {
        throw new Error('No account found in Starkey wallet');
      }

      // Update state
      setAccounts(responseAcc);
      setConnected(true);
      localStorage.setItem(STORAGE_KEY, 'true');

      // Get balance and network
      await updateBalance(responseAcc[0]);
      await getNetworkData();

      // Dispatch connection event
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENTS.CONNECTED, {
          detail: {
            timestamp: Date.now(),
            account: responseAcc[0],
          },
        })
      );

      return true;
    } catch (error: any) {
      console.error('Error connecting Starkey wallet:', error);
      setAccounts([]);
      setConnected(false);
      localStorage.removeItem(STORAGE_KEY);
      
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
    const starkeyProvider = provider || getProvider();

    try {
      if (starkeyProvider && starkeyProvider.disconnect) {
        await starkeyProvider.disconnect();
      }
      
      setAccounts([]);
      setConnected(false);
      setBalance('0');
      localStorage.removeItem(STORAGE_KEY);
      
      window.dispatchEvent(new Event(WALLET_EVENTS.DISCONNECTED));
    } catch (error) {
      console.error('Error disconnecting Starkey wallet:', error);
    }
  };

  // Helper to serialize arguments based on function signature
  const serializeArguments = (functionName: string, rawArgs: any[]): Uint8Array[] => {
    const serializedArgs: Uint8Array[] = [];

    // Define the argument types for each function
    const functionSignatures: Record<string, string[]> = {
      'register_pool': ['address', 'address', 'u64', 'u64', 'u64'],
      'register_pool_with_boost': ['address', 'address', 'u64', 'u64', 'u64', 'u64', 'address', 'string', 'u128'],
      'stake': ['address', 'u64'],
      'unstake': ['address', 'u64'],
      'harvest': ['address'],
      'deposit_reward_coins': ['address', 'u64'],
      'add_rewards_and_time': ['address', 'u64', 'u64'],
      'emergency_unstake': ['address'],
      'boost_v1': ['address', 'address', 'string', 'string', 'u64'],
      'boost_v2': ['address', 'address'],
      'remove_boost': ['address'],
      'toggle_whitelisted_user': ['address'],
      'enable_emergency': ['address'],
      'withdraw_reward_to_treasury': ['address', 'u64'],
    };

    const argTypes = functionSignatures[functionName];
    if (!argTypes) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    if (rawArgs.length !== argTypes.length) {
      throw new Error(`Argument count mismatch for ${functionName}: expected ${argTypes.length}, got ${rawArgs.length}`);
    }

    rawArgs.forEach((arg, index) => {
      const type = argTypes[index];
      
      switch (type) {
        case 'address':
          serializedArgs.push(conversionUtils.addressToUint8Array(arg));
          break;
        case 'u8':
          serializedArgs.push(conversionUtils.serializeUint8(arg));
          break;
        case 'u16':
          serializedArgs.push(conversionUtils.serializeUint16(arg));
          break;
        case 'u32':
          serializedArgs.push(conversionUtils.serializeUint32(arg));
          break;
        case 'u64':
          serializedArgs.push(conversionUtils.serializeUint64(arg));
          break;
        case 'u128':
          serializedArgs.push(conversionUtils.serializeUint128(arg));
          break;
        case 'bool':
          serializedArgs.push(conversionUtils.serializeBool(arg));
          break;
        case 'string':
          serializedArgs.push(conversionUtils.serializeString(arg));
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
    });

    return serializedArgs;
  };

  // Send raw transaction (accepts either pre-serialized or raw args)
  const sendRawTransaction = async (
    moduleAddress: string,
    moduleName: string,
    functionName: string,
    params: any[] = [],
    runTimeParams: any[] = [],
    isRawArgs: boolean = true // New parameter to indicate if args need serialization
  ) => {
    const starkeyProvider = provider || getProvider();
    
    if (!starkeyProvider || !accounts.length) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);

      // Serialize arguments if they are raw
      const serializedParams = isRawArgs ? serializeArguments(functionName, params) : params;

      const rawTxPayload = [
        accounts[0],
        0, // sequence number
        moduleAddress,
        moduleName,
        functionName,
        runTimeParams,
        serializedParams,
        {},
      ];

      const data = await starkeyProvider.createRawTransactionData(rawTxPayload);
      
      // Get current chain ID from the provider
      let currentChainId = '6'; // Default to Supra testnet
      try {
        const networkInfo = await starkeyProvider.getChainId();
        if (networkInfo?.chainId) {
          currentChainId = networkInfo.chainId.toString();
          console.log('Using chain ID from provider:', currentChainId);
        }
      } catch (e) {
        console.warn('Could not get chain ID from provider, using default:', currentChainId);
      }
      
      console.log('Sending transaction with:', {
        from: accounts[0],
        to: moduleAddress,
        chainId: currentChainId,
        functionName,
      });
      
      const txHash = await starkeyProvider.sendTransaction({
        data,
        from: accounts[0],
        to: moduleAddress,
        chainId: currentChainId,
        value: '',
      });

      if (txHash) {
        addTransaction(txHash);
      }

      return txHash;
    } catch (error: any) {
      console.error('Send raw transaction error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign message
  const signMessage = async (message: string, nonce = '12345') => {
    const starkeyProvider = provider || getProvider();
    
    if (!starkeyProvider || !accounts.length) {
      throw new Error('Wallet not connected');
    }

    try {
      const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

      const response = await starkeyProvider.signMessage({
        message: hexMessage,
        nonce,
      });

      const { publicKey, signature } = response;
      
      // Verify signature
      const verified = nacl.sign.detached.verify(
        new TextEncoder().encode(message),
        Uint8Array.from(Buffer.from(signature.slice(2), 'hex')),
        Uint8Array.from(Buffer.from(publicKey.slice(2), 'hex'))
      );

      return { ...response, verified };
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Switch network
  const switchToChain = async (chainId: string) => {
    const starkeyProvider = provider || getProvider();
    
    if (!starkeyProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      await starkeyProvider.changeNetwork({ chainId });
      await getNetworkData();
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  // Initialize on mount
  useEffect(() => {
    checkExtensionInstalled();

    // Check if previously connected
    const wasConnected = localStorage.getItem(STORAGE_KEY) === 'true';
    if (wasConnected) {
      updateAccounts();
    }

    // Listen for account changes
    const starkeyProvider = getProvider();
    if (starkeyProvider && starkeyProvider.on) {
      starkeyProvider.on('accountChanged', (newAccount: string) => {
        if (newAccount) {
          setAccounts([newAccount]);
          updateBalance(newAccount);
          window.dispatchEvent(new Event(WALLET_EVENTS.ACCOUNT_CHANGED));
        }
      });

      starkeyProvider.on('disconnect', () => {
        setAccounts([]);
        setConnected(false);
        setBalance('0');
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event(WALLET_EVENTS.DISCONNECTED));
      });
    }

    // Polling for extension installation
    const interval = setInterval(async () => {
      const isInstalled = await checkExtensionInstalled();
      if (isInstalled) {
        clearInterval(interval);
      }
    }, 1000);

    setTimeout(() => clearInterval(interval), 10000); // Stop after 10s

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    // State
    accounts,
    account: accounts[0] || null,
    balance,
    loading,
    connected,
    isExtensionInstalled,
    transactions,
    networkData,
    provider,

    // Methods
    connectWallet,
    disconnectWallet,
    sendRawTransaction,
    signMessage,
    switchToChain,
    updateAccounts,
    updateBalance,
    getNetworkData,
    checkExtensionInstalled,
    addTransaction,
  };
};

export default useStarkeyWallet;
