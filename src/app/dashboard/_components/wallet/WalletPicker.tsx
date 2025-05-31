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
      <div className="flex flex-col gap-y-2 p-2">
        {wallets.map((wallet) => (
          <div
            key={wallet.address}
            className={`min-h-[56px] flex flex-col justify-center overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer shadow-sm
              ${
                currentWallet?.address === wallet.address
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-sec_background hover:bg-surface/40'
              }
            `}
            onClick={() => {
              onClose();
              setCurrentWallet(wallet);
            }}
          >
            {/* Header with wallet name and copy button */}
            <div className="px-3 py-1 border-b border-border flex justify-between items-center">
              <h2 className="text-sm font-semibold text-textColor flex items-center gap-2 truncate max-w-[120px]">
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
                  <FiCopy className="text-secText" size={12} />
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
                  <LuExternalLink className="text-secText" size={12} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-2 flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-md overflow-hidden bg-white">
                <Image
                  src={wallet.meta.icon || '/default_wallet.svg'}
                  alt="wallet logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] uppercase tracking-wider text-secText mb-0.5 block">
                  Address
                </label>
                <div className="bg-surface/30 px-2 py-0.5 rounded text-xs font-mono text-textColor truncate">
                  {wallet?.address}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Link a new Wallet */}
        <div className="overflow-hidden rounded-lg bg-sec_background border border-border shadow w-full mt-1">
          <div className="px-3 py-2 border-b border-border">
            <h2 className="text-sm font-semibold text-textColor">
              Link Wallet
            </h2>
          </div>
          <div className="p-2">
            <button
              className="flex items-center justify-center w-full p-2 bg-surface/30 rounded gap-x-2 hover:bg-surface/50 transition-colors text-sm"
              onClick={() => {
                connectWallet();
              }}
            >
              <LuLink size={16} className="text-textColor" />
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
