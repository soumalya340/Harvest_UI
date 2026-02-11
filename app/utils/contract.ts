import { CONTRACT_ADDRESS, MODULE_NAME, DOG_TOKEN_MODULE_NAME, MOCK_USDC_MODULE_NAME } from '../../constant';

// Helper to prepare transaction parameters
export interface TransactionParams {
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs: string[];
  args: Uint8Array[];
}

// Raw args interface (before serialization)
export interface RawTransactionParams {
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs: string[];
  rawArgs: any[];
}

// Contract interaction functions - returns raw args for serialization
export const contractFunctions = {
  // Register pool without boost (FA-based version)
  registerPool(
    stakeMetadataAddress: string,
    rewardMetadataAddress: string,
    startTime: string,
    rewardAmount: string,
    duration: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'register_pool',
      typeArgs: [],
      rawArgs: [
        stakeMetadataAddress,   // Object<Metadata>
        rewardMetadataAddress,  // Object<Metadata>
        startTime,              // u64
        rewardAmount,           // u64
        duration,               // u64
      ],
    };
  },

  // Register pool with boost (FA-based version)
  registerPoolWithBoost(
    stakeMetadataAddress: string,
    rewardMetadataAddress: string,
    rewardAmount: string,
    startTime: string,
    duration: string,
    version: string,
    collectionIdentifier: string,
    collectionName: string,
    boostPercent: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'register_pool_with_boost',
      typeArgs: [],
      rawArgs: [
        stakeMetadataAddress,   // Object<Metadata>
        rewardMetadataAddress,  // Object<Metadata>
        rewardAmount,           // u64
        startTime,              // u64
        duration,               // u64
        version,                // u64
        collectionIdentifier,   // address
        collectionName,         // String
        boostPercent,           // u128
      ],
    };
  },

  // Stake tokens (FA-based version)
  stake(
    poolObj: string,
    stakeAmount: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'stake',
      typeArgs: [],
      rawArgs: [
        poolObj,      // Object<StakePool>
        stakeAmount,  // u64
      ],
    };
  },

  // Unstake tokens (FA-based version)
  unstake(
    poolObj: string,
    stakeAmount: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'unstake',
      typeArgs: [],
      rawArgs: [
        poolObj,      // Object<StakePool>
        stakeAmount,  // u64
      ],
    };
  },

  // Harvest rewards (FA-based version)
  harvest(
    poolObj: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'harvest',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
      ],
    };
  },

  // Deposit reward coins (FA-based version)
  depositRewardCoins(
    poolObj: string,
    rewardAmount: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'deposit_reward_coins',
      typeArgs: [],
      rawArgs: [
        poolObj,      // Object<StakePool>
        rewardAmount, // u64
      ],
    };
  },

  // Add rewards and time (FA-based version)
  addRewardsAndTime(
    poolObj: string,
    rewardsAddOn: string,
    timeAddOn: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'add_rewards_and_time',
      typeArgs: [],
      rawArgs: [
        poolObj,      // Object<StakePool>
        rewardsAddOn, // u64
        timeAddOn,    // u64
      ],
    };
  },

  // Emergency unstake (FA-based version)
  emergencyUnstake(
    poolObj: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'emergency_unstake',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
      ],
    };
  },

  // Boost v1
  boostV1(
    poolObj: string,
    collectionOwner: string,
    collectionName: string,
    tokenName: string,
    propertyVersion: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'boost_v1',
      typeArgs: [],
      rawArgs: [
        poolObj,           // Object<StakePool>
        collectionOwner,   // address
        collectionName,    // String
        tokenName,         // String
        propertyVersion,   // u64
      ],
    };
  },

  // Boost v2
  boostV2(
    poolObj: string,
    nftObj: string
  ): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'boost_v2',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
        nftObj,   // Object<DigitalAssetToken>
      ],
    };
  },

  // Remove boost
  removeBoost(poolObj: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'remove_boost',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
      ],
    };
  },

  // Toggle whitelisted user (admin)
  toggleWhitelistedUser(user: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'toggle_whitelisted_user',
      typeArgs: [],
      rawArgs: [
        user,  // address
      ],
    };
  },

  // Enable emergency (admin)
  enableEmergency(poolObj: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'enable_emergency',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
      ],
    };
  },

  // Withdraw reward to treasury (admin)
  withdrawRewardToTreasury(poolObj: string, amount: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: 'withdraw_reward_to_treasury',
      typeArgs: [],
      rawArgs: [
        poolObj,  // Object<StakePool>
        amount,   // u64
      ],
    };
  },

  // Faucet: Dog Token mint (dog_token_fa::mint)
  mintDogToken(recipient: string, amount: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: DOG_TOKEN_MODULE_NAME,
      functionName: 'mint',
      typeArgs: [],
      rawArgs: [recipient, amount], // address, u64
    };
  },

  // Faucet: Mock USDC mint (mock_usdc_fa::mint)
  mintMockUsdc(recipient: string, amount: string): RawTransactionParams {
    return {
      moduleAddress: CONTRACT_ADDRESS,
      moduleName: MOCK_USDC_MODULE_NAME,
      functionName: 'mint',
      typeArgs: [],
      rawArgs: [recipient, amount], // address, u64
    };
  },
};
