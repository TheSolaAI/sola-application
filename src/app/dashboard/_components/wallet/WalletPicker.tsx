'use client';
import { FC } from 'react';
import { Dropdown } from '@/components/common/DropDown';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import { FiCopy } from 'react-icons/fi';
import { LuLink, LuExternalLink } from 'react-icons/lu';
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
    toast.success('Address copied to clipboard');
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
      <div className="flex flex-col gap-y-3 p-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.address}
            className={`overflow-hidden rounded-xl bg-sec_background border ${
              currentWallet?.address === wallet.address
                ? 'border-primaryDark'
                : 'border-border'
            } shadow-lg w-full cursor-pointer transition-opacity duration-500`}
            onClick={() => {
              onClose();
              setCurrentWallet(wallet);
            }}
          >
            {/* Header with wallet name and copy button */}
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
                {titleCase(wallet?.meta.name)}
              </h2>

              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(wallet.address);
                  }}
                  className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                  title="Copy to clipboard"
                >
                  <FiCopy className="text-secText" size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://solscan.io/account/${wallet.address}`,
                      '_blank'
                    );
                  }}
                  className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
                  title="View on Solscan"
                >
                  <LuExternalLink className="text-secText" size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-4">
                {wallet.meta.icon ? (
                  <Image
                    src={wallet.meta.icon}
                    alt="wallet logo"
                    className="bg-white p-2 rounded-xl"
                    height={60}
                    width={60}
                  />
                ) : (
                  <Image
                    src="/default_wallet.svg"
                    alt="wallet logo"
                    className="rounded-xl"
                    width={60}
                    height={60}
                  />
                )}

                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                    Address
                  </label>
                  <div className="bg-surface/30 px-3 py-1 rounded-lg text-sm font-mono text-textColor overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {wallet?.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Link a new Wallet */}
        <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold text-textColor">
              Link Wallet
            </h2>
          </div>
          <div className="p-4">
            <button
              className="flex items-center justify-center w-full p-3 bg-surface/30 rounded-lg gap-x-2 hover:bg-surface/50 transition-colors"
              onClick={() => {
                connectWallet();
              }}
            >
              <LuLink size={20} className="text-textColor" />
              <span className="text-textColor font-medium">
                Connect New Wallet
              </span>
            </button>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};
