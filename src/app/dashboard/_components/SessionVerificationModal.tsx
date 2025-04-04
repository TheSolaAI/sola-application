'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuX,
  LuArrowDown,
  LuArrowUp,
  LuRefreshCw,
  LuTriangleAlert,
  LuInfo,
  LuExternalLink,
} from 'react-icons/lu';
import { SiSolana } from 'react-icons/si';
import { SessionStatus } from '@/store/SessionManagerHandler';

interface SessionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionStatus: SessionStatus;
  onVerifyTier: () => Promise<void>;
  onConnect: () => Promise<void>;
  tierVerificationResult: {
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  } | null;
  userProvidedApiKey: () => string | null;
  onSetApiKey: (key: string) => void;
  onClearApiKey: () => void;
}

export default function SessionVerificationModal({
  isOpen,
  onClose,
  sessionStatus,
  onVerifyTier,
  onConnect,
  tierVerificationResult,
  userProvidedApiKey,
  onSetApiKey,
  onClearApiKey,
}: SessionVerificationModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyOption, setShowApiKeyOption] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Set initial API key from props
  useEffect(() => {
    if (userProvidedApiKey) {
      setApiKey(userProvidedApiKey() || '');
    }
  }, [userProvidedApiKey]);

  useEffect(() => {
    setIsVerifying(sessionStatus === 'checking');
    setIsConnecting(sessionStatus === 'connecting');
  }, [sessionStatus]);

  const handleVerifyTier = async () => {
    setIsVerifying(true);
    await onVerifyTier();
    setIsVerifying(false);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await onConnect();
    setIsConnecting(false);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      onSetApiKey(apiKey.trim());
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    onClearApiKey();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed max-h-screen inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-md max-h-[80%] bg-background border border-border rounded-xl shadow-xl overflow-y-auto overflow-x-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-textColor">
              Session Verification
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
                  <p className="text-textColor">
                    You&#39;ve reached the session limit for your tier.
                  </p>
                  <p className="text-secText text-sm">
                    Verify your SOLA token holdings to unlock additional
                    sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify holders section */}
            <div className="bg-sec_background p-4 rounded-lg">
              <h3 className="text-textColor font-medium flex items-center gap-2 mb-3">
                <SiSolana className="w-4 h-4 text-primary" />
                SOLA Token Holders Verification
              </h3>
              <p className="text-secText text-sm mb-4">
                Verify your SOLA token holdings to determine your tier and
                session allocation.
              </p>

              {/* Verification result */}
              {tierVerificationResult && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    tierVerificationResult.success
                      ? 'bg-primary/10 text-textColor'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {tierVerificationResult.success ? (
                    <div className="space-y-2">
                      <p>Verification successful!</p>
                      <div className="flex justify-between items-center">
                        <span>SOLA Balance:</span>
                        <span className="font-semibold">
                          {tierVerificationResult.totalSolaBalance.toLocaleString()}{' '}
                          SOLA
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Current Tier:</span>
                        <span className="font-semibold">
                          Tier {tierVerificationResult.tier}
                        </span>
                      </div>
                      {tierVerificationResult.message && (
                        <p className="text-primary mt-2">
                          {tierVerificationResult.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>
                      {tierVerificationResult.message || 'Verification failed'}
                    </p>
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

            {/* OpenAI key section (collapsible) */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowApiKeyOption(!showApiKeyOption)}
                className="w-full p-4 text-left flex items-center justify-between bg-sec_background hover:bg-surface transition-colors"
              >
                <span className="text-textColor font-medium">
                  Wanna try before purchasing $SOLA ?
                </span>
                {showApiKeyOption ? (
                  <LuArrowUp className="w-4 h-4" />
                ) : (
                  <LuArrowDown className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {showApiKeyOption && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t border-border bg-surface">
                      <div className="bg-primary/10 p-3 rounded-lg mb-4 text-sm text-secText">
                        <div className="flex gap-2">
                          <LuInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="mb-2">
                              SOLA AI is in early access development. So we want
                              every one the try the vesion of Voice Assistant
                              that we are building.
                            </p>
                            <p>
                              Note: SOLA uses multiple AI providers, not just
                              OpenAI.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-secText text-sm mb-1">
                          OpenAI API Key (This key is stored on your local
                          browser)
                        </label>
                        <div className="flex">
                          <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="flex-1 p-2 rounded-l-md bg-background border border-border focus:outline-none focus:border-primary text-textColor"
                          />
                          {apiKey && (
                            <button
                              onClick={handleClearApiKey}
                              className="px-2 bg-red-500/10 text-red-500 rounded-r-md border border-l-0 border-border"
                            >
                              <LuX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between gap-2">
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center gap-1 hover:underline"
                        >
                          Get an API key
                          <LuExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={handleSaveApiKey}
                          disabled={!apiKey.trim()}
                          className="px-4 py-1 bg-primary text-textColorContrast rounded-md disabled:opacity-50 text-sm"
                        >
                          Save Key
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-sec_background/50">
            <button
              onClick={handleConnect}
              disabled={
                isConnecting ||
                (sessionStatus !== 'connected' &&
                  !userProvidedApiKey &&
                  !tierVerificationResult?.success)
              }
              className="w-full py-3 px-4 bg-primary hover:bg-primaryDark text-textColorContrast rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <LuRefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Session'
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
