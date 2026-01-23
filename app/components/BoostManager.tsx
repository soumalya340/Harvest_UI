'use client';

import { useState } from 'react';
import { useAptosMultiWalletWithRefresh } from '../providers/WalletProvider';
import { contractFunctions } from '../utils/contract';

interface BoostManagerProps {
  poolObj: string;
}

export function BoostManager({ poolObj }: BoostManagerProps) {
  const wallet = useAptosMultiWalletWithRefresh();
  const account = wallet.account;
  const [boostType, setBoostType] = useState<'v1' | 'v2' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // V1 boost fields
  const [collectionOwner, setCollectionOwner] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [propertyVersion, setPropertyVersion] = useState('0');

  // V2 boost fields
  const [nftObj, setNftObj] = useState('');

  const handleBoostV1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.boostV1(
        poolObj,
        collectionOwner,
        collectionName,
        tokenName,
        propertyVersion
      );
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Boost v1 applied! Hash: ${txHash}`);
      setBoostType(null);
    } catch (err: any) {
      setError(err.message || 'Failed to apply boost v1');
    } finally {
      setLoading(false);
    }
  };

  const handleBoostV2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.boostV2(poolObj, nftObj);
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Boost v2 applied! Hash: ${txHash}`);
      setBoostType(null);
    } catch (err: any) {
      setError(err.message || 'Failed to apply boost v2');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBoost = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txParams = contractFunctions.removeBoost(poolObj);
      
      const txHash = await wallet.sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true
      );
      
      setSuccess(`Boost removed! Hash: ${txHash}`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove boost');
    } finally {
      setLoading(false);
    }
  };

  if (boostType === null) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setBoostType('v1')}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Apply NFT Boost V1
        </button>
        <button
          onClick={() => setBoostType('v2')}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Apply NFT Boost V2
        </button>
        <button
          onClick={handleRemoveBoost}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Removing...' : 'Remove Boost'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Apply NFT Boost {boostType.toUpperCase()}</h3>
        <button
          onClick={() => setBoostType(null)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
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

      {boostType === 'v1' ? (
        <form onSubmit={handleBoostV1} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Collection Owner</label>
            <input
              type="text"
              value={collectionOwner}
              onChange={(e) => setCollectionOwner(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Collection Name</label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Token Name</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Property Version</label>
            <input
              type="number"
              value={propertyVersion}
              onChange={(e) => setPropertyVersion(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              placeholder="0"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply Boost'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleBoostV2} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">NFT Object Address</label>
            <input
              type="text"
              value={nftObj}
              onChange={(e) => setNftObj(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              placeholder="0x..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply Boost'}
          </button>
        </form>
      )}
    </div>
  );
}
