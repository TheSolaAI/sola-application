'use client';
import { FC } from 'react';
import { Dropdown } from '@/components/common/DropDown';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import { FiCopy } from 'react-icons/fi';
import { LuLink } from 'react-icons/lu';
import { toast } from 'sonner';
import { ConnectedSolanaWallet, useConnectWallet } from '@privy-io/react-auth';
import Image from 'next/image';

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
  const { wallets, currentWallet, setCurrentWallet, setWallets } =
    useWalletHandler();
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      if (wallet.type === 'solana') {
        // Check if this wallet is already in the wallets array by address
        const walletExists = wallets.some((w) => w.address === wallet.address);

        if (!walletExists) {
          setWallets([...wallets, wallet as unknown as ConnectedSolanaWallet]);
        }

        setCurrentWallet(wallet as unknown as ConnectedSolanaWallet);
      }
    },
  });

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
      <div className="flex gap-y-3 flex-col px-2 pb-2">
        {wallets.map((wallet) => (
          <div
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
              {wallet.meta.icon ? (
                <Image
                  src={wallet.meta.icon}
                  alt="wallet logo"
                  className="bg-white p-2 rounded-xl"
                  height={36}
                  width={36}
                  onClick={(e) => {
                    e.stopPropagation(); // Stop event from selecting the wallet
                    window.open(
                      `https://solscan.io/account/${wallet.address}`,
                      '_blank'
                    );
                  }}
                />
              ) : (
                <Image
                  src="/default_wallet.svg"
                  alt="wallet logo"
                  className="rounded-xl"
                  width={40}
                  height={40}
                />
              )}
            </button>

            {/* Wallet Info */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <div className="flex items-center gap-x-2">
                <h1 className="text-textColor font-semibold text-xl">
                  {titleCase(wallet?.meta.name)}
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
          </div>
        ))}
        {/* Link a new Wallet */}
        <button
          className={
            'flex items-center justify-center w-full p-4 bg-surface rounded-xl gap-x-2 border-[2px] border-border'
          }
          onClick={() => {
            connectWallet();
          }}
        >
          <LuLink size={24} className="text-textColor text-md" />
          <h1 className="text-textColor font-normal text-md">
            Link Another Wallet
          </h1>
        </button>
      </div>
    </Dropdown>
  );
};
