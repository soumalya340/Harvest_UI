# Harvest Staking - Starkey Wallet Integration

This application uses **Starkey wallet only** (Supra network) for all wallet connections and transactions.

## Changes Made

### 1. Wallet Connection (`useStarkeyWallet.ts`)
- Created a dedicated Starkey-only wallet hook
- Copied exact implementation from `@supra-multiwallet/hooks/useSupraMultiWallet.ts`
- Removed all Aptos wallet support (Petra, Pontem, Martian, Fewcha, Rise)
- Removed Ribbit wallet support (Starkey only)
- Removed authentication/JWT logic (simplified for staking use case)

### 2. Updated Components

#### `WalletProvider.tsx`
- Uses `useStarkeyWallet` hook
- Provides wallet context to all child components
- Export `useAptosMultiWalletWithRefresh()` hook for backward compatibility

#### `ConnectWalletHandler.tsx`
- Shows only Starkey wallet connection
- Displays install button if Starkey extension not detected
- Simplified modal (no multi-wallet selection)

#### `WalletButton.tsx`
- Uses `ConnectWalletHandler` to show connect/disconnect button
- Displays connected address and disconnect option

### 3. Transaction Handling

#### `contract.ts`
- Changed from Aptos SDK transactions to Supra raw transactions
- Returns `TransactionParams` object instead of built Aptos transactions
- Format: `{ moduleAddress, moduleName, functionName, typeArgs, args }`

#### `PoolCard.tsx`, `PoolRegistrationForm.tsx`, `BoostManager.tsx`
- All transaction calls now use `wallet.sendRawTransaction()`
- Follows Starkey wallet's raw transaction format
- Removed Aptos SDK `waitForTransaction` calls

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd harvest
   npm install
   ```

2. **Install Starkey Wallet:**
   - Install from [Chrome Web Store](https://chromewebstore.google.com/detail/starkey-wallet/hcjhpkgbmechpabifbggldplacolbkoh)
   - Or click "Install Starkey Wallet" in the app

3. **Configure contract address:**
   - Update `CONTRACT_ADDRESS` in `app/utils/contract.ts`
   - Deploy your Move contracts to Supra network
   - Use the deployed contract address

4. **Run the app:**
   ```bash
   npm run dev
   ```

## Starkey Wallet Methods Used

- `connectWallet()` - Connect to Starkey wallet
- `disconnectWallet()` - Disconnect wallet
- `sendRawTransaction()` - Send raw Move transactions
- `signMessage()` - Sign messages for authentication
- `updateBalance()` - Fetch wallet balance
- `getNetworkData()` - Get current network info

## Contract Function Calls

All contract functions return transaction parameters that are passed to `wallet.sendRawTransaction()`:

```typescript
const txParams = contractFunctions.stakeCoin(poolAddress, amount, stakeType);

const txHash = await wallet.sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.args,
  txParams.typeArgs
);
```

## Supported Contract Functions

- `register_pool_coin` - Register new staking pool
- `register_pool_with_boost_coin` - Register pool with NFT boost
- `stake_coin` - Stake tokens
- `unstake_coin` - Unstake tokens
- `harvest_coin` - Claim rewards
- `emergency_unstake_coin` - Emergency unstake
- `boost_v1` / `boost_v2` - Apply NFT boosts
- `remove_boost` - Remove NFT boost
- `deposit_reward_coins_coin` - Add rewards to pool
- `add_rewards_and_time_coin` - Extend pool duration

## Network Configuration

- **Default Network:** Supra Testnet (Chain ID: 6)
- **RPC:** https://rpc-testnet.supra.com
- To use mainnet: Update chain ID in `useStarkeyWallet.ts`

## Dependencies

- `tweetnacl` - For message signature verification
- `framer-motion` - UI animations
- `lucide-react` - Icons
- `next` - React framework

## Removed Dependencies

- `@aptos-labs/wallet-adapter-react` - No longer needed
- All Aptos wallet adapters - Replaced with Starkey

## Notes

- This app **only supports Starkey wallet**
- No other wallets (Aptos or Supra) are supported
- All transactions go through Supra network via Starkey
- Contracts should be deployed on Supra network
