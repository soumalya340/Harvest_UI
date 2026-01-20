# Harvest Staking Platform

A modern, user-friendly UI for the Harvest staking contracts on Aptos. This application allows users to stake tokens, earn rewards, and manage staking pools with NFT boost functionality.

## Features

- 🔐 **Wallet Integration**: Connect with Petra, Pontem, and other Aptos wallets
- 📊 **Pool Management**: View and interact with staking pools
- 💰 **Staking & Unstaking**: Easy token staking and unstaking interface
- 🌾 **Reward Harvesting**: Claim your staking rewards
- ⚡ **NFT Boosts**: Apply NFT boosts (v1 and v2) to increase rewards
- 🏗️ **Pool Registration**: Create new staking pools with optional boost support
- 🚨 **Emergency Unstake**: Emergency unstake functionality when needed

## Prerequisites

- Node.js 18+ and npm
- An Aptos wallet (Petra or Pontem recommended)
- Deployed Harvest contracts on Aptos

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the contract address in `app/utils/contract.ts`:
```typescript
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

3. (Optional) Update the network in `app/utils/contract.ts` and `app/providers/WalletProvider.tsx`:
   - Change `Network.TESTNET` to `Network.MAINNET` for production

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" in the top right
2. Select your preferred wallet (Petra, Pontem, etc.)
3. Approve the connection in your wallet

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
harvest/
├── app/
│   ├── components/
│   │   ├── WalletButton.tsx      # Wallet connection UI
│   │   ├── PoolCard.tsx          # Individual pool display and actions
│   │   ├── PoolRegistrationForm.tsx  # Pool creation form
│   │   └── BoostManager.tsx      # NFT boost management
│   ├── providers/
│   │   └── WalletProvider.tsx    # Aptos wallet adapter provider
│   ├── utils/
│   │   └── contract.ts           # Contract interaction utilities
│   ├── layout.tsx                # Root layout with wallet provider
│   └── page.tsx                  # Main application page
├── harvest-contracts/            # Aptos Move contracts
└── package.json
```

## Contract Functions Supported

All functions from `harvest::script1` module are supported:

- `register_pool_coin` / `register_pool_with_boost_coin`
- `stake_coin`
- `unstake_coin`
- `harvest_coin`
- `deposit_reward_coins_coin`
- `add_rewards_and_time_coin`
- `emergency_unstake_coin`
- `boost_v1` / `boost_v2`
- `remove_boost`
- `toggle_whitelisted_user`

## Configuration

### Network Configuration

Update the network in:
- `app/utils/contract.ts`: Change `Network.TESTNET` to your desired network
- `app/providers/WalletProvider.tsx`: Update `dappConfig` network

### Contract Address

Update `CONTRACT_ADDRESS` in `app/utils/contract.ts` with your deployed contract address.

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
