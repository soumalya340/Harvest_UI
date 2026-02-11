// ============================================
// SUPRA BLOCKCHAIN - HARVEST STAKING (FIXED v4)
// With Proper Decimal Handling!
// ============================================

import {
    SupraAccount,
    SupraClient,
    BCS,
    TxnBuilderTypes,
} from 'supra-l1-sdk';
import dotenv from 'dotenv';

dotenv.config();



const CONFIG = {
    CONTRACT_ADDRESS: '0x7896b0fb2126899f0b24cd9369fb70fc4f4ff183b1e50c5e9277c83746eb7d2e',
    MODULE_NAME: 'script1',
    FUNCTION_NAME: 'register_pool',
    // Network settings
    RPC_URL: 'https://rpc-testnet.supra.com/',
    // Your private key (from .env file)
    PRIVATE_KEY: process.env.PRIVATE_KEY,
};

// ============================================
// HELPER: Convert human-readable amount to base units
// ============================================

/**
 * Converts a human-readable token amount to base units
 * Example: toBaseUnits(100, 8) = 10000000000 (100 tokens with 8 decimals)
 * 
 * @param {number|string} amount - Human readable amount (e.g., 100 for 100 tokens)
 * @param {number} decimals - Number of decimals the token has (usually 8)
 * @returns {BigInt} - Amount in base units
 */
function toBaseUnits(amount, decimals = 8) {
    const multiplier = BigInt(10 ** decimals);
    const amountBigInt = BigInt(Math.floor(Number(amount)));
    return amountBigInt * multiplier;
}

/**
 * Formats base units back to human readable for display
 */
function fromBaseUnits(baseUnits, decimals = 8) {
    const divisor = 10 ** decimals;
    return Number(baseUnits) / divisor;
}

// ============================================
// SERIALIZATION HELPERS
// ============================================

function serializeAddress(addressString) {
    const cleanAddress = addressString.startsWith('0x')
        ? addressString
        : '0x' + addressString;
    return BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(cleanAddress));
}

function serializeU64(value) {
    let num;
    if (typeof value === 'string') {
        num = BigInt(value);
    } else if (typeof value === 'number') {
        num = BigInt(value);
    } else {
        num = value;
    }
    return BCS.bcsSerializeUint64(num);
}

// ============================================
// MAIN FUNCTION: REGISTER POOL
// ============================================

