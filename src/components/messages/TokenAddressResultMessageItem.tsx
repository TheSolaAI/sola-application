'use client';

import { FC } from 'react';
import { TokenAddressResult } from '@/types/token';
import {
  LuExternalLink,
  LuCoins,
  LuCopy,
  LuChevronDown,
  LuChevronUp,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface TokenAddressResultMessageItemProps {
  props: TokenAddressResult;
}

export const TokenAddressResultMessageItem: FC<
  TokenAddressResultMessageItemProps
> = ({ props }) => {
  const copyToClipboard = () => {
    if (props.tokenAddress) {
      navigator.clipboard.writeText(props.tokenAddress);
      toast.success('Token address copied to clipboard!');
    }
  };

  // Compact content
  const compactContent = (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block text-xs text-secText font-mono truncate max-w-[150px]">
        {props.tokenAddress}
      </div>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <>
      <div>
        <span className="text-xs text-secText">
          {props.source ? `Source: ${props.source}` : 'Token Address'}
        </span>
      </div>

      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
          className="p-1 rounded-full hover:bg-surface/50"
        >
          <LuCopy size={12} className="text-secText" />
        </button>
        <a
          href={`https://solscan.io/token/${props.tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-full hover:bg-surface/50"
          onClick={(e) => e.stopPropagation()}
        >
          <LuExternalLink size={12} className="text-secText" />
        </a>
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
              <LuCoins className="text-orange-400" size={16} />
            </div>
            Token Address Found
          </>
        </h2>
        <div className="flex items-center gap-2">
          {props.source && (
            <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
              Source: {props.source}
            </span>
          )}
          <LuChevronUp className="text-secText" size={16} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Token Symbol</p>
              <p className="text-textColor text-lg font-bold">{props.symbol}</p>
            </div>

            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Network</p>
              <p className="text-textColor text-lg font-bold">Solana</p>
            </div>
          </div>

          <div className="bg-surface/30 p-2 rounded-lg flex items-center justify-between">
            <span className="text-xs text-secText">Token Address:</span>
            <div className="flex items-center">
              <span className="text-xs font-mono text-textColor mr-1">
                {props.tokenAddress}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                className="p-1 rounded-full hover:bg-surface/50"
              >
                <LuCopy size={12} className="text-secText" />
              </button>
              <a
                href={`https://solscan.io/token/${props.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-full hover:bg-surface/50"
                onClick={(e) => e.stopPropagation()}
              >
                <LuExternalLink size={12} className="text-secText" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with instructions */}
      <div className="px-4 py-3 bg-surface/20 border-t border-border">
        <button
          className="mt-2 w-full bg-primary/80 hover:bg-primary text-white px-3 py-2 rounded-md text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
            toast.success('Token address copied to clipboard!');
          }}
        >
          Copy Address
        </button>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title={props.success ? props.symbol : `${props.symbol} Not Found`}
      icon={<LuCoins className="text-orange-400" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      initialExpanded={true}
    />
  );
};
