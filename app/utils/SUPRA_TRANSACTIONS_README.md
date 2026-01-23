# Supra Transactions Utility

This utility provides direct blockchain interaction functions using the Supra SDK, based on the pattern from `supra_call/index.js`.

## Installation

Make sure you have the required package installed:

```bash
npm install supra-l1-sdk
```

## Functions

### 1. `registerPool(params: RegisterPoolParams)`

Register a new staking pool.

**Parameters:**
- `privateKey: string` - Private key of the account registering the pool
- `stakeMetadataAddress: string` - Address of the stake token metadata
- `rewardMetadataAddress: string` - Address of the reward token metadata
- `startTime: number` - Unix timestamp in seconds for when the pool starts
- `rewardAmountBaseUnits: bigint` - Reward amount in base units (use `toBaseUnits()` helper)
- `duration: number` - Pool duration in seconds

**Example:**
```typescript
import { registerPool, toBaseUnits } from './utils/supraTransactions';

const result = await registerPool({
  privateKey: '0x...',
  stakeMetadataAddress: '0x8b560a2498dbd80db9dbed09424cd3be73d3e4ef2f07525af95afb4ca956c73c',
  rewardMetadataAddress: '0xbfb731e2a66b9b2028d6c06166d413b924658497adbcd907e2e709ede456aa73',
  startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  rewardAmountBaseUnits: toBaseUnits(100, 8), // 100 tokens with 8 decimals
  duration: 7 * 24 * 60 * 60 // 7 days
});

console.log('Transaction Hash:', result.txHash);
console.log('Explorer URL:', result.explorerUrl);
```

### 2. `stake(params: StakeParams)`

Stake tokens in a pool.

**Parameters:**
- `privateKey: string` - Private key of the account staking
- `poolObj: string` - Pool object address
- `stakeAmountBaseUnits: bigint` - Amount to stake in base units (use `toBaseUnits()` helper)

**Example:**
```typescript
import { stake, toBaseUnits } from './utils/supraTransactions';

const result = await stake({
  privateKey: '0x...',
  poolObj: '0x...', // Pool object address
  stakeAmountBaseUnits: toBaseUnits(50, 8) // 50 tokens with 8 decimals
});

console.log('Transaction Hash:', result.txHash);
```

### 3. `harvest(params: HarvestParams)`

Harvest rewards from a pool.

**Parameters:**
- `privateKey: string` - Private key of the account harvesting
- `poolObj: string` - Pool object address

**Example:**
```typescript
import { harvest } from './utils/supraTransactions';

const result = await harvest({
  privateKey: '0x...',
  poolObj: '0x...' // Pool object address
});

console.log('Transaction Hash:', result.txHash);
```

### 4. `unstake(params: UnstakeParams)`

Unstake tokens from a pool.

**Parameters:**
- `privateKey: string` - Private key of the account unstaking
- `poolObj: string` - Pool object address
- `unstakeAmountBaseUnits: bigint` - Amount to unstake in base units

**Example:**
```typescript
import { unstake, toBaseUnits } from './utils/supraTransactions';

const result = await unstake({
  privateKey: '0x...',
  poolObj: '0x...',
  unstakeAmountBaseUnits: toBaseUnits(25, 8) // 25 tokens
});

console.log('Transaction Hash:', result.txHash);
```

## Helper Functions

### `toBaseUnits(amount: number | string, decimals: number = 8): bigint`

Converts human-readable token amounts to base units.

```typescript
import { toBaseUnits } from './utils/supraTransactions';

const baseUnits = toBaseUnits(100, 8); // 100 tokens with 8 decimals = 10000000000
```

### `fromBaseUnits(baseUnits: bigint | string | number, decimals: number = 8): number`

Converts base units back to human-readable format.

```typescript
import { fromBaseUnits } from './utils/supraTransactions';

const tokens = fromBaseUnits(10000000000n, 8); // 10000000000 base units = 100 tokens
```

## Return Value

All transaction functions return a `TransactionResult` object:

```typescript
interface TransactionResult {
  txHash: string;        // Transaction hash
  success: boolean;       // Whether the transaction succeeded
  explorerUrl: string;   // URL to view transaction on explorer
}
```

## Error Handling

All functions throw errors if the transaction fails. Wrap in try-catch:

```typescript
try {
  const result = await stake({ ... });
  console.log('Success:', result.txHash);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Notes

- All functions use the Supra SDK directly (no wallet extension required)
- Private keys are required for signing transactions
- Amounts must be in base units (use `toBaseUnits()` helper)
- Transactions are automatically simulated and waited for completion
- Network configuration is read from `constant.ts`

## Security Warning

⚠️ **Never commit private keys to version control!**

Use environment variables or secure key management:

```typescript
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('PRIVATE_KEY not found in environment');
}
```
