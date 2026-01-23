# Complete Guide: All Contract Functions in Harvest

This guide covers **all 24 functions** from `harvest-contracts/sources/scripts.move` and how to call them using Starkey wallet on Supra blockchain.

## 📋 Table of Contents

1. [Setup Requirements](#setup-requirements)
2. [Authorization Functions](#1-authorization-functions)
3. [Pool Management (Coin Versions)](#2-pool-management-coin-versions)
4. [Staking Operations](#3-staking-operations)
5. [Reward Management](#4-reward-management)
6. [NFT Boost Functions](#5-nft-boost-functions)
7. [Admin Functions](#6-admin-functions)
8. [Fungible Asset (FA) Versions](#7-fungible-asset-fa-versions)
9. [Usage Examples](#usage-examples)
10. [Important Notes](#important-notes)

---

## Setup Requirements

### 1. Update Contract Address

Edit `/app/utils/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 2. BCS Library

The BCS (Binary Canonical Serialization) library is automatically loaded from CDN in `layout.tsx`. It's required for serializing transaction arguments.

### 3. Wallet Connection

All functions require a connected Starkey wallet:

```typescript
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';

const wallet = useAptosMultiWalletWithRefresh();
const connected = wallet.accounts && wallet.accounts.length > 0;
```

---

## 1. Authorization Functions

### `toggle_whitelisted_user`

**Purpose:** Toggle user whitelist status (admin only)

**Move Signature:**
```move
public entry fun toggle_whitelisted_user(caller: &signer, user: address)
```

**Usage:**
```typescript
import { contractFunctions } from '../utils/contract';

const txParams = contractFunctions.toggleWhitelistedUser(
  '0x123...' // user address
);

const txHash = await wallet.sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.serializedArgs,
  txParams.typeArgs
);
```

---

## 2. Pool Management (Coin Versions)

### `register_pool_coin<S, R>`

**Purpose:** Create a new staking pool with coin type parameters

**Move Signature:**
```move
public entry fun register_pool_coin<S, R>(
    pool_owner: &signer,
    stake_metadata_address: address,
    reward_metadata_address: address,
    reward_amount: u64,
    start_time: u64,
    duration: u64
)
```

**Usage:**
```typescript
const txParams = contractFunctions.registerPoolCoin(
  '0xSTAKE_METADATA_ADDRESS',
  '0xREWARD_METADATA_ADDRESS',
  '1000000000',                          // 1 billion smallest units
  Math.floor(Date.now() / 1000),        // Current Unix timestamp
  2592000,                               // 30 days in seconds
  '0x1::aptos_coin::AptosCoin',         // Stake token type
  '0x1::aptos_coin::AptosCoin'          // Reward token type
);

const txHash = await wallet.sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.serializedArgs,
  txParams.typeArgs
);
```

### `register_pool_with_boost_coin<S, R>`

**Purpose:** Create pool with NFT boost support

**Usage:**
```typescript
const txParams = contractFunctions.registerPoolWithBoostCoin(
  '0xSTAKE_METADATA',
  '0xREWARD_METADATA',
  '1000000000',
  Math.floor(Date.now() / 1000),
  2592000,
  2,                                     // NFT version (1 or 2)
  '0xCOLLECTION_ADDRESS',
  'Cool NFT Collection',
  150,                                   // 150% boost (as u128)
  '0x1::aptos_coin::AptosCoin',
  '0x1::aptos_coin::AptosCoin'
);
```

---

## 3. Staking Operations

### `stake_coin<S>`

**Purpose:** Stake tokens into a pool

**Move Signature:**
```move
public entry fun stake_coin<S>(
    user: &signer,
    pool_obj: Object<StakePool>,
    stake_amount: u64
)
```

**Usage:**
```typescript
const txParams = contractFunctions.stakeCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '100000000',                           // Amount to stake
  '0x1::aptos_coin::AptosCoin'          // Token type
);

const txHash = await wallet.sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.serializedArgs,
  txParams.typeArgs
);
```

### `unstake_coin<S>`

**Purpose:** Unstake tokens from pool

**Usage:**
```typescript
const txParams = contractFunctions.unstakeCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '50000000',                            // Amount to unstake
  '0x1::aptos_coin::AptosCoin'
);
```

### `harvest_coin<R>`

**Purpose:** Claim staking rewards

**Usage:**
```typescript
const txParams = contractFunctions.harvestCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '0x1::aptos_coin::AptosCoin'          // Reward token type
);
```

### `emergency_unstake_coin<S>`

**Purpose:** Emergency unstake (forfeits all rewards and removes boost)

**Usage:**
```typescript
const txParams = contractFunctions.emergencyUnstakeCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '0x1::aptos_coin::AptosCoin'
);
```

---

## 4. Reward Management

### `deposit_reward_coins_coin<R>`

**Purpose:** Add more rewards to existing pool

**Usage:**
```typescript
const txParams = contractFunctions.depositRewardCoinsCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '0xREWARD_METADATA_ADDRESS',
  '500000000',                           // Additional reward amount
  '0x1::aptos_coin::AptosCoin'
);
```

### `add_rewards_and_time_coin<R>`

**Purpose:** Add rewards AND extend pool duration

**Usage:**
```typescript
const txParams = contractFunctions.addRewardsAndTimeCoin(
  '0xPOOL_OBJECT_ADDRESS',
  '0xREWARD_METADATA_ADDRESS',
  '500000000',                           // Additional rewards
  604800,                                // Add 7 days (in seconds)
  '0x1::aptos_coin::AptosCoin'
);
```

---

## 5. NFT Boost Functions

### `boost_v1`

**Purpose:** Apply NFT boost using old NFT standard (Token v1)

**Move Signature:**
```move
public entry fun boost_v1(
    user: &signer,
    pool_obj: Object<StakePool>,
    collection_owner: address,
    collection_name: String,
    token_name: String,
    property_version: u64
)
```

**Usage:**
```typescript
const txParams = contractFunctions.boostV1(
  '0xPOOL_OBJECT_ADDRESS',
  '0xCOLLECTION_OWNER',
  'My NFT Collection',
  'Token #123',
  0                                      // Property version
);
```

### `boost_v2`

**Purpose:** Apply NFT boost using new digital asset standard (Token v2)

**Usage:**
```typescript
const txParams = contractFunctions.boostV2(
  '0xPOOL_OBJECT_ADDRESS',
  '0xNFT_OBJECT_ADDRESS'                // Digital asset object address
);
```

### `remove_boost`

**Purpose:** Remove NFT boost and return NFT to user

**Usage:**
```typescript
const txParams = contractFunctions.removeBoost(
  '0xPOOL_OBJECT_ADDRESS'
);
```

---

## 6. Admin Functions

### `enable_emergency`

**Purpose:** Enable emergency mode for a pool (admin only)

**Usage:**
```typescript
const txParams = contractFunctions.enableEmergency(
  '0xPOOL_OBJECT_ADDRESS'
);
```

### `withdraw_reward_to_treasury`

**Purpose:** Withdraw unused rewards to treasury (admin only)

**Usage:**
```typescript
const txParams = contractFunctions.withdrawRewardToTreasury(
  '0xPOOL_OBJECT_ADDRESS',
  '100000000'                            // Amount to withdraw
);
```

---

## 7. Fungible Asset (FA) Versions

These functions work with Fungible Assets directly without requiring type parameters.

### Available FA Functions:

1. **`registerPool`** - Register pool (no type params)
2. **`registerPoolWithBoost`** - Register pool with boost (no type params)
3. **`stake`** - Stake FA
4. **`unstake`** - Unstake FA
5. **`harvest`** - Harvest FA rewards
6. **`depositRewardCoins`** - Deposit FA rewards
7. **`addRewardsAndTime`** - Add FA rewards and time
8. **`emergencyUnstake`** - Emergency unstake FA

**Example Usage (FA version):**
```typescript
// FA version - no type parameters needed
const txParams = contractFunctions.stake(
  '0xPOOL_OBJECT_ADDRESS',
  '100000000'                            // Amount
  // Note: No token type parameter required!
);
```

---

## Usage Examples

### Complete Transaction Flow

```typescript
'use client';

import { useState } from 'react';
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

export function StakeComponent() {
  const wallet = useAptosMultiWalletWithRefresh();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStake = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Prepare transaction parameters
      const txParams = contractFunctions.stakeCoin(
        '0xPOOL_ADDRESS',
        '100000000',
        '0x1::aptos_coin::AptosCoin'
      );

      // 2. Send transaction
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.serializedArgs,  // Pre-serialized arguments
        txParams.typeArgs
      );

      // 3. Success!
      setSuccess(`Staked successfully! Tx: ${txHash}`);
      
      // 4. Optional: Update UI state
      await wallet.updateBalance(wallet.accounts[0]);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Stake error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <button 
        onClick={handleStake} 
        disabled={loading || !wallet.connected}
      >
        {loading ? 'Staking...' : 'Stake Tokens'}
      </button>
    </div>
  );
}
```

### Using AllContractFunctions Component

Import and use the comprehensive testing interface:

```typescript
// app/page.tsx
import { AllContractFunctions } from './components/AllContractFunctions';

