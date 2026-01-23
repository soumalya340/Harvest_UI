# Getting Started with Harvest Contract Functions

Quick start guide to use all 24 contract functions from your Move smart contract.

---

## 🎯 Step 1: Configure Contract Address

Open `/app/utils/contract.ts` and update:

```typescript
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

---

## 🔌 Step 2: Connect Starkey Wallet

1. Install Starkey wallet from https://starkey.app
2. Create or import your wallet
3. Get testnet SUPRA tokens
4. Run the app and click "Connect Starkey"

---

## 🚀 Step 3: Choose Your Approach

### Option A: Use the Testing UI (Easiest)

Perfect for testing and learning all functions.

```typescript
// app/test/page.tsx
import { AllContractFunctions } from '../components/AllContractFunctions';

export default function TestPage() {
  return (
    <main className="min-h-screen p-8">
      <AllContractFunctions />
    </main>
  );
}
```

Navigate to `/test` and you'll see an interactive UI with all 24 functions organized by category.

### Option B: Use Functions Directly (Recommended)

For production code in your components:

```typescript
'use client';

import { useState } from 'react';
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

export function MyStakingComponent() {
  const wallet = useAptosMultiWalletWithRefresh();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleStake = async () => {
    setLoading(true);
    try {
      // 1. Create transaction parameters
      const txParams = contractFunctions.stakeCoin(
        '0xPOOL_ADDRESS',           // Pool object address
        '100000000',                // Amount (1 token with 8 decimals)
        '0x1::aptos_coin::AptosCoin' // Token type
      );

      // 2. Send transaction
      const hash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.serializedArgs,    // Pre-serialized arguments
        txParams.typeArgs
      );

      setTxHash(hash);
      alert(`Success! Transaction: ${hash}`);
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleStake}
        disabled={loading || !wallet.connected}
      >
        {loading ? 'Staking...' : 'Stake Tokens'}
      </button>
      {txHash && <p>Transaction: {txHash}</p>}
    </div>
  );
}
```

---

## 📚 Step 4: Learn the Functions

### Quick Examples

#### Stake Tokens
```typescript
const txParams = contractFunctions.stakeCoin(
  poolAddress,
  amount,
  tokenType
);
```

#### Harvest Rewards
```typescript
const txParams = contractFunctions.harvestCoin(
  poolAddress,
  rewardTokenType
);
```

#### Create Pool
```typescript
const txParams = contractFunctions.registerPoolCoin(
  stakeMetadataAddress,
  rewardMetadataAddress,
  rewardAmount,
  startTime,
  duration,
  stakeTokenType,
  rewardTokenType
);
```

#### Apply NFT Boost
```typescript
// For Token V2 (Digital Assets)
const txParams = contractFunctions.boostV2(
  poolAddress,
  nftObjectAddress
);
```

---

## 🎓 Understanding the Response

Every function returns a `TransactionParams` object:

```typescript
{
  moduleAddress: '0x...',       // Your contract address
  moduleName: 'script1',        // Module name
  functionName: 'stake_coin',   // Function to call
  typeArgs: ['0x1::...'],       // Type parameters
  args: [...],                  // Raw arguments (reference)
  serializedArgs: [...]         // BCS-encoded (use this!)
}
```

---

## ⚡ Common Patterns

### Pattern 1: Simple Transaction

```typescript
const handleAction = async () => {
  const txParams = contractFunctions.FUNCTION_NAME(...args);
  const txHash = await wallet.sendRawTransaction(
    txParams.moduleAddress,
    txParams.moduleName,
    txParams.functionName,
    txParams.serializedArgs,
    txParams.typeArgs
  );
  console.log('Success:', txHash);
};
```

### Pattern 2: With Error Handling

```typescript
const handleAction = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const txParams = contractFunctions.FUNCTION_NAME(...args);
    const txHash = await wallet.sendRawTransaction(...);
    setSuccess(`Success! Tx: ${txHash}`);
  } catch (err: any) {
    setError(err.message || 'Transaction failed');
  } finally {
    setLoading(false);
  }
};
```

### Pattern 3: With State Updates

```typescript
const handleAction = async () => {
  const txParams = contractFunctions.FUNCTION_NAME(...args);
  const txHash = await wallet.sendRawTransaction(...);
  
  // Update wallet balance
  await wallet.updateBalance(wallet.accounts[0]);
  
  // Refresh UI
  await fetchPoolData();
};
```

---

## 🔍 All Available Functions

### Authorization
```typescript
contractFunctions.toggleWhitelistedUser(userAddress)
```

### Pool Creation
```typescript
contractFunctions.registerPoolCoin(...)
contractFunctions.registerPoolWithBoostCoin(...)
```

### Staking
```typescript
contractFunctions.stakeCoin(pool, amount, tokenType)
contractFunctions.unstakeCoin(pool, amount, tokenType)
contractFunctions.harvestCoin(pool, rewardType)
contractFunctions.emergencyUnstakeCoin(pool, tokenType)
```

### Rewards
```typescript
contractFunctions.depositRewardCoinsCoin(pool, metadata, amount, type)
contractFunctions.addRewardsAndTimeCoin(pool, metadata, amount, time, type)
```

### NFT Boost
```typescript
contractFunctions.boostV1(pool, owner, collection, token, version)
contractFunctions.boostV2(pool, nftAddress)
contractFunctions.removeBoost(pool)
```

### Admin
```typescript
contractFunctions.enableEmergency(pool)
contractFunctions.withdrawRewardToTreasury(pool, amount)
```

### Fungible Asset (FA) Versions
Same functions without type parameters:
```typescript
contractFunctions.stake(pool, amount)
contractFunctions.unstake(pool, amount)
contractFunctions.harvest(pool)
// ... etc
```

---

## 💡 Pro Tips

### 1. Use Type-Safe Amounts

```typescript
// For tokens with 8 decimals
const amount = (1 * 100_000_000).toString(); // 1 token
const amount = (0.5 * 100_000_000).toString(); // 0.5 tokens
```

### 2. Handle Timestamps Correctly

```typescript
// Current time
const now = Math.floor(Date.now() / 1000);

