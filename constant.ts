// ============================================
// HARVEST STAKING - CONFIGURATION CONSTANTS
// ============================================

/**
 * Main contract address for the Harvest Staking platform
 * UPDATE THIS with your deployed contract address
 */
export const CONTRACT_ADDRESS = '0x7896b0fb2126899f0b24cd9369fb70fc4f4ff183b1e50c5e9277c83746eb7d2e';

/**
 * Main script module name (transaction entry functions)
 */
export const MODULE_NAME = 'script6';

/**
 * Staking/view module name (for view functions like get_total_pools_count)
 */
export const STAKE_MODULE_NAME = 'stake6';

/**
 * Additional module names for related token contracts (same deployer address)
 */
export const DOG_TOKEN_MODULE_NAME = 'dog_token_fa';
export const MOCK_USDC_MODULE_NAME = 'mock_usdc_fa';

/**
 * Network Configuration
 * - Supra Testnet: chainId = '6'
 * - Supra Mainnet: chainId = '8'
 */
export const NETWORK_CONFIG = {
  CHAIN_ID: '6', // Default: Testnet
  RPC_URL: 'https://rpc-testnet.supra.com',
  EXPLORER_URL: 'https://testnet.suprascan.io',
} as const;

/**
 * Token decimals for display formatting
 */
export const TOKEN_DECIMALS = {
  DEFAULT: 8,
  SUPRA: 8,
} as const;

/**
 * Transaction timeouts (in milliseconds)
 */
export const TRANSACTION_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  POLLING_INTERVAL: 1000, // 1 second
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  MAX_POOL_DISPLAY: 20,
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

/**
 * Contract function names (for reference)
 */
export const FUNCTION_NAMES = {
  // Main Functions
  REGISTER_POOL: 'register_pool',
  REGISTER_POOL_WITH_BOOST: 'register_pool_with_boost',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
  HARVEST: 'harvest',

  // Additional Functions
  DEPOSIT_REWARD_COINS: 'deposit_reward_coins',
  ADD_REWARDS_AND_TIME: 'add_rewards_and_time',
  EMERGENCY_UNSTAKE: 'emergency_unstake',

  // Boost Functions
  BOOST_V1: 'boost_v1',
  BOOST_V2: 'boost_v2',
  REMOVE_BOOST: 'remove_boost',

  // Admin Functions
  TOGGLE_WHITELISTED_USER: 'toggle_whitelisted_user',
  ENABLE_EMERGENCY: 'enable_emergency',
  WITHDRAW_REWARD_TO_TREASURY: 'withdraw_reward_to_treasury',
} as const;

/**
 * Example token addresses (update with your actual tokens)
 */
export const TOKEN_ADDRESSES = {
  // Example: Add your token metadata addresses here
  // SUPRA_COIN: '0x1::supra_coin::SupraCoin',
  // USDC: '0x...',
} as const;

/**
 * Helper function to get explorer URL for a transaction
 */
export const getExplorerUrl = (txHash: string): string => {
  return `${NETWORK_CONFIG.EXPLORER_URL}/tx/${txHash}`;
};

/**
 * Helper function to get explorer URL for an address
 */
export const getAddressExplorerUrl = (address: string): string => {
  return `${NETWORK_CONFIG.EXPLORER_URL}/account/${address}`;
};

/**
 * Helper function to format token amounts
 */
export const formatTokenAmount = (
  amount: string | number,
  decimals: number = TOKEN_DECIMALS.DEFAULT
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount / Math.pow(10, decimals)).toFixed(decimals);
};

/**
 * Helper function to parse token amounts to contract format
 */
export const parseTokenAmount = (
  amount: string | number,
  decimals: number = TOKEN_DECIMALS.DEFAULT
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(numAmount * Math.pow(10, decimals)).toString();
};

// Export all as default for convenience
export default {
  CONTRACT_ADDRESS,
  MODULE_NAME,
  STAKE_MODULE_NAME,
  DOG_TOKEN_MODULE_NAME,
  MOCK_USDC_MODULE_NAME,
  NETWORK_CONFIG,
  TOKEN_DECIMALS,
  TRANSACTION_CONFIG,
  UI_CONFIG,
  FUNCTION_NAMES,
  TOKEN_ADDRESSES,
  getExplorerUrl,
  getAddressExplorerUrl,
  formatTokenAmount,
  parseTokenAmount,
};
