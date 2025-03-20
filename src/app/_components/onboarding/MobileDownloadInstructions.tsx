'use client';

import { motion } from 'framer-motion';
import { FaArrowUp, FaShareAlt, FaPlus, FaChrome } from 'react-icons/fa';
import { usePwaStatus } from '@/hooks/usePwaStatus';

interface MobileDownloadInstructionsProps {
  promptInstall: () => Promise<string | null>;
  isInstallPromptAvailable: boolean;
}

export default function MobileDownloadInstructions({
  promptInstall,
  isInstallPromptAvailable,
}: MobileDownloadInstructionsProps) {
  const { userAgent } = usePwaStatus();

  const handleInstallClick = async () => {
    if (isInstallPromptAvailable) {
      await promptInstall();
    }
  };

  // Instructions based on browser/device
  const getInstructions = () => {
    if (userAgent.isIOS && userAgent.isSafari) {
      return [
        {
          icon: <FaShareAlt />,
          text: 'Tap the Share button at the bottom of the screen',
        },
        {
          icon: <FaPlus />,
          text: 'Scroll down and tap "Add to Home Screen"',
        },
        {
          icon: <FaArrowUp />,
          text: 'Tap "Add" in the top right corner',
        },
      ];
    } else if (userAgent.isAndroid && userAgent.isChrome) {
      return [
        {
          icon: <FaChrome />,
          text: 'Tap the menu button (three dots) in Chrome',
        },
        {
          icon: <FaPlus />,
          text: 'Tap "Add to Home Screen"',
        },
        {
          icon: <FaArrowUp />,
          text: 'Tap "Add" when prompted',
        },
      ];
    } else {
      // Generic instructions
      return [
        {
          icon: <FaShareAlt />,
          text: 'Tap the share or menu button in your browser',
        },
        {
          icon: <FaPlus />,
          text: 'Look for "Add to Home Screen" or similar option',
        },
        {
          icon: <FaArrowUp />,
          text: 'Confirm by tapping "Add" when prompted',
        },
      ];
    }
  };

  const instructions = getInstructions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto rounded-xl bg-gray-900/70 backdrop-blur-sm p-6 shadow-xl ring-1 ring-white/10"
    >
      <h3 className="text-xl font-semibold text-white text-center mb-6">
        Install Sola AI on your device
      </h3>

      {isInstallPromptAvailable ? (
        <div className="mb-6">
          <motion.button
            onClick={handleInstallClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-colors duration-200"
          >
            Install Sola AI
          </motion.button>
          <p className="mt-3 text-sm text-gray-400 text-center">
            Or follow the manual steps below
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-center text-indigo-300">
          Follow these steps to install Sola AI on your home screen:
        </p>
      )}

      <div className="space-y-4">
        {instructions.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/60 ring-1 ring-white/5"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-indigo-600/20 flex items-center justify-center text-indigo-300">
              {step.icon}
            </div>
            <p className="text-gray-300 text-sm flex-1">{step.text}</p>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 text-white font-medium">
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-xs text-center text-gray-500">
        Once installed, you&#39;ll be able to launch Sola AI directly from your
        home screen.
      </p>
    </motion.div>
  );
}