export default function Home() {
  return (
    <main>
      <AllContractFunctions />
    </main>
  );
}
```

---

## Important Notes

### 1. Type Arguments Format

Type arguments must be **full type paths**:

✅ **Correct:**
```typescript
'0x1::aptos_coin::AptosCoin'
'0x123abc::my_module::MyToken'
```

❌ **Incorrect:**
```typescript
'AptosCoin'
'MyToken'
```

### 2. Amount Units

All amounts are in **smallest units** (like wei in Ethereum):

- 1 APT = 100,000,000 octas (8 decimals)
- Always use string or BigInt for large numbers

```typescript
// Stake 1 APT
contractFunctions.stakeCoin(
  poolAddress,
  '100000000',  // 1 * 10^8
  tokenType
);
```

### 3. Timestamps

Unix timestamps in **seconds** (not milliseconds):

```typescript
const startTime = Math.floor(Date.now() / 1000);  // Current time in seconds
const oneDay = 86400;                              // 24 * 60 * 60
```

### 4. Addresses

All addresses must be:
- Hex strings starting with `0x`
- Properly serialized (handled automatically by `serializedArgs`)

### 5. Object Addresses

Pool objects, NFT objects, and metadata objects are all represented as addresses:

```typescript
'0xPOOL_OBJECT_ADDRESS'      // Pool created by register_pool
'0xNFT_OBJECT_ADDRESS'       // Digital asset (v2 NFT)
'0xMETADATA_ADDRESS'         // Token metadata object
```

### 6. Error Handling

Always wrap transactions in try-catch:

```typescript
try {
  const txHash = await wallet.sendRawTransaction(...);
  console.log('Success:', txHash);
} catch (error) {
  console.error('Transaction failed:', error);
  // Show user-friendly error message
}
```

### 7. BCS Serialization

Arguments are automatically serialized using the `serializedArgs` field. The raw `args` field is kept for reference.

### 8. Gas and Fees

- Supra blockchain transactions require gas fees
- Make sure wallet has sufficient balance
- Starkey wallet handles gas estimation automatically

---

## Testing Checklist

Use this checklist to test all functions:

- [ ] Authorization: `toggleWhitelistedUser`
- [ ] Pool Creation: `registerPoolCoin`
- [ ] Pool with Boost: `registerPoolWithBoostCoin`
- [ ] Stake: `stakeCoin`
- [ ] Unstake: `unstakeCoin`
- [ ] Harvest: `harvestCoin`
- [ ] Emergency Unstake: `emergencyUnstakeCoin`
- [ ] Deposit Rewards: `depositRewardCoinsCoin`
- [ ] Extend Pool: `addRewardsAndTimeCoin`
- [ ] Boost V1: `boostV1`
- [ ] Boost V2: `boostV2`
- [ ] Remove Boost: `removeBoost`
- [ ] Enable Emergency: `enableEmergency`
- [ ] Withdraw Treasury: `withdrawRewardToTreasury`
- [ ] FA Versions: All 8 FA functions

---

## Resources

- **Contract Source:** `/harvest-contracts/sources/scripts.move`
- **Contract Utils:** `/app/utils/contract.ts`
- **BCS Utils:** `/app/utils/bcs.ts`
- **Wallet Hook:** `/app/hooks/useStarkeyWallet.ts`
- **Example Component:** `/app/components/AllContractFunctions.tsx`
- **Supra SDK Docs:** https://docs.supra.com

---

## Need Help?

1. Check console logs for detailed error messages
2. Verify contract address is correct
3. Ensure wallet is connected
4. Check transaction on Supra explorer
5. Verify BCS library is loaded (check browser console)

Happy staking! 🚀
