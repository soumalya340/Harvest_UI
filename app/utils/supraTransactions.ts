/**
 * Supra Transaction Utilities
 * Based on supra_call/index.js pattern using Supra SDK directly
 * 
 * These functions use SupraAccount and SupraClient for direct blockchain interaction
 * without requiring wallet extensions.
 * 
 * IMPORTANT: Make sure to install the required package:
 *   npm install supra-l1-sdk
 */

import {
    SupraAccount,
    SupraClient,
    BCS,
    TxnBuilderTypes,
} from 'supra-l1-sdk';
import { CONTRACT_ADDRESS, MODULE_NAME, NETWORK_CONFIG, TOKEN_DECIMALS } from '../../constant';

// ============================================
// Helper Functions
// ============================================

/**
 * Converts a human-readable token amount to base units
 * Example: toBaseUnits(100, 8) = 10000000000 (100 tokens with 8 decimals)
 */
export function toBaseUnits(amount: number | string, decimals: number = TOKEN_DECIMALS.DEFAULT): bigint {
    const multiplier = BigInt(10 ** decimals);
    const amountBigInt = BigInt(Math.floor(Number(amount)));
    return amountBigInt * multiplier;
}

/**
 * Formats base units back to human readable for display
 */
export function fromBaseUnits(baseUnits: bigint | string | number, decimals: number = TOKEN_DECIMALS.DEFAULT): number {
    const divisor = 10 ** decimals;
    return Number(baseUnits) / divisor;
}

/**
 * Serialize address to Uint8Array
 */
function serializeAddress(addressString: string): Uint8Array {
    const cleanAddress = addressString.startsWith('0x')
        ? addressString
        : '0x' + addressString;
    return BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(cleanAddress));
}

/**
 * Serialize u64 value
 */
function serializeU64(value: number | string | bigint): Uint8Array {
    let num: bigint;
    if (typeof value === 'string') {
        num = BigInt(value);
    } else if (typeof value === 'number') {
        num = BigInt(value);
    } else {
        num = value;
    }
    return BCS.bcsSerializeUint64(num);
}

/**
 * Create SupraAccount from private key
 */
function createAccountFromPrivateKey(privateKey: string): SupraAccount {
    const cleanKey = privateKey.startsWith('0x')
        ? privateKey.slice(2)
        : privateKey;
    
    return new SupraAccount(
        Uint8Array.from(Buffer.from(cleanKey, 'hex'))
    );
}

/**
 * Get account sequence number
 */
async function getSequenceNumber(supraClient: SupraClient, account: SupraAccount): Promise<bigint> {
    try {
        const accountInfo = await supraClient.getAccountInfo(account.address());
        return accountInfo.sequence_number;
    } catch (e) {
        console.warn('Could not get account info, using sequence 0');
        return BigInt(0);
    }
}

// ============================================
// Transaction Result Interface
// ============================================

export interface TransactionResult {
    txHash: string;
    success: boolean;
    explorerUrl: string;
}

// ============================================
// Register Pool Function
// ============================================

export interface RegisterPoolParams {
    privateKey: string;
    stakeMetadataAddress: string;
    rewardMetadataAddress: string;
    startTime: number; // Unix timestamp in seconds
    rewardAmountBaseUnits: bigint; // Amount in base units (already converted)
    duration: number; // Duration in seconds
}

/**
 * Register a new staking pool
 */
export async function registerPool(params: RegisterPoolParams): Promise<TransactionResult> {
    try {
        // Initialize Supra Client
        const supraClient = await SupraClient.init(NETWORK_CONFIG.RPC_URL);

        // Create Account from Private Key
        const senderAccount = createAccountFromPrivateKey(params.privateKey);

        // Prepare Transaction Arguments
        const args = [
            serializeAddress(params.stakeMetadataAddress),
            serializeAddress(params.rewardMetadataAddress),
            serializeU64(params.startTime),
            serializeU64(params.rewardAmountBaseUnits),
            serializeU64(params.duration)
        ];

        // Get Account Sequence Number
        const sequenceNumber = await getSequenceNumber(supraClient, senderAccount);

        // Create Serialized Raw Transaction
        const serializedRawTransaction = await supraClient.createSerializedRawTxObject(
            senderAccount.address(),
            sequenceNumber,
            CONTRACT_ADDRESS.replace('0x', ''),
            MODULE_NAME,
            'register_pool',
            [],
            args
        );

        // Send Transaction
        const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
            senderAccount,
            serializedRawTransaction,
            {
                enableTransactionSimulation: true,
                enableWaitForTransaction: true,
            }
        );

        return {
            txHash: txResult.txHash,
            success: true,
            explorerUrl: `${NETWORK_CONFIG.EXPLORER_URL}/tx/${txResult.txHash}`,
        };

    } catch (error: any) {
        console.error('Register pool error:', error);
        throw new Error(error.message || 'Failed to register pool');
    }
}

