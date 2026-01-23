# Quick Reference: Harvest Contract Functions

## 🚀 Quick Start

1. **Update Contract Address** in `/app/utils/contract.ts`
2. **Connect Starkey Wallet** using the UI
3. **Import and Use** functions from `contractFunctions`

## 📝 Basic Usage Pattern

```typescript
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

// In your component
const wallet = useAptosMultiWalletWithRefresh();

// Create transaction parameters
const txParams = contractFunctions.FUNCTION_NAME(...args);

// Send transaction
const txHash = await wallet.sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.serializedArgs,
  txParams.typeArgs
);
```

## 📚 All 24 Functions at a Glance

### Authorization (1)
- `toggleWhitelistedUser(user)` - Toggle whitelist

### Pool Management - Coin (2)
- `registerPoolCoin(stakeAddr, rewardAddr, amount, start, duration, S, R)` - Create pool
- `registerPoolWithBoostCoin(..., version, collection, name, boost%, S, R)` - Create with boost

### Staking - Coin (4)
- `stakeCoin(pool, amount, S)` - Stake tokens
- `unstakeCoin(pool, amount, S)` - Unstake tokens  
- `harvestCoin(pool, R)` - Claim rewards
- `emergencyUnstakeCoin(pool, S)` - Emergency unstake

### Rewards - Coin (2)
- `depositRewardCoinsCoin(pool, rewardAddr, amount, R)` - Add rewards
- `addRewardsAndTimeCoin(pool, rewardAddr, amount, time, R)` - Add rewards + time

### NFT Boost (3)
- `boostV1(pool, owner, collection, token, version)` - Old NFT boost
- `boostV2(pool, nftAddr)` - New NFT boost
- `removeBoost(pool)` - Remove boost

### Admin (2)
- `enableEmergency(pool)` - Enable emergency mode
- `withdrawRewardToTreasury(pool, amount)` - Withdraw to treasury

### Fungible Asset Versions (8)
- `registerPool(...)` - FA pool
- `registerPoolWithBoost(...)` - FA pool with boost
- `stake(pool, amount)` - FA stake
- `unstake(pool, amount)` - FA unstake
- `harvest(pool)` - FA harvest
- `depositRewardCoins(pool, amount)` - FA deposit
- `addRewardsAndTime(pool, rewards, time)` - FA add
- `emergencyUnstake(pool)` - FA emergency

## 🎯 Common Use Cases

### Stake Tokens
```typescript
const txParams = contractFunctions.stakeCoin(
  '0xPOOL_ADDRESS',
  '100000000', // 1 token (8 decimals)
  '0x1::aptos_coin::AptosCoin'
);
const txHash = await wallet.sendRawTransaction(...);
```

### Harvest Rewards
```typescript
const txParams = contractFunctions.harvestCoin(
  '0xPOOL_ADDRESS',
  '0x1::aptos_coin::AptosCoin'
);
const txHash = await wallet.sendRawTransaction(...);
```

### Apply NFT Boost
```typescript
// For Token v2 (Digital Assets)
const txParams = contractFunctions.boostV2(
  '0xPOOL_ADDRESS',
  '0xNFT_OBJECT_ADDRESS'
);
const txHash = await wallet.sendRawTransaction(...);
```

### Create Pool
```typescript
const txParams = contractFunctions.registerPoolCoin(
  '0xSTAKE_METADATA',
  '0xREWARD_METADATA',
  '1000000000', // 1000 tokens reward
  Math.floor(Date.now() / 1000), // Start now
  2592000, // 30 days
  '0x1::aptos_coin::AptosCoin',
  '0x1::aptos_coin::AptosCoin'
);
const txHash = await wallet.sendRawTransaction(...);
```

## ⚠️ Important

- **Type Args:** Must be full paths: `0x1::aptos_coin::AptosCoin`
- **Amounts:** In smallest unit (1 APT = 100,000,000 octas)
- **Timestamps:** Unix seconds, not milliseconds
- **Addresses:** Hex strings with `0x` prefix
- **BCS:** Automatically loaded via CDN

## 🧪 Testing UI

Use the comprehensive testing interface:

```typescript
import { AllContractFunctions } from './components/AllContractFunctions';

export default function TestPage() {
  return <AllContractFunctions />;
}
```

## 📖 Full Documentation

- **Complete Guide:** [CONTRACT_FUNCTIONS_GUIDE.md](./CONTRACT_FUNCTIONS_GUIDE.md)
- **Starkey Setup:** [STARKEY_SETUP.md](./STARKEY_SETUP.md)
- **Main README:** [README.md](./README.md)

## 🔧 Files Structure

```
harvest/
├── app/
│   ├── utils/
│   │   ├── contract.ts          # All 24 contract functions
│   │   ├── bcs.ts               # BCS serialization utilities
│   │   └── loadBCS.ts           # BCS library loader
│   ├── components/
│   │   ├── AllContractFunctions.tsx  # Comprehensive UI
│   │   ├── PoolCard.tsx         # Pool interaction
│   │   ├── BoostManager.tsx     # NFT boost management
│   │   └── ...
│   └── hooks/
│       └── useStarkeyWallet.ts  # Starkey wallet hook
└── harvest-contracts/
    └── sources/
        └── scripts.move         # Smart contract source
```

## 💡 Pro Tips

1. **Test on Testnet First:** Always test on Supra testnet before mainnet
2. **Check Console:** Detailed logs help debug issues
3. **Verify Transactions:** Use Supra explorer to check tx status
4. **Handle Errors:** Always wrap in try-catch blocks
5. **Update Balance:** Call `wallet.updateBalance()` after transactions
6. **Use serializedArgs:** Pre-serialized args are ready to use

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| BCS not defined | Check browser console, library should auto-load |
| Transaction fails | Verify contract address and wallet balance |
| Wrong type args | Use full path format: `0x1::module::Type` |
| Amount too large | Use string format for large numbers |
| Not connected | Check Starkey wallet is connected |

## 🎨 UI Components

- **WalletButton** - Connect/disconnect wallet
- **PoolCard** - Stake/unstake/harvest interface
- **BoostManager** - NFT boost management
- **PoolRegistrationForm** - Create new pools
- **AllContractFunctions** - Comprehensive testing UI

Ready to build! 🚀