async function registerPool(params) {
    try {
        console.log('\n🚀 Starting Pool Registration...\n');

        // Step 1: Initialize Supra Client
        console.log('⏳ Initializing Supra Client...');
        const supraClient = await SupraClient.init(CONFIG.RPC_URL);
        console.log('✅ Supra Client initialized');

        // Step 2: Create Account from Private Key
        console.log('⏳ Loading account...');
        const cleanKey = CONFIG.PRIVATE_KEY.startsWith('0x')
            ? CONFIG.PRIVATE_KEY.slice(2)
            : CONFIG.PRIVATE_KEY;

        const senderAccount = new SupraAccount(
            Uint8Array.from(Buffer.from(cleanKey, 'hex'))
        );

        console.log('✅ Account loaded!');
        console.log('📍 Sender Address:', senderAccount.address().toString());

        // Step 3: Check account exists (required before sending; avoid SENDING_ACCOUNT_DOES_NOT_EXIST)
        const accountExists = await supraClient.isAccountExists(senderAccount.address());
        console.log('📊 Account exists:', accountExists);

        if (!accountExists) {
            throw new Error(
                'SENDING_ACCOUNT_DOES_NOT_EXIST: This address has never received funds on Supra Testnet. ' +
                'Fund it first via the faucet: https://faucet.supra.com (select Testnet), ' +
                'then run this script again.'
            );
        }

        try {
            const balance = await supraClient.getAccountSupraCoinBalance(senderAccount.address());
            console.log('💰 Account Balance:', fromBaseUnits(balance, 8).toLocaleString(), 'SUPRA');
        } catch (e) {
            console.log('⚠️  Could not fetch balance');
        }

        // Step 4: Prepare Transaction Arguments
        console.log('\n📦 Preparing transaction arguments...');
        console.log('   └─ Reward Amount (base units):', params.rewardAmountBaseUnits.toString());

        const args = [
            serializeAddress(params.stakeMetadataAddress),
            serializeAddress(params.rewardMetadataAddress),
            serializeU64(params.startTime),
            serializeU64(params.rewardAmountBaseUnits),  // Already in base units!
            serializeU64(params.duration)
        ];

        console.log('✅ Arguments serialized');

        // Step 5: Get Account Sequence Number
        let sequenceNumber = BigInt(0);
        try {
            const accountInfo = await supraClient.getAccountInfo(senderAccount.address());
            sequenceNumber = accountInfo.sequence_number;
            console.log('📊 Current sequence number:', sequenceNumber.toString());
        } catch (e) {
            console.log('⚠️  Could not get account info, using sequence 0');
        }

        // Step 6: Create Serialized Raw Transaction
        console.log('\n📋 Creating transaction...');

        const serializedRawTransaction = await supraClient.createSerializedRawTxObject(
            senderAccount.address(),
            sequenceNumber,
            CONFIG.CONTRACT_ADDRESS.replace('0x', ''),
            CONFIG.MODULE_NAME,
            CONFIG.FUNCTION_NAME,
            [],
            args
        );

        console.log('✅ Transaction created');

        // Step 7: Send Transaction
        console.log('\n📤 Submitting transaction...');

        const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
            senderAccount,
            serializedRawTransaction,
            {
                enableTransactionSimulation: true,
                enableWaitForTransaction: true,
            }
        );

        console.log('\n✅ Transaction submitted successfully!');
        console.log('📋 Transaction Hash:', txResult.txHash);
        console.log('🔍 View on explorer:', `https://testnet.suprascan.io/tx/${txResult.txHash}`);

        return txResult;

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        const errMsg = (error.response?.data?.message ?? '') || error.message || '';

        // Provide specific hints based on error
        if (errMsg.includes('SENDING_ACCOUNT_DOES_NOT_EXIST')) {
            console.log('\n💡 Hint: This address does not exist on the chain yet.');
            console.log('   • Fund it via the Testnet faucet: https://faucet.supra.com (choose Testnet)');
            console.log('   • Ensure you are using Testnet RPC (chain ID 6), not Mainnet (8).');
        }
        if (error.response?.data?.message) {
            console.error('📛 Contract Error:', error.response.data.message);
            if (error.response.data.message.includes('REWARD_CANNOT_BE_ZERO')) {
                console.log('\n💡 Hint: The reward amount is too small!');
                console.log('   Make sure you account for token decimals.');
                console.log('   Example: For 100 tokens with 8 decimals, use 10000000000');
            }
            if (error.response.data.message.includes('INSUFFICIENT_BALANCE')) {
                console.log('\n💡 Hint: Not enough tokens in your wallet!');
            }
            if (error.response.data.message.includes('NOT_OWNER')) {
                console.log('\n💡 Hint: You are not authorized to perform this action!');
            }
        }

        throw error;
    }
}

// ============================================
// EXAMPLE USAGE
// ============================================

async function main() {
    try {
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   SUPRA HARVEST STAKING - REGISTER POOL    ║');
        console.log('║       With Proper Decimal Handling         ║');
        console.log('╚════════════════════════════════════════════╝\n');

        // Validate private key
        if (!CONFIG.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY not found in .env file!');
        }

        // ============================================
        // IMPORTANT: Token Decimal Configuration
        // ============================================
        const REWARD_TOKEN_DECIMALS = 8;  // Most tokens have 8 decimals

        // Human-readable reward amount (how many tokens you want to give)
        const rewardTokens = 100;  // 100 tokens as reward

        // Convert to base units (this is what the contract expects!)
        const rewardAmountBaseUnits = toBaseUnits(rewardTokens, REWARD_TOKEN_DECIMALS);

        const poolParams = {
            stakeMetadataAddress: '0x8b560a2498dbd80db9dbed09424cd3be73d3e4ef2f07525af95afb4ca956c73c',
            rewardMetadataAddress: '0xbfb731e2a66b9b2028d6c06166d413b924658497adbcd907e2e709ede456aa73',
            startTime: Math.floor(Date.now() / 1000) + 3600,  // 1 hour from now
            rewardAmountBaseUnits: rewardAmountBaseUnits,     // IN BASE UNITS!
            duration: 7 * 24 * 60 * 60  // 7 days in seconds
        };

        console.log('📝 Pool Parameters:');
        console.log('├─ Stake Token:', poolParams.stakeMetadataAddress);
        console.log('├─ Reward Token:', poolParams.rewardMetadataAddress);
        console.log('├─ Start Time:', new Date(poolParams.startTime * 1000).toLocaleString());
        console.log('├─ Reward Amount:');
        console.log('│  ├─ Human Readable:', rewardTokens.toLocaleString(), 'tokens');
        console.log('│  └─ Base Units:', rewardAmountBaseUnits.toString());
        console.log('└─ Duration:', poolParams.duration, 'seconds (7 days)\n');

        const txResult = await registerPool(poolParams);

        console.log('\n✨ Pool registration complete!');

    } catch (error) {
        console.error('\n💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// ============================================
// RUN THE SCRIPT
// ============================================

main().then(() => {
    console.log('\n✅ Script completed successfully');
}).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});