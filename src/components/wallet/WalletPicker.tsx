import { FC } from 'react';
import { Dropdown } from '../general/DropDown.tsx';
import { useWalletHandler } from '../../models/WalletHandler.ts';
import { titleCase } from '../utils/titleCase.ts';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import SUPPORTED_WALLETS from '../../config/wallets/supportedWallets.ts'; // Import copy icon from react-icons

interface WalletPickerProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement;
}

export const WalletPicker: FC<WalletPickerProps> = ({
  isOpen,
  onClose,
  anchorEl,
}) => {
  /**
   * Global State
   */
  const { wallets, currentWallet, setCurrentWallet } = useWalletHandler();

  /**
   * Fetches the wallet logo if we support it or else the default logo
   */
  const getWalletLogo = (walletClientType: string) => {
    if (SUPPORTED_WALLETS.includes(walletClientType)) {
      return `/wallets/${walletClientType}.svg`;
    } else {
      return '/wallets/default.svg';
    }
  };

  /** Function to copy the wallet address */
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Select Wallet"
      mobileTitle="Select Wallet"
      direction="down"
      width="component"
    >
      <div className="flex gap-y-3 flex-col">
        {wallets.map((wallet) => (
          <button
            key={wallet.walletClientType}
            className={`flex items-center justify-between w-full p-4 bg-surface rounded-xl gap-x-4 ${
              currentWallet?.walletClientType === wallet.walletClientType
                ? 'border-[1.5px] border-primaryDark'
                : ''
            }`}
            onClick={() => {
              onClose();
              setCurrentWallet(wallet);
            }}
          >
            <button
              className="focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getWalletLogo(wallet.walletClientType)}
                alt="wallet logo"
                className="w-14 h-14 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event from selecting the wallet
                  window.open(
                    `https://solscan.io/account/${wallet.address}`,
                    '_blank',
                  );
                }}
              />
            </button>

            {/* Wallet Info */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <div className="flex items-center gap-x-2">
                <h1 className="text-textColor font-semibold text-xl">
                  {titleCase(wallet?.walletClientType)} Wallet
                </h1>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(wallet.address);
                    toast.success('Copied to clipboard');
                  }}
                  className="text-secText hover:text-textColor transition-all"
                >
                  <FiCopy size={16} />
                </button>
              </div>

              <h1 className="text-secText font-light text-xs overflow-hidden whitespace-nowrap truncate w-full text-start">
                {wallet?.address}
              </h1>
            </div>
          </button>
        ))}
      </div>
    </Dropdown>
  );
};
