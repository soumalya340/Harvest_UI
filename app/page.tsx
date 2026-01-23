'use client';

import React, { useState, useEffect } from 'react';
import { WalletButton } from './components/WalletButton';
import useStarkeyWallet from './hooks/useStarkeyWallet';
import { contractFunctions } from './utils/contract';

export default function Home() {
  const walletData = useStarkeyWallet();
  const { connected, sendRawTransaction, account, accounts, updateAccounts } = walletData;

  // Debug connection status - log everything from the wallet hook
  useEffect(() => {
    console.log('=== WALLET STATE DEBUG ===');
    console.log('Full wallet data:', walletData);
    console.log('Connected:', connected);
    console.log('Account:', account);
    console.log('Accounts:', accounts);
    console.log('Accounts Length:', accounts?.length || 0);
    console.log('=========================');
  }, [connected, account, accounts, walletData]);

  // Register Pool form state
  const [stakeMetadataAddress, setStakeMetadataAddress] = useState('');
  const [rewardMetadataAddress, setRewardMetadataAddress] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [withBoost, setWithBoost] = useState(false);

  // Boost config state (optional)
  const [version, setVersion] = useState('');
  const [collectionIdentifier, setCollectionIdentifier] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [boostPercent, setBoostPercent] = useState('');

  const [registering, setRegistering] = useState(false);

  // Stake form state
  const [stakePoolAddress, setStakePoolAddress] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [staking, setStaking] = useState(false);

  // Harvest form state
  const [harvestPoolAddress, setHarvestPoolAddress] = useState('');
  const [harvesting, setHarvesting] = useState(false);

  // Helper to send transaction with raw args
  const sendTransaction = async (txParams: any) => {
    console.log('sendTransaction called with params:', {
      moduleAddress: txParams.moduleAddress,
      moduleName: txParams.moduleName,
      functionName: txParams.functionName,
      rawArgs: txParams.rawArgs,
      typeArgs: txParams.typeArgs
    });

    try {
      const result = await sendRawTransaction(
        txParams.moduleAddress,
        txParams.moduleName,
        txParams.functionName,
        txParams.rawArgs,
        txParams.typeArgs,
        true // Indicate these are raw args that need serialization
      );
      console.log('sendRawTransaction result:', result);
      return result;
    } catch (error) {
      console.error('sendRawTransaction error:', error);
      throw error;
    }
  };

  const handleRegisterPool = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== REGISTER POOL CLICKED ===');
    console.log('Full wallet state:', {
      connected,
      account,
      accounts,
      accountsLength: accounts?.length,
      registering,
      hasWalletData: !!walletData,
      allWalletKeys: Object.keys(walletData)
    });

    // Check if we have an account (wallet is connected)
    if (!account && (!accounts || accounts.length === 0)) {
      const errorMsg = `Wallet connection error:
      - Connected flag: ${connected}
      - Account: ${account || 'undefined'}
      - Accounts array: ${accounts ? `[${accounts.length} items]` : 'undefined'}
      
      Please try:
      1. Disconnect wallet (if shown as connected)
      2. Reconnect wallet using the button in top right
      3. Try again`;

      alert('Please connect your wallet first. Click the wallet button in the top right corner.');
      console.error(errorMsg);
      return;
    }

    console.log('✅ Wallet check passed, proceeding with transaction...');

    if (!stakeMetadataAddress || !rewardMetadataAddress || !rewardAmount || !startTime || !duration) {
      alert('Please fill all required fields');
      return;
    }

    if (withBoost && (!version || !collectionIdentifier || !collectionName || !boostPercent)) {
      alert('Please fill all boost configuration fields');
      return;
    }

    console.log('Starting pool registration...');
    setRegistering(true);

    try {
      // Use the FA-based register_pool functions
      const txParams = withBoost
        ? contractFunctions.registerPoolWithBoost(
          stakeMetadataAddress,
          rewardMetadataAddress,
          rewardAmount,
          startTime,
          duration,
          version,
          collectionIdentifier,
          collectionName,
          boostPercent
        )
        : contractFunctions.registerPool(
          stakeMetadataAddress,
          rewardMetadataAddress,
          startTime,
          rewardAmount,
          duration
        );

      console.log('Transaction params:', txParams);

      const txHash = await sendTransaction(txParams);
      console.log('Transaction hash:', txHash);

      alert('Pool registered successfully! TX: ' + txHash);

      // Reset form
      setStakeMetadataAddress('');
      setRewardMetadataAddress('');
      setRewardAmount('');
      setStartTime('');
      setDuration('');
      setVersion('');
      setCollectionIdentifier('');
      setCollectionName('');
      setBoostPercent('');
    } catch (error: any) {
      console.error('Pool registration failed:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        error: error
      });
      alert('Pool registration failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setRegistering(false);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Stake button clicked');
    console.log('Connected:', connected);
    console.log('Account:', account);

    // Check if we have an account (wallet is connected)
    if (!account && (!accounts || accounts.length === 0)) {
      alert('Please connect your wallet first. Click the wallet button in the top right corner.');
      console.error('No account found. Please connect wallet.');
      return;
    }

    console.log('✅ Wallet check passed, proceeding with stake...');

    if (!stakePoolAddress || !stakeAmount) {
      alert('Please fill all fields');
      return;
    }

    setStaking(true);
    try {
      const txParams = contractFunctions.stake(stakePoolAddress, stakeAmount);

      await sendTransaction(txParams);
      alert('Stake successful!');

      // Reset form
      setStakePoolAddress('');
      setStakeAmount('');
    } catch (error) {
      console.error('Stake failed:', error);
      alert('Stake failed: ' + (error as Error).message);
    } finally {
      setStaking(false);
    }
  };

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Harvest button clicked');
    console.log('Connected:', connected);
    console.log('Account:', account);

    // Check if we have an account (wallet is connected)
    if (!account && (!accounts || accounts.length === 0)) {
      alert('Please connect your wallet first. Click the wallet button in the top right corner.');
      console.error('No account found. Please connect wallet.');
      return;
    }

    console.log('✅ Wallet check passed, proceeding with harvest...');

    if (!harvestPoolAddress) {
      alert('Please enter pool address');
      return;
    }

    setHarvesting(true);
    try {
      const txParams = contractFunctions.harvest(harvestPoolAddress);

      await sendTransaction(txParams);
      alert('Harvest successful!');

      // Reset form
      setHarvestPoolAddress('');
    } catch (error) {
      console.error('Harvest failed:', error);
      alert('Harvest failed: ' + (error as Error).message);
    } finally {
      setHarvesting(false);
    }
  };

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
              {/* Connection Status Indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {connected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Not Connected'}
                </span>
                {updateAccounts && (
                  <button
                    onClick={() => {
                      console.log('Refreshing wallet accounts...');
                      updateAccounts();
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Register Pool Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Register Pool</h2>
            <form onSubmit={handleRegisterPool} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stakeMetadataAddress" className="block text-sm font-medium mb-2">
                    Stake Metadata (Object)
                  </label>
                  <input
                    type="text"
                    id="stakeMetadataAddress"
                    value={stakeMetadataAddress}
                    onChange={(e) => setStakeMetadataAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rewardMetadataAddress" className="block text-sm font-medium mb-2">
                    Reward Metadata (Object)
                  </label>
                  <input
                    type="text"
                    id="rewardMetadataAddress"
                    value={rewardMetadataAddress}
                    onChange={(e) => setRewardMetadataAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rewardAmount" className="block text-sm font-medium mb-2">
                  Reward Amount
                </label>
                <input
                  type="number"
                  id="rewardAmount"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                    Start Time (Unix timestamp)
                  </label>
                  <input
                    type="number"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="1234567890"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2592000"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Boost Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="withBoost"
                  checked={withBoost}
                  onChange={(e) => setWithBoost(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="withBoost" className="text-sm font-medium">
                  Enable NFT Boost
                </label>
              </div>

              {/* Boost Configuration (conditional) */}
              {withBoost && (
                <div className="space-y-4 p-4 border border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Boost Configuration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="version" className="block text-sm font-medium mb-2">
                        Version
                      </label>
                      <input
                        type="number"
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        required={withBoost}
                      />
                    </div>

                    <div>
                      <label htmlFor="boostPercent" className="block text-sm font-medium mb-2">
                        Boost Percent
                      </label>
                      <input
                        type="number"
                        id="boostPercent"
                        value={boostPercent}
                        onChange={(e) => setBoostPercent(e.target.value)}
                        placeholder="10"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        required={withBoost}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="collectionIdentifier" className="block text-sm font-medium mb-2">
                      Collection Identifier
                    </label>
                    <input
                      type="text"
                      id="collectionIdentifier"
                      value={collectionIdentifier}
                      onChange={(e) => setCollectionIdentifier(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required={withBoost}
                    />
                  </div>

                  <div>
                    <label htmlFor="collectionName" className="block text-sm font-medium mb-2">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      id="collectionName"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      placeholder="My Collection"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required={withBoost}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
              >
                {registering ? 'Registering Pool...' : 'Register Pool'}
              </button>
            </form>
          </div>

          {/* Stake Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Stake</h2>
            <form onSubmit={handleStake} className="space-y-4">
              <div>
                <label htmlFor="stakePoolAddress" className="block text-sm font-medium mb-2">
                  Pool Object Address
                </label>
                <input
                  type="text"
                  id="stakePoolAddress"
                  value={stakePoolAddress}
                  onChange={(e) => setStakePoolAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="stakeAmount" className="block text-sm font-medium mb-2">
                  Stake Amount
                </label>
                <input
                  type="number"
                  id="stakeAmount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
              >
                {staking ? 'Staking...' : 'Stake'}
              </button>
            </form>
          </div>

          {/* Harvest Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Harvest Rewards</h2>
            <form onSubmit={handleHarvest} className="space-y-4">
              <div>
                <label htmlFor="harvestPoolAddress" className="block text-sm font-medium mb-2">
                  Pool Object Address
                </label>
                <input
                  type="text"
                  id="harvestPoolAddress"
                  value={harvestPoolAddress}
                  onChange={(e) => setHarvestPoolAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
              >
                {harvesting ? 'Harvesting...' : 'Harvest'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
