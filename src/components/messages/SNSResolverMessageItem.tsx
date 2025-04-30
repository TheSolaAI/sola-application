'use client';

import { FC } from 'react';
import { LuSearch, LuExternalLink } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface SNSResolverResultData {
  domain: string;
  walletAddress: string;
  source: string;
}

interface SNSResolverMessageItemProps {
  props: SNSResolverResultData;
}

export const SNSResolverMessageItem: FC<SNSResolverMessageItemProps> = ({
  props,
}) => {
  // Abbreviate address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Compact content
  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium">
        {props.domain} → {getAbbreviatedAddress(props.walletAddress)}
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <>
      <div className="flex items-center gap-1">
        <a
          href={`https://solscan.io/account/${props.walletAddress}`}
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
        <span className="text-xs text-secText">Source: {props.source}</span>
      </div>
    </>
  );

  // Expanded content
  const expandedContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
        <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuSearch className="text-primary" size={28} />
          </div>
          SNS Domain Resolution
        </h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Domain</p>
              <div className="flex items-center mt-1">
                <p className="text-textColor text-lg font-bold">
                  {props.domain}
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Source</p>
              <div className="flex items-center mt-1">
                <p className="text-textColor text-lg font-bold">
                  {props.source}
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Status</p>
              <p className="text-textColor text-lg font-bold flex items-center">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                Success
              </p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex flex-col gap-2">
            <div className="bg-surface/30 p-3 rounded-lg">
              <span className="text-xs text-secText">Wallet Address:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-textColor break-all pr-2">
                  {props.walletAddress}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(props.walletAddress);
                    toast.success('Address copied to clipboard');
                  }}
                  className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
                >
                  <FiCopy size={14} className="text-secText" />
                </button>
              </div>
            </div>
          </div>

          {/* Links and actions */}
          <div className="flex gap-2 mt-2">
            <a
              href={`https://solscan.io/account/${props.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View on Solscan
              <LuExternalLink className="ml-1" size={12} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs text-secText">
            <p>Solana domain resolved via {props.source}.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title="SNS Resolver"
      icon={<LuSearch className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
