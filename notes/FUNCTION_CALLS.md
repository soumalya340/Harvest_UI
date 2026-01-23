# Harvest UI - Function Calls Guide

This guide explains how to call the 4 main functions of the harvest staking contract: `register_pool`, `register_pool_with_boost`, `stake`, and `harvest`.

## Setup

The harvest-ui now uses the supra-multiwallet pattern for proper argument serialization. The key components are:

1. **useConversionUtils** - Handles serialization of arguments to the proper Move types
2. **contractFunctions** - Provides pre-configured function call parameters
3. **useStarkeyWallet** - Manages wallet connection and transaction signing

## Function Reference

### 1. register_pool

Registers a new staking pool without NFT boost.

**Function Signature:**
```move
public entry fun register_pool(
    pool_owner: &signer,
    stake_metadata: Object<Metadata>,
    reward_metadata: Object<Metadata>,
    start_time: u64,
    reward_amount: u64,
    duration: u64
)
```

**TypeScript Usage:**
```typescript
import { contractFunctions } from './utils/contract';
import useStarkeyWallet from './hooks/useStarkeyWallet';

const { sendRawTransaction } = useStarkeyWallet();

const txParams = contractFunctions.registerPool(
  '0x...stakeMetadataAddress',  // Object<Metadata> for stake token
  '0x...rewardMetadataAddress', // Object<Metadata> for reward token
  '1234567890',                 // start_time (Unix timestamp as string)
  '1000000000',                 // reward_amount (u64 as string)
  '2592000'                     // duration (u64 as string, e.g., 30 days in seconds)
);

const txHash = await sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.rawArgs,
  txParams.typeArgs,
  true  // Indicates args need serialization
);
```

### 2. register_pool_with_boost

Registers a new staking pool with NFT boost functionality.

**Function Signature:**
```move
public entry fun register_pool_with_boost(
    pool_owner: &signer,
    stake_metadata: Object<Metadata>,
    reward_metadata: Object<Metadata>,
    reward_amount: u64,
    start_time: u64,
    duration: u64,
    version: u64,
    collection_identifier: address,
    collection_name: String,
    boost_percent: u128
)
```

**TypeScript Usage:**
```typescript
const txParams = contractFunctions.registerPoolWithBoost(
  '0x...stakeMetadataAddress',  // Object<Metadata> for stake token
  '0x...rewardMetadataAddress', // Object<Metadata> for reward token
  '1000000000',                 // reward_amount (u64 as string)
  '1234567890',                 // start_time (Unix timestamp as string)
  '2592000',                    // duration (u64 as string)
  '1',                          // version (u64 as string) - NFT standard version
  '0x...collectionAddress',     // collection_identifier (address)
  'My NFT Collection',          // collection_name (String)
  '1000000'                     // boost_percent (u128 as string, e.g., 10% = 1000000)
);

const txHash = await sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.rawArgs,
  txParams.typeArgs,
  true
);
```

### 3. stake

Stakes tokens into a pool.

**Function Signature:**
```move
public entry fun stake(
    user: &signer,
    pool_obj: Object<StakePool>,
    stake_amount: u64
)
```

**TypeScript Usage:**
```typescript
const txParams = contractFunctions.stake(
  '0x...poolObjectAddress',  // Object<StakePool> address
  '100000000'                // stake_amount (u64 as string)
);

const txHash = await sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.rawArgs,
  txParams.typeArgs,
  true
);
```

### 4. harvest

Harvests rewards from a pool.

**Function Signature:**
```move
public entry fun harvest(
    user: &signer,
    pool_obj: Object<StakePool>
)
```

**TypeScript Usage:**
```typescript
const txParams = contractFunctions.harvest(
  '0x...poolObjectAddress'  // Object<StakePool> address
);

const txHash = await sendRawTransaction(
  txParams.moduleAddress,
  txParams.moduleName,
  txParams.functionName,
  txParams.rawArgs,
  txParams.typeArgs,
  true
);
```

## Additional Functions

The contract also provides these helper functions:

### unstake
```typescript
const txParams = contractFunctions.unstake(
  '0x...poolObjectAddress',
  '50000000'  // amount to unstake
);
```

### depositRewardCoins
```typescript
const txParams = contractFunctions.depositRewardCoins(
  '0x...poolObjectAddress',
  '500000000'  // additional rewards to deposit
);
```

### addRewardsAndTime
```typescript
const txParams = contractFunctions.addRewardsAndTime(
  '0x...poolObjectAddress',
  '500000000',  // additional rewards
  '86400'       // additional time (seconds)
);
```

### emergencyUnstake
```typescript
const txParams = contractFunctions.emergencyUnstake(
  '0x...poolObjectAddress'
);
```

### Boost Functions

#### boostV1 (NFT Standard v1)
```typescript
const txParams = contractFunctions.boostV1(
  '0x...poolObjectAddress',
  '0x...collectionOwner',
  'CollectionName',
  'TokenName',
  '0'  // property version
);
```

#### boostV2 (NFT Standard v2)
```typescript
const txParams = contractFunctions.boostV2(
  '0x...poolObjectAddress',
  '0x...nftObjectAddress'
);
```

#### removeBoost
```typescript
const txParams = contractFunctions.removeBoost(
  '0x...poolObjectAddress'
);
```

## Argument Serialization

The `useStarkeyWallet` hook automatically serializes arguments based on their Move types:

- `address` → serialized using `addressToUint8Array`
- `u8`, `u16`, `u32`, `u64`, `u128` → serialized using respective `serializeUint*` functions
- `String` → serialized using `serializeString`
- `bool` → serialized using `serializeBool`
- `Object<T>` → treated as address and serialized accordingly

## Configuration

Update the contract address in `app/utils/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';
```

## Complete Example

```typescript
'use client';

import { useState } from 'react';
import useStarkeyWallet from './hooks/useStarkeyWallet';
import { contractFunctions } from './utils/contract';

export default function StakingExample() {
  const { connected, sendRawTransaction } = useStarkeyWallet();
  const [loading, setLoading] = useState(false);

  const handleStake = async () => {
    if (!connected) {
      alert('Please connect wallet first');
      return;
    }

    setLoading(true);
    try {
      // Prepare transaction parameters
      const txParams = contractFunctions.stake(
        '0x...poolObjectAddress',
        '100000000'
      );

      // Send transaction
      const txHash = await sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );

      alert(`Stake successful! Hash: ${txHash}`);
    } catch (error) {
      console.error('Stake failed:', error);
      alert('Stake failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleStake} disabled={!connected || loading}>
      {loading ? 'Staking...' : 'Stake Tokens'}
    </button>
  );
}
```

## Notes

- All numeric values should be passed as strings to avoid JavaScript number precision issues
- Object addresses (like `Object<Metadata>`, `Object<StakePool>`) are passed as hex strings
- The wallet must be connected before calling any transaction function
- Transaction results return a hash string that can be used to track the transaction on-chain