// 30 days from now
const thirtyDaysLater = now + (30 * 24 * 60 * 60);
```

### 3. Full Type Paths Required

```typescript
// ✅ Correct
'0x1::aptos_coin::AptosCoin'
'0x123abc::my_module::MyToken'

// ❌ Wrong
'AptosCoin'
'MyToken'
```

### 4. Check Wallet Connection

```typescript
const wallet = useAptosMultiWalletWithRefresh();
const isConnected = wallet.accounts && wallet.accounts.length > 0;

if (!isConnected) {
  // Show connect wallet button
  return <ConnectWalletButton />;
}
```

---

## 🐛 Debugging

### Enable Console Logging

All transaction calls log to console. Open DevTools:
- Chrome: F12 or Cmd+Option+I
- Check Console tab for detailed logs

### Common Issues

1. **"BCS is not defined"**
   - Wait a few seconds for library to load
   - Check Network tab in DevTools

2. **"Wallet not connected"**
   - Verify Starkey is installed
   - Click "Connect Starkey" button

3. **Transaction fails silently**
   - Check console for error details
   - Verify contract address is correct
   - Ensure wallet has sufficient balance

4. **Wrong type arguments**
   - Use full type paths with double colons
   - Example: `0x1::aptos_coin::AptosCoin`

---

## 📖 Next Steps

1. **Read Documentation:**
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup
   - [CONTRACT_FUNCTIONS_GUIDE.md](./CONTRACT_FUNCTIONS_GUIDE.md) - Complete guide

2. **Try Testing UI:**
   - Import `AllContractFunctions` component
   - Test each function interactively

3. **Build Your Feature:**
   - Copy patterns from examples
   - Add error handling
   - Test on testnet

4. **Deploy to Production:**
   - Update contract address
   - Switch to mainnet
   - Test thoroughly!

---

## 🎉 You're Ready!

You now have access to all 24 contract functions with:
- ✅ Automatic BCS serialization
- ✅ Type-safe TypeScript interfaces
- ✅ Comprehensive error handling
- ✅ Interactive testing UI
- ✅ Complete documentation

**Start building your staking dApp!** 🚀

---

## 🆘 Need Help?

- 📚 Check [CONTRACT_FUNCTIONS_GUIDE.md](./CONTRACT_FUNCTIONS_GUIDE.md)
- 🔍 Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- 💬 Open an issue on GitHub
- 🌐 Visit https://docs.supra.com

Happy coding! 💻✨
