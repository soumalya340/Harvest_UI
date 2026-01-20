import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AccountAddress, MoveStructId } from '@aptos-labs/ts-sdk';

// Configure Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

// Contract address - update this with your deployed contract address
export const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'; // Update this

// Module name
const MODULE_NAME = 'harvest::script1';

// Helper function to build transaction
export async function buildTransaction(
  functionName: string,
  typeArguments: string[] = [],
  functionArguments: any[] = [],
  sender?: string
) {
  const transaction = await aptos.transaction.build.simple({
    sender: sender || '', // Will be set by wallet if not provided
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::${functionName}`,
      typeArguments,
      functionArguments,
    },
  });
  return transaction;
}

// Contract interaction functions
export const contractFunctions = {
  // Register pool without boost
  async registerPoolCoin(
    poolOwner: string,
    stakeMetadataAddress: string,
    rewardMetadataAddress: string,
    rewardAmount: string,
    startTime: string,
    duration: string,
    stakeType: string,
    rewardType: string
  ) {
    return buildTransaction('register_pool_coin', [stakeType, rewardType], [
      poolOwner,
      stakeMetadataAddress,
      rewardMetadataAddress,
      rewardAmount,
      startTime,
      duration,
    ], poolOwner);
  },

  // Register pool with boost
  async registerPoolWithBoostCoin(
    poolOwner: string,
    stakeMetadataAddress: string,
    rewardMetadataAddress: string,
    rewardAmount: string,
    startTime: string,
    duration: string,
    version: string,
    collectionIdentifier: string,
    collectionName: string,
    boostPercent: string,
    stakeType: string,
    rewardType: string
  ) {
    return buildTransaction('register_pool_with_boost_coin', [stakeType, rewardType], [
      poolOwner,
      stakeMetadataAddress,
      rewardMetadataAddress,
      rewardAmount,
      startTime,
      duration,
      version,
      collectionIdentifier,
      collectionName,
      boostPercent,
    ], poolOwner);
  },

  // Stake tokens
  async stakeCoin(
    poolObj: string,
    stakeAmount: string,
    stakeType: string,
    sender?: string
  ) {
    return buildTransaction('stake_coin', [stakeType], [
      poolObj,
      stakeAmount,
    ], sender);
  },

  // Unstake tokens
  async unstakeCoin(
    poolObj: string,
    stakeAmount: string,
    stakeType: string,
    sender?: string
  ) {
    return buildTransaction('unstake_coin', [stakeType], [
      poolObj,
      stakeAmount,
    ], sender);
  },

  // Harvest rewards
  async harvestCoin(
    poolObj: string,
    rewardType: string,
    sender?: string
  ) {
    return buildTransaction('harvest_coin', [rewardType], [
      poolObj,
    ], sender);
  },

  // Deposit reward coins
  async depositRewardCoinsCoin(
    poolObj: string,
    rewardMetadataAddress: string,
    rewardAmount: string,
    rewardType: string,
    sender?: string
  ) {
    return buildTransaction('deposit_reward_coins_coin', [rewardType], [
      poolObj,
      rewardMetadataAddress,
      rewardAmount,
    ], sender);
  },

  // Add rewards and time
  async addRewardsAndTimeCoin(
    poolObj: string,
    rewardMetadataAddress: string,
    rewardsAddOn: string,
    timeAddOn: string,
    rewardType: string,
    sender?: string
  ) {
    return buildTransaction('add_rewards_and_time_coin', [rewardType], [
      poolObj,
      rewardMetadataAddress,
      rewardsAddOn,
      timeAddOn,
    ], sender);
  },

  // Emergency unstake
  async emergencyUnstakeCoin(
    poolObj: string,
    stakeType: string,
    sender?: string
  ) {
    return buildTransaction('emergency_unstake_coin', [stakeType], [
      poolObj,
    ], sender);
  },

  // Boost v1
  async boostV1(
    poolObj: string,
    collectionOwner: string,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    sender?: string
  ) {
    return buildTransaction('boost_v1', [], [
      poolObj,
      collectionOwner,
      collectionName,
      tokenName,
      propertyVersion,
    ], sender);
  },

  // Boost v2
  async boostV2(
    poolObj: string,
    nftObj: string,
    sender?: string
  ) {
    return buildTransaction('boost_v2', [], [
      poolObj,
      nftObj,
    ], sender);
  },

  // Remove boost
  async removeBoost(poolObj: string, sender?: string) {
    return buildTransaction('remove_boost', [], [poolObj], sender);
  },

  // Toggle whitelisted user (admin)
  async toggleWhitelistedUser(user: string, sender?: string) {
    return buildTransaction('toggle_whitelisted_user', [], [user], sender);
  },
};
