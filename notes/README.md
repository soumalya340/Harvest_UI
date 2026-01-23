# Harvest Staking Platform

A modern, user-friendly UI for the Harvest staking contracts on Supra. This application allows users to stake tokens, earn rewards, and manage staking pools with NFT boost functionality.

## Features

- 🔐 **Wallet Integration**: Connect with Starkey wallet on Supra Network
- 📊 **Pool Management**: View and interact with staking pools
- 💰 **Staking & Unstaking**: Easy token staking and unstaking interface
- 🌾 **Reward Harvesting**: Claim your staking rewards
- ⚡ **NFT Boosts**: Apply NFT boosts (v1 and v2) to increase rewards
- 🏗️ **Pool Registration**: Create new staking pools with optional boost support
- 🚨 **Emergency Unstake**: Emergency unstake functionality when needed
- 🔄 **Proper Serialization**: Uses supra-multiwallet pattern for correct argument serialization

## Prerequisites

- Node.js 18+ and npm
- Starkey wallet extension for Supra Network
- Deployed Harvest contracts on Supra

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the contract address in `app/utils/contract.ts`:
```typescript
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

3. The app is configured to work with Supra Testnet (chainId: 6) by default
   - Update the chainId in `app/hooks/useStarkeyWallet.ts` if needed

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" in the top right
2. Approve the connection in your Starkey wallet
3. Ensure you're on the correct network (Supra Testnet or Mainnet)

### Staking Tokens

1. Browse available staking pools
2. Enter the amount you want to stake
3. Click "Stake" and approve the transaction in your wallet
4. Wait for transaction confirmation

### Harvesting Rewards

1. Find a pool where you have staked tokens
2. Click "Harvest Rewards"
3. Approve the transaction in your wallet
4. Your rewards will be deposited to your wallet

### Registering a New Pool

1. Click "Register New Pool"
2. Fill in the required information:
   - Stake and Reward metadata addresses
   - Token types (e.g., `0x1::aptos_coin::AptosCoin`)
   - Reward amount
   - Start time and duration
3. (Optional) Enable NFT boost and configure boost settings
4. Submit the transaction

### Applying NFT Boosts

1. Find a pool that supports boosts
2. Click "Manage NFT Boost"
3. Choose Boost V1 or V2:
   - **V1**: Provide collection owner, name, token name, and property version
   - **V2**: Provide the NFT object address
4. Submit the transaction

## Project Structure

```
harvest-ui/
├── app/
│   ├── components/
│   │   ├── WalletButton.tsx      # Wallet connection UI
│   │   ├── PoolCard.tsx          # Individual pool display and actions
│   │   ├── PoolRegistrationForm.tsx  # Pool creation form
│   │   ├── BoostManager.tsx      # NFT boost management
│   │   └── ConnectWalletHandler.tsx  # Wallet connection handler
│   ├── hooks/
│   │   ├── useStarkeyWallet.ts   # Starkey wallet integration
│   │   └── useConversionUtils.ts # Argument serialization utilities
│   ├── providers/
│   │   └── WalletProvider.tsx    # Wallet provider
│   ├── utils/
│   │   └── contract.ts           # Contract interaction utilities
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── harvest-contracts/            # Move contracts
│   └── scripts.move              # Contract entry functions
├── FUNCTION_CALLS.md             # Detailed function call documentation
└── package.json
```

## Contract Functions Supported

All main functions from `harvest::script1` module are supported:

### Core Functions (FA-based)
- `register_pool` - Register a new staking pool
- `register_pool_with_boost` - Register a pool with NFT boost
- `stake` - Stake tokens into a pool
- `unstake` - Unstake tokens from a pool
- `harvest` - Harvest rewards from a pool

### Additional Functions
- `deposit_reward_coins` - Add more rewards to a pool
- `add_rewards_and_time` - Extend pool duration and rewards
- `emergency_unstake` - Emergency unstake all tokens
- `boost_v1` / `boost_v2` - Apply NFT boosts
- `remove_boost` - Remove NFT boost
- `toggle_whitelisted_user` - Admin function
- `enable_emergency` - Admin function
- `withdraw_reward_to_treasury` - Admin function

For detailed usage examples, see [FUNCTION_CALLS.md](./FUNCTION_CALLS.md).

## Configuration

### Network Configuration

The app is configured for Supra Testnet (chainId: 6) by default. To change:
- Update `chainId` in `app/hooks/useStarkeyWallet.ts` (line 213)
- Change from `'6'` (Testnet) to `'8'` (Mainnet)

### Contract Address

Update `CONTRACT_ADDRESS` in `app/utils/contract.ts` with your deployed contract address:

```typescript
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

## Key Integration Features

### Supra-Multiwallet Pattern

This application uses the supra-multiwallet reference pattern for proper argument serialization:

1. **useConversionUtils**: Provides serialization utilities for Move types (u8, u64, u128, address, String, etc.)
2. **Automatic Serialization**: The wallet hook automatically serializes arguments based on function signatures
3. **Type Safety**: Function calls are type-checked and properly formatted

Example:
```typescript
// The contract function returns raw args
const txParams = contractFunctions.stake(poolAddress, amount);

// The wallet hook serializes them automatically
const txHash = await sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.rawArgs,  // Raw args (not yet serialized)
  txParams.typeArgs,
  true  // Enable automatic serialization
);
```

## Development

### Adding New Features

1. Contract interactions: Add new functions to `app/utils/contract.ts`
2. UI components: Create new components in `app/components/`
3. Pages: Add new pages in `app/` directory

### Fetching On-Chain Data

Currently, the app uses mock pool data. To fetch real data:

1. Use the Aptos SDK to query pool objects
2. Parse the pool data structure from your contracts
3. Update the `useEffect` in `app/page.tsx` to fetch and display real pools

## Troubleshooting

### Wallet Connection Issues

- Ensure your wallet extension is installed and unlocked
- Check that you're on the correct network (Testnet/Mainnet)
- Try disconnecting and reconnecting your wallet

### Transaction Failures

- Verify you have sufficient APT for gas fees
- Check that the contract address is correct
- Ensure you have the required token balances
- Verify pool is active and not expired

## License

MIT

## Support

For issues related to:
- **UI**: Open an issue in this repository
- **Contracts**: Check the `harvest-contracts` directory
