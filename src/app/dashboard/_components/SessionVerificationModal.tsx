'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuX,
  LuRefreshCw,
  LuTriangleAlert,
  LuChevronDown,
  LuCheck,
} from 'react-icons/lu';
import { SiSolana } from 'react-icons/si';
import { useAppSelector } from '@/redux/hook';
import { UserTiers } from '@/config/tierMapping';
import { HiWallet } from 'react-icons/hi2';
import { ConnectedSolanaWallet, useConnectWallet } from '@privy-io/react-auth';
import { useWalletHandler } from '@/store/WalletHandler';

interface SessionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyTier: () => Promise<void | {
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  } | null>;
  tierVerificationResult: {
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  } | null;
}

export default function SessionVerificationModal({
  isOpen,
  onClose,
  onVerifyTier,
  tierVerificationResult,
}: SessionVerificationModalProps) {
  /*
   * Global states
   */
  const tierFromRedux = useAppSelector((state) => state.tier.userTier);
  const { wallets, setWallets, setCurrentWallet } = useWalletHandler();

  /*
   * Local states
   */
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  //TODO: This logic is used in wallet side bar, So create a reusable component for this.
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      if (wallet.type === 'solana') {
        const walletExists = wallets.some((w) => w.address === wallet.address);

        if (!walletExists) {
          setWallets([...wallets, wallet as unknown as ConnectedSolanaWallet]);
        }

        setCurrentWallet(wallet as unknown as ConnectedSolanaWallet);
      }
    },
  });

  // Updated to use either Redux state or prop-passed state
  const displayResult = tierFromRedux || tierVerificationResult;

  // Updated handleVerifyTier function
  const handleVerifyTier = async () => {
    try {
      setIsVerifying(true);
      await onVerifyTier();
      // No need to manually update state here as Redux will handle it
    } catch (error) {
      console.error('Error during tier verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed max-h-screen inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-md max-h-[85%] bg-background border border-border rounded-xl shadow-xl overflow-y-auto overflow-x-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-textColor">
              Holders Verification
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-surface text-secText"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Main message */}
            <div className="bg-surface p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <LuTriangleAlert className="w-5 h-5 text-primaryDark" />
                </div>
                <div className="space-y-2">
                  <p className="text-textColor">Verify Your Sola Holdings.</p>
                  <p className="text-secText text-sm">
                    Verify your SOLA token holdings to unlock additional
                    features and usage limits.
                  </p>
                </div>
              </div>
            </div>

            {/* Tier Information Dropdown */}
            <div className="bg-sec_background p-4 rounded-lg">
              <div
                onClick={() => setShowTierDropdown(!showTierDropdown)}
                className="flex justify-between items-center cursor-pointer"
              >
                <h3 className="text-textColor font-medium">Available Tiers</h3>
                <motion.div
                  animate={{ rotate: showTierDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LuChevronDown className="text-secText" />
                </motion.div>
              </div>

              <AnimatePresence>
                {showTierDropdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-t border-border pt-3 space-y-2">
                      {/* Free Tier Information */}
                      <div className="p-3 rounded-lg bg-surface">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {displayResult && displayResult.tier === 0 && (
                              <LuCheck className="text-primary" />
                            )}
                            <span className="font-medium text-textColor">
                              Free Tier
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-secText">
                          <span>No SOLA tokens required - Basic access</span>
                        </div>
                      </div>

                      {UserTiers.filter((tier) => tier.id > 0).map((tier) => (
                        <div
                          key={tier.id}
                          className={`p-3 rounded-lg ${
                            displayResult && displayResult.tier === tier.id
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-surface'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {displayResult &&
                                displayResult.tier === tier.id && (
                                  <LuCheck className="text-primary" />
                                )}
                              <span className="font-medium text-textColor">
                                Tier {tier.id}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-xs text-secText">
                            <SiSolana className="w-3 h-3 mr-1 text-primary" />
                            <span>
                              {formatNumber(tier.minTokens)}+ SOLA required
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="text-xs text-secText mt-2">
                        <p className="italic">
                          Higher tiers provide more daily usage and enhanced
                          features.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Verify holders section */}
            <div className="bg-sec_background p-4 rounded-lg">
              <h3 className="text-textColor font-medium flex items-center gap-2 mb-3">
                <SiSolana className="w-4 h-4 text-primary" />
                SOLA Token Holders Verification
              </h3>
              <p className="text-secText text-sm mb-4">
                Verify your SOLA token holdings to determine your tier and
                feature limits.
              </p>

              {/* Verification result - now uses the combined displayResult */}
              {displayResult && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    displayResult.success
                      ? 'bg-primary/10 text-textColor'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {displayResult.success ? (
                    <div className="space-y-2">
                      <p>Verification successful!</p>
                      <div className="flex justify-between items-center">
                        <span>SOLA Balance:</span>
                        <span className="font-semibold">
                          {displayResult.totalSolaBalance.toLocaleString()} SOLA
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Current Tier:</span>
                        <span className="font-semibold">
                          Tier {displayResult.tier}
                        </span>
                      </div>
                      {displayResult.message && (
                        <p className="text-primary mt-2">
                          {displayResult.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>{displayResult.message || 'Verification failed'}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleVerifyTier}
                disabled={isVerifying}
                className="w-full py-2 px-4 bg-primary hover:bg-primaryDark text-textColorContrast rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <LuRefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify SOLA Holdings'
                )}
              </button>
            </div>

            <div className="bg-sec_background p-4 rounded-lg">
              <h3 className="text-textColor font-medium flex items-center gap-2 mb-3">
                <HiWallet className="w-4 h-4 text-primary" />
                Link your wallets
              </h3>
              <p className="text-secText text-sm mb-4">
                Link your $SOLA wallets to get higher tier allocation
              </p>

              <button
                onClick={() =>
                  connectWallet({ walletChainType: 'solana-only' })
                }
                disabled={isVerifying}
                className="w-full py-2 px-4 bg-primary hover:bg-primaryDark text-textColorContrast rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Link Wallet
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
