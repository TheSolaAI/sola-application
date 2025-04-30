'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import { WalletPicker } from '@/app/dashboard/_components/wallet/WalletPicker';
import { FiCopy } from 'react-icons/fi';
import { LuChevronDown, LuX } from 'react-icons/lu';
import { FaAngleDoubleRight } from 'react-icons/fa';
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
  setVisible,
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
  const walletPickerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  /**
   * Local State
   */
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hoverCloseButton, setHoverCloseButton] = useState(false);
  const [showExpandedElements, setShowExpandedElements] = useState(visible);
  const tabs = ['Tokens', 'NFTs', 'Transactions'];
  const isMobile = useIsMobile();

  // Transition controls - similar to Sidebar
  useEffect(() => {
    if (visible) {
      setShowExpandedElements(true);
    } else {
      const timer = setTimeout(() => {
        setShowExpandedElements(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  /**
   * Close the panel when clicking outside
   */
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setWalletPickerOpen(false);
      if (isMobile) {
        handleWalletLensOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`h-full transition-all duration-300 ease-in-out overflow-y-auto border-l-[1px] border-border
        ${visible ? 'opacity-100 w-125' : 'w-0 opacity-0'}
        ${isMobile && visible && 'fixed right-0 top-0 bottom-0 w-full z-40'}
        ${!isMobile ? 'rounded-r-2xl' : ''}
        bg-sec_background
      `}
    >
      {/* Collapsed state - Close button for non-mobile */}
      {!isMobile && (
        <button
          onClick={() => handleWalletLensOpen(false)}
          className={`absolute right-4 top-6 z-10 text-textColor hover:text-primaryDark transition-colors p-1 rounded-md hover:bg-background active:bg-primary/20 ${
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <FaAngleDoubleRight size={20} />
        </button>
      )}

      <div className={`w-full h-full p-3 pt-6 ${!visible && 'hidden'}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between h-10 mb-4">
          <h1 className="text-2xl font-bold text-textColor whitespace-nowrap">
            Wallet Lens
          </h1>

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => handleWalletLensOpen(false)}
              onMouseEnter={() => setHoverCloseButton(true)}
              onMouseLeave={() => setHoverCloseButton(false)}
              className={`p-2 rounded-md transition-all duration-200 ${
                hoverCloseButton ? 'bg-primary' : 'hover:bg-background'
              } active:scale-95`}
            >
              <LuX size={24} className="text-textColor" />
            </button>
          )}
        </div>

        {/* Wallet Picker Section */}
        <div
          className="bg-baseBackground flex flex-row items-center justify-center rounded-xl gap-x-2 p-3 w-full mb-6 border-border border-[1px]"
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
                  e.stopPropagation();
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

          <button
            onClick={() => setWalletPickerOpen(!walletPickerOpen)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-background active:bg-primary/20 transition-colors"
          >
            <LuChevronDown className="w-6 h-6 text-secText" />
          </button>
        </div>

        {/* Wallet Picker Dropdown */}
        <WalletPicker
          isOpen={walletPickerOpen}
          onClose={() => setWalletPickerOpen(false)}
          anchorEl={walletPickerRef.current!}
        />

        {/* Tabbed Content Section */}
        <MaskedRevealLoader
          isLoading={status === 'initialLoad'}
          backgroundColor={theme.baseBackground}
        >
          {status === 'initialLoad' ? (
            <div className="flex-1 mt-5" />
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex flex-col">
                <div className="flex relative z-10">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`
                        px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 border-border border-[1px] border-b-0
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

              {/* Tab Content */}
              <div className="bg-baseBackground p-2 pt-3 rounded-xl rounded-tl-none flex-1 flex flex-col border-border border-[1px]">
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
                      <div className="flex items-center justify-center p-4 h-full">
                        <p className="text-textColor">Coming Soon</p>
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