// ============================================
// Stake Function
// ============================================

export interface StakeParams {
    privateKey: string;
    poolObj: string; // Pool object address
    stakeAmountBaseUnits: bigint; // Amount in base units (already converted)
}

/**
 * Stake tokens in a pool
 */
export async function stake(params: StakeParams): Promise<TransactionResult> {
    try {
        // Initialize Supra Client
        const supraClient = await SupraClient.init(NETWORK_CONFIG.RPC_URL);

        // Create Account from Private Key
        const senderAccount = createAccountFromPrivateKey(params.privateKey);

        // Prepare Transaction Arguments
        const args = [
            serializeAddress(params.poolObj),
            serializeU64(params.stakeAmountBaseUnits)
        ];

        // Get Account Sequence Number
        const sequenceNumber = await getSequenceNumber(supraClient, senderAccount);

        // Create Serialized Raw Transaction
        const serializedRawTransaction = await supraClient.createSerializedRawTxObject(
            senderAccount.address(),
            sequenceNumber,
            CONTRACT_ADDRESS.replace('0x', ''),
            MODULE_NAME,
            'stake',
            [],
            args
        );

        // Send Transaction
        const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
            senderAccount,
            serializedRawTransaction,
            {
                enableTransactionSimulation: true,
                enableWaitForTransaction: true,
            }
        );

        return {
            txHash: txResult.txHash,
            success: true,
            explorerUrl: `${NETWORK_CONFIG.EXPLORER_URL}/tx/${txResult.txHash}`,
        };

    } catch (error: any) {
        console.error('Stake error:', error);
        throw new Error(error.message || 'Failed to stake tokens');
    }
}

// ============================================
// Harvest Function
// ============================================

export interface HarvestParams {
    privateKey: string;
    poolObj: string; // Pool object address
}

/**
 * Harvest rewards from a pool
 */
export async function harvest(params: HarvestParams): Promise<TransactionResult> {
    try {
        // Initialize Supra Client
        const supraClient = await SupraClient.init(NETWORK_CONFIG.RPC_URL);

        // Create Account from Private Key
        const senderAccount = createAccountFromPrivateKey(params.privateKey);

        // Prepare Transaction Arguments
        const args = [
            serializeAddress(params.poolObj)
        ];

        // Get Account Sequence Number
        const sequenceNumber = await getSequenceNumber(supraClient, senderAccount);

        // Create Serialized Raw Transaction
        const serializedRawTransaction = await supraClient.createSerializedRawTxObject(
            senderAccount.address(),
            sequenceNumber,
            CONTRACT_ADDRESS.replace('0x', ''),
            MODULE_NAME,
            'harvest',
            [],
            args
        );

        // Send Transaction
        const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
            senderAccount,
            serializedRawTransaction,
            {
                enableTransactionSimulation: true,
                enableWaitForTransaction: true,
            }
        );

        return {
            txHash: txResult.txHash,
            success: true,
            explorerUrl: `${NETWORK_CONFIG.EXPLORER_URL}/tx/${txResult.txHash}`,
        };

    } catch (error: any) {
        console.error('Harvest error:', error);
        throw new Error(error.message || 'Failed to harvest rewards');
    }
}

// ============================================
// Unstake Function (Bonus)
// ============================================

export interface UnstakeParams {
    privateKey: string;
    poolObj: string; // Pool object address
    unstakeAmountBaseUnits: bigint; // Amount in base units (already converted)
}

/**
 * Unstake tokens from a pool
 */
export async function unstake(params: UnstakeParams): Promise<TransactionResult> {
    try {
        // Initialize Supra Client
        const supraClient = await SupraClient.init(NETWORK_CONFIG.RPC_URL);

        // Create Account from Private Key
        const senderAccount = createAccountFromPrivateKey(params.privateKey);

        // Prepare Transaction Arguments
        const args = [
            serializeAddress(params.poolObj),
            serializeU64(params.unstakeAmountBaseUnits)
        ];

        // Get Account Sequence Number
        const sequenceNumber = await getSequenceNumber(supraClient, senderAccount);

        // Create Serialized Raw Transaction
        const serializedRawTransaction = await supraClient.createSerializedRawTxObject(
            senderAccount.address(),
            sequenceNumber,
            CONTRACT_ADDRESS.replace('0x', ''),
            MODULE_NAME,
            'unstake',
            [],
            args
        );

        // Send Transaction
        const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
            senderAccount,
            serializedRawTransaction,
            {
                enableTransactionSimulation: true,
                enableWaitForTransaction: true,
            }
        );

        return {
            txHash: txResult.txHash,
            success: true,
            explorerUrl: `${NETWORK_CONFIG.EXPLORER_URL}/tx/${txResult.txHash}`,
        };

    } catch (error: any) {
        console.error('Unstake error:', error);
        throw new Error(error.message || 'Failed to unstake tokens');
    }
}
