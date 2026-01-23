'use client';

import { useState } from 'react';
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

interface PoolCardProps {
  pool: {
    objectAddress: string;
    stakeToken: string;
    rewardToken: string;
    totalStaked: string;
    totalRewards: string;
    startTime: number;
    endTime: number;
    hasBoost: boolean;
  };
  stakeType: string;
  rewardType: string;
}

export function PoolCard({ pool, stakeType, rewardType }: PoolCardProps) {
  const wallet = useAptosMultiWalletWithRefresh();
  const account = wallet.account;
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStake = async () => {
    if (!account || !stakeAmount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.stake(
        pool.objectAddress,
        stakeAmount
      );
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Staked successfully! Hash: ${txHash}`);
      setStakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to stake');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!account || !unstakeAmount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.unstake(
        pool.objectAddress,
        unstakeAmount
      );
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Unstaked successfully! Hash: ${txHash}`);
      setUnstakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to unstake');
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async () => {
    if (!account) {
      setError('Please connect wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.harvest(
        pool.objectAddress
      );
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Harvested successfully! Hash: ${txHash}`);
    } catch (err: any) {
      setError(err.message || 'Failed to harvest');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyUnstake = async () => {
    if (!account) {
      setError('Please connect wallet');
      return;
    }

    if (!confirm('Are you sure you want to emergency unstake? This may forfeit rewards.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.emergencyUnstake(
        pool.objectAddress
      );
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Emergency unstaked successfully! Hash: ${txHash}`);
    } catch (err: any) {
      setError(err.message || 'Failed to emergency unstake');
    } finally {
      setLoading(false);
    }
  };

  const isActive = Date.now() / 1000 >= pool.startTime && Date.now() / 1000 <= pool.endTime;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Staking Pool</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pool.objectAddress.slice(0, 8)}...{pool.objectAddress.slice(-8)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stake Token</p>
          <p className="font-medium">{pool.stakeToken}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Reward Token</p>
          <p className="font-medium">{pool.rewardToken}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Staked</p>
          <p className="font-medium">{pool.totalStaked}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</p>
          <p className="font-medium">{pool.totalRewards}</p>
        </div>
      </div>

      {pool.hasBoost && (
        <div className="mb-4 px-3 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
            ⚡ NFT Boost Available
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Stake Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              disabled={loading || !isActive}
            />
            <button
              onClick={handleStake}
              disabled={loading || !isActive || !stakeAmount}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Staking...' : 'Stake'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unstake Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              disabled={loading || !isActive}
            />
            <button
              onClick={handleUnstake}
              disabled={loading || !isActive || !unstakeAmount}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Unstaking...' : 'Unstake'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleHarvest}
            disabled={loading || !isActive}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Harvesting...' : 'Harvest Rewards'}
          </button>
          <button
            onClick={handleEmergencyUnstake}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Emergency Unstake
          </button>
        </div>
      </div>
    </div>
  );
}
