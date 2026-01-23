'use client';

import { useState } from 'react';
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

export function PoolRegistrationForm() {
  const wallet = useAptosMultiWalletWithRefresh();
  const account = wallet.account;
  const [showForm, setShowForm] = useState(false);
  const [withBoost, setWithBoost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [stakeMetadataAddress, setStakeMetadataAddress] = useState('');
  const [rewardMetadataAddress, setRewardMetadataAddress] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [stakeType, setStakeType] = useState('');
  const [rewardType, setRewardType] = useState('');

  // Boost fields
  const [version, setVersion] = useState('1');
  const [collectionIdentifier, setCollectionIdentifier] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [boostPercent, setBoostPercent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const poolOwner = account;
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000).toString();
      const durationSeconds = (parseInt(duration) * 24 * 60 * 60).toString(); // Convert days to seconds

      let txParams;
      if (withBoost) {
        txParams = contractFunctions.registerPoolWithBoost(
          stakeMetadataAddress,
          rewardMetadataAddress,
          rewardAmount,
          startTimeUnix,
          durationSeconds,
          version,
          collectionIdentifier,
          collectionName,
          boostPercent
        );
      } else {
        txParams = contractFunctions.registerPool(
          stakeMetadataAddress,
          rewardMetadataAddress,
          startTimeUnix,
          rewardAmount,
          durationSeconds
        );
      }

      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Pool registered successfully! Hash: ${txHash}`);
      
      // Reset form
      setStakeMetadataAddress('');
      setRewardMetadataAddress('');
      setRewardAmount('');
      setStartTime('');
      setDuration('');
      setStakeType('');
      setRewardType('');
      setVersion('1');
      setCollectionIdentifier('');
      setCollectionName('');
      setBoostPercent('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register pool');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
      >
        Register New Pool
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Register Staking Pool</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Stake Metadata Address</label>
          <input
            type="text"
            value={stakeMetadataAddress}
            onChange={(e) => setStakeMetadataAddress(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reward Metadata Address</label>
          <input
            type="text"
            value={rewardMetadataAddress}
            onChange={(e) => setRewardMetadataAddress(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder="0x..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stake Type</label>
            <input
              type="text"
              value={stakeType}
              onChange={(e) => setStakeType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="0x1::aptos_coin::AptosCoin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reward Type</label>
            <input
              type="text"
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="0x1::aptos_coin::AptosCoin"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reward Amount</label>
          <input
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder="1000000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="withBoost"
            checked={withBoost}
            onChange={(e) => setWithBoost(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="withBoost" className="text-sm font-medium">
            Enable NFT Boost
          </label>
        </div>

        {withBoost && (
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">Version</label>
              <input
                type="number"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required={withBoost}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Collection Identifier</label>
              <input
                type="text"
                value={collectionIdentifier}
                onChange={(e) => setCollectionIdentifier(e.target.value)}
                required={withBoost}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Collection Name</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required={withBoost}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="My Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Boost Percent</label>
              <input
                type="number"
                value={boostPercent}
                onChange={(e) => setBoostPercent(e.target.value)}
                required={withBoost}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="1000000 (e.g., 10% = 1000000)"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Registering...' : 'Register Pool'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
