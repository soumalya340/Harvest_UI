import { CONTRACT_ADDRESS, STAKE_MODULE_NAME, NETWORK_CONFIG } from '../../constant';

const VIEW_RPC_URL = `${NETWORK_CONFIG.RPC_URL}/rpc/v1/view`;

interface ViewFunctionPayload {
  function: string;
  type_arguments: string[];
  arguments: unknown[];
}

// Strongly-typed structure for get_pool_info return value
export interface PoolInfo {
  poolAddress: string;
  poolCreator: string;
  stakeMetadataAddress: string;
  rewardMetadataAddress: string;
  rewardPerSec: string;
  accumReward: string;
  lastUpdated: string;
  startTimestamp: string;
  endTimestamp: string;
  stakeAmount: string;
  rewardAmount: string;
  scale: string;
  totalBoosted: string;
  nftBoostConfig: unknown;
  emergencyLocked: boolean;
}

/**
 * Calls the Supra view endpoint for get_pool_address_by_index.
 * @param index - Pool index (e.g. "0", "1")
 * @returns Pool address string, or throws on error
 */
export async function callGetPoolAddressByIndex(index: string): Promise<string> {
  const payload: ViewFunctionPayload = {
    function: `${CONTRACT_ADDRESS}::${STAKE_MODULE_NAME}::get_pool_address_by_index`,
    type_arguments: [],
    arguments: [index],
  };

  const response = await fetch(VIEW_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `View call failed: ${response.status}`);
  }

  const result = data.result;
  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
    return result[0];
  }
  if (typeof result === 'string') {
    return result;
  }
  throw new Error('Unexpected view result format');
}

/**
 * Calls the Supra view endpoint for get_total_pools_count.
 * @returns Total pools count as string (e.g. "7"), or throws on error
 */
export async function callGetTotalPoolsCount(): Promise<string> {
  const payload: ViewFunctionPayload = {
    function: `${CONTRACT_ADDRESS}::${STAKE_MODULE_NAME}::get_total_pools_count`,
    type_arguments: [],
    arguments: [],
  };

  const response = await fetch(VIEW_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `View call failed: ${response.status}`);
  }

  const result = data.result;
  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
    return result[0];
  }
  if (typeof result === 'string') {
    return result;
  }
  throw new Error('Unexpected view result format');
}

/**
 * Calls the Supra view endpoint for get_pool_info.
 * @param poolObjectAddress - Pool object address (e.g. 0xca06e34a...)
 * @returns Parsed pool info object, or throws on error
 */
export async function callGetPoolInfo(poolObjectAddress: string): Promise<PoolInfo> {
  const payload: ViewFunctionPayload = {
    function: `${CONTRACT_ADDRESS}::${STAKE_MODULE_NAME}::get_pool_info`,
    type_arguments: [],
    arguments: [poolObjectAddress],
  };

  const response = await fetch(VIEW_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `View call failed: ${response.status}`);
  }

  const result = data.result;

  if (!Array.isArray(result) || result.length < 15) {
    throw new Error('Unexpected pool info format');
  }

  const [
    poolAddress,
    poolCreator,
    stakeMetadataAddress,
    rewardMetadataAddress,
    rewardPerSec,
    accumReward,
    lastUpdated,
    startTimestamp,
    endTimestamp,
    stakeAmount,
    rewardAmount,
    scale,
    totalBoosted,
    nftBoostConfig,
    emergencyLocked,
  ] = result;

  return {
    poolAddress: String(poolAddress),
    poolCreator: String(poolCreator),
    stakeMetadataAddress: String(stakeMetadataAddress),
    rewardMetadataAddress: String(rewardMetadataAddress),
    rewardPerSec: String(rewardPerSec),
    accumReward: String(accumReward),
    lastUpdated: String(lastUpdated),
    startTimestamp: String(startTimestamp),
    endTimestamp: String(endTimestamp),
    stakeAmount: String(stakeAmount),
    rewardAmount: String(rewardAmount),
    scale: String(scale),
    totalBoosted: String(totalBoosted),
    nftBoostConfig,
    emergencyLocked: Boolean(emergencyLocked),
  };
}
