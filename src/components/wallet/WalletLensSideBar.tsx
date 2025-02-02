import React, { useEffect, useState } from 'react';
import { useWalletHandler } from '../../models/WalletHandler.ts';
import SUPPORTED_WALLETS from '../../config/wallets/supportedWallets.ts';
import { titleCase } from '../utils/titleCase.ts';
import { ChevronDown } from 'react-feather';
import { WalletPicker } from './WalletPicker.tsx';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';

interface WalletLensSidebarProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const WalletLensSideBar: React.FC<WalletLensSidebarProps> = ({
  visible,
  setVisible,
}) => {
  /**
   * Global States
   */
  const { currentWallet } = useWalletHandler();

  /**
   * Local State
   */
  const [walletLogo, setWalletLogo] = useState<string>('');
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);

  /**
   * Refs
   */
  const walletPickerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (SUPPORTED_WALLETS.includes(currentWallet?.walletClientType)) {
      setWalletLogo(`/wallets/${currentWallet?.walletClientType}.svg`);
    }
  }, [currentWallet?.walletClientType]);

  return (
    <div
      className={`h-full bg-sec_background rounded-2xl transition-all duration-300 overflow-hidden p-2 flex flex-col gap-y-3
        ${visible ? 'w-[25%]' : 'w-0'}`} // sidebar div
    >
      {/*  Header*/}
      <div
        className={
          'bg-background flex flex-row items-center rounded-xl mt-2 p-3 gap-x-5 w-full'
        }
        ref={walletPickerRef}
      >
        <button onClick={(e) => e.stopPropagation()}>
          <img
            src={`/wallets/${currentWallet?.walletClientType}.svg`}
            alt="wallet logo"
            className="w-14 h-14 rounded-xl"
            onClick={(e) => {
              e.stopPropagation(); // Stop event from selecting the wallet
              window.open(
                `https://soloscan.io/account/${currentWallet?.address}`,
                '_blank',
              );
            }}
          />
        </button>
        <div className="flex flex-col items-start flex-1 min-w-0">
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

          <h1 className="text-secText font-light text-xs overflow-hidden whitespace-nowrap truncate w-full text-start">
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

      {/*  Tokens and NFT Section*/}
      <div className={'flex-1 rounded-2xl bg-background'}></div>
    </div>
  );
};
