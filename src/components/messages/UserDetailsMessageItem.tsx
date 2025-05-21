'use client';

import { FC } from 'react';
import { LuExternalLink, LuCopy, LuChevronUp, LuWallet } from 'react-icons/lu';
import { toast } from 'sonner';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface UserDetailsProps {
  userInfo: {
    activeSelectedWallet: string;
    availableWallets: string[];
  };
}

interface UserDetailsMessageItemProps {
  props: UserDetailsProps;
}

export const UserDetailsMessageItem: FC<UserDetailsMessageItemProps> = ({
  props,
}) => {
  const { activeSelectedWallet, availableWallets } = props.userInfo;

  const copyToClipboard = (text: string, itemName: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success(`${itemName} copied to clipboard!`);
    }
  };

  // Abbreviate wallet address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Compact content
  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium">Active Wallet</span>
      <div className="hidden sm:block text-xs text-secText font-mono truncate max-w-[150px]">
        {getAbbreviatedAddress(activeSelectedWallet)}
      </div>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <>
      <div className="flex items-center gap-1">
        <a
          href={`https://solscan.io/account/${activeSelectedWallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          title="View on Solscan"
          onClick={(e) => e.stopPropagation()}
        >
          <LuExternalLink className="text-secText" size={12} />
        </a>
      </div>

      <div>
        <span className="text-xs text-secText">Wallet Details</span>
      </div>
    </>
  );

  // Expanded content
  const expandedContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h2 className="text-base font-semibold text-textColor flex items-center gap-2">
          <>
            <div className="bg-surface/30 p-1 rounded-lg">
              <LuWallet className="text-blue-400" size={16} />
            </div>
            Wallet Information
          </>
        </h2>
        <div className="flex items-center gap-2">
          <LuChevronUp className="text-secText" size={16} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col gap-4 w-full">
          {/* Active wallet section */}
          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Active Wallet</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-textColor text-lg font-bold font-mono break-all pr-2">
                {activeSelectedWallet}
              </p>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(activeSelectedWallet, 'Wallet address');
                  }}
                  className="p-1 rounded-full hover:bg-surface/50"
                >
                  <LuCopy size={14} className="text-secText" />
                </button>
                <a
                  href={`https://solscan.io/account/${activeSelectedWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-surface/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LuExternalLink size={14} className="text-secText" />
                </a>
              </div>
            </div>
          </div>

          {/* Available wallets section */}
          <div className="mt-2">
            <p className="text-secText text-sm mb-2">
              Available Wallets ({availableWallets.length})
            </p>
            <div className="flex flex-col gap-2">
              {availableWallets.map((wallet, index) => (
                <div
                  key={index}
                  className={`bg-surface/30 p-2 rounded-lg flex items-center justify-between ${
                    wallet === activeSelectedWallet
                      ? 'border-l-4 border-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-1 rounded-full mr-2">
                      <LuWallet size={12} className="text-primary" />
                    </div>
                    <span className="text-xs font-mono text-textColor mr-1">
                      {wallet}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(wallet, 'Wallet address');
                      }}
                      className="p-1 rounded-full hover:bg-surface/50"
                    >
                      <LuCopy size={12} className="text-secText" />
                    </button>
                    <a
                      href={`https://solscan.io/account/${wallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full hover:bg-surface/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LuExternalLink size={12} className="text-secText" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with wallet info and actions */}
      <div className="px-4 py-3 bg-surface/20 border-t border-border">
        <div className="text-xs text-secText">
          <p>
            {`${availableWallets.length} connected wallet${availableWallets.length > 1 ? 's' : ''} available for this account.`}
          </p>
        </div>
        <button
          className="mt-2 w-full bg-primary/80 hover:bg-primary text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(activeSelectedWallet, 'Active wallet address');
          }}
        >
          <LuWallet size={16} />
          Copy Active Wallet Address
        </button>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title="Wallet Details"
      icon={<LuWallet className="text-blue-400" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
    />
  );
};
