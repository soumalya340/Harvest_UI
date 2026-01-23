# Harvest UI - Quick Setup Guide

## Step 1: Configure Contract Address

Open `CONSTANTS.tsx` and update the contract address:

```typescript
export const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS_HERE';
```

Replace `'0xYOUR_CONTRACT_ADDRESS_HERE'` with your actual deployed contract address.

## Step 2: Configure Network (Optional)

If you're deploying to mainnet, update the network configuration in `CONSTANTS.tsx`:

```typescript
export const NETWORK_CONFIG = {
  CHAIN_ID: '8', // Change to '8' for Mainnet (default is '6' for Testnet)
  RPC_URL: 'https://rpc-mainnet.supra.com', // Update for mainnet
  EXPLORER_URL: 'https://suprascan.io', // Update for mainnet
} as const;
```

Also update the chainId in `app/hooks/useStarkeyWallet.ts` (line 213):
```typescript
chainId: '8', // Change from '6' to '8' for Mainnet
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Connect Your Wallet

1. Make sure you have the Starkey wallet extension installed
2. Click "Connect Wallet" in the UI
3. Approve the connection in your Starkey wallet

## Configuration Reference

### CONSTANTS.tsx Overview

The `CONSTANTS.tsx` file contains all configuration values:

- **CONTRACT_ADDRESS**: Your deployed harvest contract address
- **MODULE_NAME**: The module name (default: 'script1')
- **NETWORK_CONFIG**: Network settings (chainId, RPC URL, Explorer URL)
- **TOKEN_DECIMALS**: Default token decimals for formatting
- **TRANSACTION_CONFIG**: Transaction timeout settings
- **UI_CONFIG**: UI-related settings (toast duration, polling intervals, etc.)
- **FUNCTION_NAMES**: Contract function names (for reference)
- **TOKEN_ADDRESSES**: Your token metadata addresses

### Helper Functions

The constants file also provides useful helper functions:

```typescript
// Get explorer URL for a transaction
const txUrl = getExplorerUrl(txHash);

// Get explorer URL for an address
const addressUrl = getAddressExplorerUrl(walletAddress);

// Format token amount for display (from contract format to human-readable)
const displayAmount = formatTokenAmount('100000000', 8); // "1.00000000"

// Parse token amount for contract (from human-readable to contract format)
const contractAmount = parseTokenAmount('1.5', 8); // "150000000"
```

## Adding Custom Tokens

To add your custom token addresses, update the `TOKEN_ADDRESSES` section in `CONSTANTS.tsx`:

```typescript
export const TOKEN_ADDRESSES = {
  SUPRA_COIN: '0x1::supra_coin::SupraCoin',
  MY_TOKEN: '0x123abc...::my_token::MyToken',
  REWARD_TOKEN: '0x456def...::reward_token::RewardToken',
} as const;
```

## Testing the Setup

### Test Connection
1. Open the app
2. Click "Connect Wallet"
3. Verify your wallet connects successfully

### Test Transaction (Staking)
1. Make sure you have a pool address
2. Enter the pool address and amount in the Stake form
3. Click "Stake"
4. Approve the transaction in Starkey
5. Check the transaction on the explorer

## Troubleshooting

### Contract Address Issues
- Ensure the contract address is correct and includes the `0x` prefix
- Verify the contract is deployed on the correct network (testnet vs mainnet)

### Network Mismatch
- Check that `CONSTANTS.tsx` CHAIN_ID matches the network in `useStarkeyWallet.ts`
- Ensure your wallet is connected to the correct network

### Transaction Failures
- Verify you have sufficient balance for gas fees
- Check that the pool address is valid
- Ensure the pool is active and not expired

## Next Steps

After configuration, refer to:
- [FUNCTION_CALLS.md](./FUNCTION_CALLS.md) - Detailed function call examples
- [README.md](./README.md) - Complete documentation
- [harvest-contracts/scripts.move](./harvest-contracts/scripts.move) - Contract source code

## Support

For issues:
1. Check the browser console for error messages
2. Verify all configuration values in `CONSTANTS.tsx`
3. Test the contract functions using the contract explorer first
4. Review the transaction logs in Starkey wallet
