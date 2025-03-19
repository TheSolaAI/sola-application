'use client';
import React, { useState } from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import { WalletPicker } from '@/app/dashboard/_components/wallet/WalletPicker';
import { FiCopy } from 'react-icons/fi';
import { LuChevronDown, LuX } from 'react-icons/lu';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import WalletCoinAssets from '@/app/dashboard/_components/wallet/WalletCoinAssets';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { WalletNFTAssets } from '@/app/dashboard/_components/wallet/WalletNFTAssets';
import useIsMobile from '@/utils/isMobile';
import Image from 'next/image';

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
  const { currentWallet, status } = useWalletHandler();
  const { theme } = useThemeManager();
  const { handleWalletLensOpen } = useLayoutContext();

  /**
   * Refs
   */
  const walletPickerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Local State
   */
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Tokens', 'NFTs', 'Transactions'];
  const isMobile = useIsMobile();

  return (
    <div
      className={`h-full bg-sec_background sm:rounded-2xl transition-all duration-500 overflow-y-auto flex
      ${visible ? 'opacity-100 sm:ml-2 w-[35rem] p-2' : 'w-0 opacity-100'}
      ${isMobile && visible && 'min-w-[100%]'}
    `}
    >
      <div className={`w-full ${!visible && 'hidden'}`}>
        {/* Header - Container */}
        <div className={'flex flex-row mt-2 gap-x-2 w-full'}>
          {/* Close Button that is only shown on Mobile*/}
          <div className="flex justify-center items-center sm:hidden bg-baseBackground p-2 rounded-2xl border-border border-2">
            <button
              onClick={() => {
                handleWalletLensOpen(false);
              }}
              className="p-1 sm:p-2"
            >
              <LuX className=" w-4 h-4 sm:w-8 sm:h-8 text-secText" />
            </button>
          </div>
          {/* End Close Button*/}
          {/* Wallet Info and wallet changer */}
          <div
            className="bg-baseBackground flex flex-row items-center justify-center rounded-2xl gap-x-2  p-3 w-full"
            ref={walletPickerRef}
          >
            <button onClick={(e) => e.stopPropagation()}>
              {currentWallet?.meta.icon ? (
                <Image
                  src={currentWallet.meta.icon}
                  alt="wallet logo"
                  className="bg-white p-2 rounded-xl"
                  height={36}
                  width={36}
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event from selecting the wallet
                    window.open(
                      `https://solscan.io/account/${currentWallet.address}`,
                      '_blank'
                    );
                  }}
                />
              ) : (
                <Image
                  src="/default_wallet.svg"
                  alt="wallet logo"
                  width={36}
                  height={36}
                  className="rounded-xl"
                />
              )}
            </button>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <div className="flex items-center gap-x-2">
                <h1 className="text-sm text-textColor font-semibold sm:text-xl">
                  {titleCase(currentWallet?.meta.name)}
                </h1>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(currentWallet?.address || '');
                    toast.success('Copied to clipboard');
                  }}
                  className="text-secText hover:text-textColor transition-all flex-shrink-0"
                >
                  <FiCopy size={16} />
                </button>
              </div>

              <h1 className="text-secText font-regular text-xs overflow-hidden whitespace-nowrap truncate min-w-0 w-full hidden sm:block">
                {currentWallet?.address}
              </h1>
            </div>

            {/* Ensure Dropdown Button Doesn't Get Pushed Out */}
            <button
              onClick={() => setWalletPickerOpen(!walletPickerOpen)}
              className="flex-shrink-0"
            >
              <LuChevronDown className="w-8 h-8 text-secText" />
            </button>
          </div>
        </div>
        {/* End Wallet Picker */}
        <WalletPicker
          isOpen={walletPickerOpen}
          onClose={() => setWalletPickerOpen(false)}
          anchorEl={walletPickerRef.current!}
        />
        {/* End Header */}
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
                    ) : activeTab === 1 ? (
                      <WalletNFTAssets />
                    ) : (
                      <p className={'text-textColor'}> Coming Soon</p>
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
