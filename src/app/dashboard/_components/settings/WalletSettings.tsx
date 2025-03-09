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
  FaPlus,
  FaRegCreditCard,
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
  const { ready, authenticated, user, connectWallet } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { delegateWallet } = useDelegatedActions();

  /**
   * Local State
   */
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Extract embedded wallet and external wallets
  const privyEmbeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );
  const externalWallets = wallets.filter(
    (wallet) => wallet.walletClientType !== 'privy'
  );

  const embeddedWalletAddress = privyEmbeddedWallet?.address || '';

  // Check if the wallet is delegated
  const isAlreadyDelegated = !!user?.linkedAccounts.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' && account.delegated
  );

  // Function to copy wallet address to clipboard
  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied({ ...copied, [address]: true });
      setTimeout(() => setCopied({ ...copied, [address]: false }), 2000);
      toast.success('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy address');
    }
  };

  // Function to redirect to explorer page
  const redirectToExplorer = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
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

  const handleConnectWallet = () => {
    connectWallet();
  };

  if (!(ready && authenticated) || !user) {
    return <div className="animate-pulse p-4">Loading user settings...</div>;
  }

  return (
    <div className="flex flex-col w-full items-start justify-center gap-y-6 sm:gap-y-8">
      {/* Privy Embedded Wallet  */}
      <div className="w-full border border-border rounded-lg p-4 bg-baseBackground">
        <div className="flex items-center gap-2 mb-4">
          <FaRegCreditCard className="text-primary text-xl" />
          <h1 className="font-semibold text-textColor text-lg sm:text-xl">
            Privy Embedded Wallet{' '}
            <span className="text-xs font-normal bg-primary/20 text-primary rounded-full px-2 py-0.5">
              Default
            </span>
          </h1>
        </div>

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
                onClick={() => copyToClipboard(embeddedWalletAddress)}
                className="p-2 bg-sec_background border border-border rounded-md hover:bg-opacity-80"
                title="Copy public key"
              >
                {copied[embeddedWalletAddress] ? (
                  <TiTick className="text-secText" size={16} />
                ) : (
                  <FaCopy className="text-textColor" size={16} />
                )}
              </button>

              <button
                onClick={() => redirectToExplorer(embeddedWalletAddress)}
                className="p-2 bg-sec_background border border-border rounded-md hover:bg-opacity-90 flex items-center justify-center"
                title="View on Explorer"
              >
                <FaExternalLinkAlt className="text-textColor" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Embedded Wallet Special Action Buttons */}
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
                ? 'bg-backgroundContrast text-textColorContrast cursor-not-allowed opacity-60'
                : 'bg-sec_background text-secText hover:bg-backgroundContrast hover:text-textColorContrast'
            }`}
          >
            <FaUserFriends size={14} className="flex-shrink-0" />
            <span>Delegate</span>
          </button>
        </div>
      </div>

      {/* External Connected Wallets */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor my-3 text-lg">
          Connected Wallets{' '}
          {externalWallets.length > 0 && (
            <span className="text-sm font-normal bg-sec_background rounded-full px-2 py-0.5 ml-1">
              {externalWallets.length}
            </span>
          )}
        </h1>

        {externalWallets.length > 0 ? (
          <div className="space-y-3">
            {externalWallets.map((wallet) => (
              <div
                key={wallet.address}
                className="border border-border rounded-md p-3 bg-sec_background"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={wallet.meta.icon}
                      alt="wallet"
                      className="w-8 h-8"
                    />
                    <p className="font-medium text-textColor">
                      {wallet.meta.name || 'External Wallet'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-md text-secText overflow-hidden text-ellipsis break-all sm:break-normal">
                    {wallet.address}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="p-1.5 bg-sec_background border border-border rounded-md hover:bg-opacity-80"
                      title="Copy public key"
                    >
                      {copied[wallet.address] ? (
                        <TiTick className="text-secText" size={16} />
                      ) : (
                        <FaCopy className="text-textColor" size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => redirectToExplorer(wallet.address)}
                      className="p-1.5 bg-sec_background border border-border rounded-md hover:bg-opacity-90"
                      title="View on Explorer"
                    >
                      <FaExternalLinkAlt className="text-textColor" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-border rounded-md bg-sec_background/50">
            <p className="text-secText mb-2">No external wallets connected</p>
          </div>
        )}

        {/* Connect New Wallet Button */}
        <div className="mt-4">
          <button
            onClick={handleConnectWallet}
            className="w-full flex items-center justify-center gap-x-2 bg-primary text-white hover:bg-primary/90 rounded-md py-2.5 px-4 text-sm sm:text-base"
          >
            <FaPlus size={14} className="flex-shrink-0" />
            <span>Connect External Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
});

WalletSettings.displayName = 'WalletSettings';
