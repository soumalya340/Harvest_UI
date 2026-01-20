'use client';

import { useState, useEffect } from 'react';
import { WalletButton } from './components/WalletButton';
import { PoolCard } from './components/PoolCard';
import { PoolRegistrationForm } from './components/PoolRegistrationForm';
import { BoostManager } from './components/BoostManager';
import { useAptosMultiWalletWithRefresh } from './providers/WalletProvider';

// Mock pool data - Replace with actual on-chain data fetching
const mockPools = [
  {
    objectAddress: '0x1234567890abcdef1234567890abcdef12345678',
    stakeToken: 'APT',
    rewardToken: 'APT',
    totalStaked: '1000000',
    totalRewards: '50000',
    startTime: Math.floor(Date.now() / 1000) - 86400, // Started yesterday
    endTime: Math.floor(Date.now() / 1000) + 2592000, // Ends in 30 days
    hasBoost: true,
  },
  {
    objectAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    stakeToken: 'USDC',
    rewardToken: 'APT',
    totalStaked: '500000',
    totalRewards: '25000',
    startTime: Math.floor(Date.now() / 1000) - 172800, // Started 2 days ago
    endTime: Math.floor(Date.now() / 1000) + 2592000, // Ends in 30 days
    hasBoost: false,
  },
];

export default function Home() {
  const wallet = useAptosMultiWalletWithRefresh();
  const account = wallet.account;
  const connected = wallet.connected;
  const [pools, setPools] = useState(mockPools);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [showBoostManager, setShowBoostManager] = useState(false);

  // TODO: Fetch actual pools from on-chain
  // useEffect(() => {
  //   if (connected) {
  //     fetchPools();
  //   }
  // }, [connected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🌾 Harvest Staking
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stake tokens and earn rewards on Aptos
              </p>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connected ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please connect your Aptos wallet to start staking and earning rewards.
              </p>
              <WalletButton />
            </div>
          </div>
        ) : (
          <>
            {/* Pool Registration Section */}
            <div className="mb-8">
              <PoolRegistrationForm />
            </div>

            {/* Pools Grid */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Staking Pools</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {pools.length} Active Pool{pools.length !== 1 ? 's' : ''}
                </div>
              </div>

              {pools.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Pools Available</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Register a new pool to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map((pool) => (
                    <div key={pool.objectAddress}>
                      <PoolCard
                        pool={pool}
                        stakeType="0x1::aptos_coin::AptosCoin"
                        rewardType="0x1::aptos_coin::AptosCoin"
                      />
                      {pool.hasBoost && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setSelectedPool(pool.objectAddress);
                              setShowBoostManager(!showBoostManager);
                            }}
                            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                          >
                            {showBoostManager && selectedPool === pool.objectAddress
                              ? 'Hide Boost Manager'
                              : 'Manage NFT Boost'}
                          </button>
                          {showBoostManager && selectedPool === pool.objectAddress && (
                            <div className="mt-2">
                              <BoostManager poolObj={pool.objectAddress} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">1️⃣</div>
                  <h4 className="font-semibold mb-2">Connect Wallet</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your Aptos wallet (Petra, Pontem, etc.)
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">2️⃣</div>
                  <h4 className="font-semibold mb-2">Stake Tokens</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a pool and stake your tokens to start earning
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">3️⃣</div>
                  <h4 className="font-semibold mb-2">Harvest Rewards</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Claim your rewards anytime or unstake when ready
                  </p>
                </div>
              </div>
            </div>

            {/* Connected Account Info */}
            {account && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Connected:</span>{' '}
                  <span className="font-mono text-xs">
                    {account}
                  </span>
                </p>
                {wallet.balance && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Balance:</span>{' '}
                    <span className="font-mono">{wallet.balance} APT</span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Harvest Staking Platform - Built on Aptos</p>
          <p className="mt-2">
            Contract: <span className="font-mono text-xs">{/* CONTRACT_ADDRESS */}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
