import React, { useEffect, useState } from 'react';
import { useWalletHandler } from '../../models/WalletHandler.ts';
import SUPPORTED_WALLETS from '../../config/wallets/supportedWallets.ts';
import { titleCase } from '../utils/titleCase.ts';
import { ChevronDown } from 'react-feather';
import { WalletPicker } from './WalletPicker.tsx';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import WalletCoinAssets from './WalletCoinAssets.tsx';
import { MaskedRevealLoader } from '../general/MaskedRevealLoader.tsx';
import useThemeManager from '../../models/ThemeManager.ts';

interface WalletLensSidebarProps {
  visible: boolean;
  setVisible?: (visible: boolean) => void;
}

export const WalletLensSideBar: React.FC<WalletLensSidebarProps> = ({
  visible,
}) => {
  /**
   * Global State
   */
  const { currentWallet, stopMonitoring, status } = useWalletHandler();
  const { theme } = useThemeManager();

  /**
   * Refs
   */
  const walletPickerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Local State
   */
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [walletLogo, setWalletLogo] = useState<string>('');
  const tabs = ['Tokens', 'NFTs'];

  useEffect(() => {
    if (SUPPORTED_WALLETS.includes(currentWallet?.walletClientType)) {
      setWalletLogo(`/wallets/${currentWallet?.walletClientType}.svg`);
    }
  }, [currentWallet?.walletClientType]);

  return (
    <div
      className={`h-full bg-sec_background rounded-2xl transition-all duration-300 overflow-hidden p-2 overflow-y-auto flex
    ${visible ? 'w-[25%] opacity-100' : 'w-0 opacity-0 p-0'}
  `}
    >
      <div className={`w-full ${!visible && 'hidden'}`}>
        {/* Header - Natural Height */}
        <div
          className={
            'bg-baseBackground flex flex-row items-center rounded-xl mt-2 p-3 gap-x-5 w-full'
          }
          ref={walletPickerRef}
        >
          <button onClick={(e) => e.stopPropagation()}>
            <img
              src={walletLogo}
              alt="wallet logo"
              className="w-14 h-14 rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://solscan.io/account/${currentWallet?.address}`,
                  '_blank',
                );
              }}
            />
          </button>
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-x-2">
              <h1 className="text-textColor font-semibold text-xl">
                {titleCase(currentWallet?.walletClientType)} Wallet
              </h1>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(currentWallet?.address || '');
                  toast.success('Copied to clipboard');
                }}
                className="text-secText hover:text-textColor transition-all"
              >
                <FiCopy size={16} />
              </button>
            </div>

            <h1 className="text-secText font-regular text-xs overflow-hidden whitespace-nowrap truncate w-full text-start">
              {currentWallet?.address}
            </h1>
          </div>
          <button onClick={() => setWalletPickerOpen(!walletPickerOpen)}>
            <ChevronDown className="w-8 h-8 text-secText flex-shrink-0" />
          </button>
        </div>
        <WalletPicker
          isOpen={walletPickerOpen}
          onClose={() => setWalletPickerOpen(false)}
          anchorEl={walletPickerRef.current!}
        />
        {/*   Tabbed Section*/}
        <MaskedRevealLoader
          isLoading={status === 'initialLoad'}
          backgroundColor={theme.baseBackground}
        >
          {status === 'initialLoad' ? (
            <div className={'flex-1 mt-5'} />
          ) : (
            <>
              <div className="flex flex-col mt-3">
                <div className="flex relative z-10">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`
                      px-4 py-2 rounded-t-lg font-medium transition-colors duration-200
                      ${
                        activeTab === index
                          ? 'bg-baseBackground text-textColor'
                          : 'bg-background text-secText hover:bg-surface'
                      }
                    `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-baseBackground p-2 pt-3 rounded-2xl rounded-tl-none flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    {activeTab === 0 ? (
                      <WalletCoinAssets />
                    ) : (
                      <div className="text-textColor">
                        <button
                          onClick={() => stopMonitoring()}
                          className="px-4 py-2 rounded-lg bg-primary text-white shrink-0"
                        >
                          Stop Updates
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </MaskedRevealLoader>
      </div>
    </div>
  );
};
