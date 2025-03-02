import { forwardRef, useState } from 'react';
import {
  useSolanaWallets,
  usePrivy,
  useDelegatedActions,
  WalletWithMetadata,
} from '@privy-io/react-auth';
import {
  FaCopy,
  FaExternalLinkAlt,
  FaWallet,
  FaFileExport,
  FaUserFriends,
} from 'react-icons/fa';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { TiTick } from 'react-icons/ti';

interface WalletSettingsProps {}

export interface WalletSettingsRef {
  onSubmit: () => void;
}

export const WalletSettings = forwardRef<
  WalletSettingsRef,
  WalletSettingsProps
>((_, ref) => {
  const { wallets, exportWallet } = useSolanaWallets();
  const { ready, authenticated, user } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { delegateWallet } = useDelegatedActions();

  // Local state
  const [copied, setCopied] = useState(false);

  // wallet extraction
  const privyEmbeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy',
  );
  const embeddedWalletAddress = privyEmbeddedWallet?.address || '';

  // Check if the wallet to delegate by inspecting the user's linked accounts
  const isAlreadyDelegated = !!user?.linkedAccounts.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' && account.delegated,
  );

  // Function to copy the public key to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embeddedWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy address');
    }
  };

  // Function to redirect to a specific page with the public key
  const redirectToPage = () => {
    window.open(
      `https://solscan.io/account/${embeddedWalletAddress}`,
      '_blank',
    );
  };

  // Action button handlers
  const handleFund = async () => {
    await fundWallet(embeddedWalletAddress, {});
  };

  const handleExport = async () => {
    toast.info('Never Expose the Key');
    await exportWallet({ address: embeddedWalletAddress });
  };

  const handleDelegate = async () => {
    await delegateWallet({
      address: embeddedWalletAddress,
      chainType: 'solana',
    });
  };

  if (!(ready && authenticated) || !user) {
    return <div className="animate-pulse p-4">Loading user settings...</div>;
  }

  return (
    <div className="flex flex-col w-full items-start justify-center gap-y-4 sm:gap-y-8">
      {/* Privy Embedded Wallet */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor my-2 text-lg sm:text-xl">
          Privy Embedded Wallet
        </h1>

        {/* Public Key Section */}
        <div className="w-full space-y-2">
          <p className="font-regular text-secText text-sm my-1">Public Key</p>

          {/* Address display - responsive for mobile */}
          <div className="flex w-full flex-col sm:flex-row gap-2">
            <div className="border border-border rounded-md p-2 bg-sec_background text-textColor flex-1 overflow-hidden text-ellipsis text-sm sm:text-base break-all sm:break-normal">
              {embeddedWalletAddress}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="p-2 bg-sec_background border border-border rounded-md hover:bg-opacity-80"
                title="Copy public key"
              >
                {copied ? (
                  <TiTick className="text-secText" size={16} />
                ) : (
                  <FaCopy className="text-textColor" size={16} />
                )}
              </button>

              <button
                onClick={redirectToPage}
                className="p-2 bg-sec_background border border-border rounded-md hover:bg-opacity-90 flex items-center justify-center"
                title="Connect"
              >
                <FaExternalLinkAlt className="text-textColor" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Action Buttons*/}
        <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={handleFund}
            className="flex items-center justify-center gap-x-2 bg-sec_background text-secText hover:bg-backgroundContrast hover:text-textColorContrast rounded-md py-2 px-3 text-sm sm:text-base"
          >
            <FaWallet size={14} className="flex-shrink-0" />
            <span>Fund</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-x-2 bg-sec_background text-secText hover:bg-backgroundContrast hover:text-textColorContrast rounded-md py-2 px-3 text-sm sm:text-base"
          >
            <FaFileExport size={14} className="flex-shrink-0" />
            <span>Export</span>
          </button>

          <button
            disabled={isAlreadyDelegated}
            onClick={handleDelegate}
            className={`flex items-center justify-center gap-x-2 rounded-md py-2 px-3 text-sm sm:text-base 
    ${
      isAlreadyDelegated
        ? 'bg-backgroundContrast text-textColorContrast cursor-not-allowed'
        : 'bg-sec_background text-secText hover:bg-backgroundContrast hover:text-textColorContrast'
    }`}
          >
            <FaUserFriends size={14} className="flex-shrink-0" />
            <span>Delegate</span>
          </button>
        </div>
      </div>
    </div>
  );
});

WalletSettings.displayName = 'WalletSettings';
