'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaMobileAlt } from 'react-icons/fa';
import { HiComputerDesktop } from 'react-icons/hi2';

interface HeroProps {
  login: () => void;
  disabled: boolean;
  isMobile: boolean;
  showMobileView: boolean;
  setShowMobileView: (show: boolean) => void;
  promptInstall: () => Promise<string | null>;
  isInstallPromptAvailable: boolean;
}

export default function Hero({
  login,
  disabled,
  isMobile,
  showMobileView,
  setShowMobileView,
  promptInstall,
  isInstallPromptAvailable,
}: HeroProps) {
  const handleMobileView = () => {
    setShowMobileView(!showMobileView);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-24 sm:py-32 lg:pb-40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-indigo-200">
            Welcome to Sola AI
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
            Redefine your Solana on-chain experience through intuitive voice
            commands. Join our Early Access program and help shape the future of
            blockchain interaction.
          </p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <motion.button
              onClick={() => login()}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-15 w-40 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              Get started
            </motion.button>

            {!isMobile ? (
              <motion.button
                onClick={handleMobileView}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 text-sm/6 font-semibold text-indigo-300 hover:text-indigo-200 transition-colors duration-200
                }`}
              >
                {showMobileView ? (
                  <>
                    <HiComputerDesktop /> View Desktop Version
                  </>
                ) : (
                  <>
                    <FaMobileAlt /> Try On Mobile{' '}
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleInstall}
                disabled={!isInstallPromptAvailable}
                whileHover={{
                  scale: !isInstallPromptAvailable ? 1 : 1.05,
                }}
                whileTap={{
                  scale: !isInstallPromptAvailable ? 1 : 0.95,
                }}
                className={`flex items-center gap-2 text-sm/6 font-semibold ${
                  isInstallPromptAvailable
                    ? 'text-indigo-300 hover:text-indigo-200'
                    : 'text-gray-500 cursor-not-allowed'
                } transition-colors duration-200`}
              >
                <FaMobileAlt /> Install App <span aria-hidden="true">→</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {showMobileView && !isMobile ? (
          // Mobile QR view for desktop users
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="mt-16 flow-root sm:mt-24 flex justify-center"
          >
            <div className="p-8 rounded-xl bg-gray-900/80 backdrop-blur-sm">
              <h3 className="text-xl font-medium text-white mb-4 text-center">
                Scan to open on your mobile device
              </h3>
              <div className="relative h-64 w-64 mx-auto">
                <Image
                  alt="QR Code"
                  src="/qr.png"
                  fill
                  className="rounded-lg shadow-lg"
                />
              </div>
              <p className="text-gray-400 text-sm mt-4 text-center">
                Or open <span className="text-indigo-400">solaai.xyz</span> on
                your mobile browser
              </p>
            </div>
          </motion.div>
        ) : (
          // Default app screenshot view
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flow-root sm:mt-24"
          >
            <img
              alt="App screenshot"
              src="/app-screenshot.png"
              className="rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
