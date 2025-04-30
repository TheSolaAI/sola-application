'use client';

import { FC } from 'react';
import { LuArrowUpRight, LuExternalLink } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { SOLA_TOKEN_ADDRESS } from '@/config/tokenMapping';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface TransferTokenData {
  transaction: string; // serializedTransaction
  details: {
    senderAddress: string;
    recipientAddress: string;
    tokenMint?: string;
    amount: number;
    transaction?: any; // This seems redundant with the parent transaction
    params?: any;
    tokenTicker?: string;
  };
}

interface TransferTokenMessageItemProps {
  props: TransferTokenData;
}

export const TransferTokenMessageItem: FC<TransferTokenMessageItemProps> = ({
  props,
}) => {
  // Abbreviate address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Get token symbol - default to SOL if not provided
  const getTokenSymbol = () => {
    if (props.details.tokenTicker) {
      return props.details.tokenTicker;
    }
    return 'SOL';
  };

  // Compact content
  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium">
        {props.details.amount} {getTokenSymbol()} →{' '}
        {getAbbreviatedAddress(props.details.recipientAddress)}
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <>
      <div className="flex items-center gap-1">
        <a
          href={`https://solscan.io/account/${props.details.senderAddress}`}
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
        <span className="text-xs text-secText">
          From: {getAbbreviatedAddress(props.details.senderAddress)}
        </span>
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
            <LuArrowUpRight className="text-primary" size={28} />
          </div>
          Token Transfer
        </h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col gap-4 w-full">
          {/* Primary Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Token</p>
              <div className="flex items-center mt-1">
                <p className="text-textColor text-lg font-bold">
                  {getTokenSymbol()}
                </p>
              </div>
              {props.details.tokenTicker && (
                <p className="text-secText text-xs mt-1">
                  {props.details.tokenTicker}
                </p>
              )}
            </div>

            <div className="bg-background rounded-lg p-3">
              <p className="text-secText text-sm">Amount</p>
              <div className="flex items-center mt-1">
                <p className="text-textColor text-lg font-bold">
                  {props.details.amount}
                </p>
              </div>
            </div>
          </div>

          {/* Sender and Recipient */}
          <div className="flex flex-col gap-2">
            <div className="bg-surface/30 p-3 rounded-lg">
              <span className="text-xs text-secText">From:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-textColor break-all pr-2">
                  {props.details.senderAddress}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(props.details.senderAddress);
                    toast.success('Address copied to clipboard');
                  }}
                  className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
                >
                  <FiCopy size={14} className="text-secText" />
                </button>
              </div>
            </div>

            <div className="bg-surface/30 p-3 rounded-lg">
              <span className="text-xs text-secText">To:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-textColor break-all pr-2">
                  {props.details.recipientAddress}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(
                      props.details.recipientAddress
                    );
                    toast.success('Address copied to clipboard');
                  }}
                  className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
                >
                  <FiCopy size={14} className="text-secText" />
                </button>
              </div>
            </div>

            {props.details.tokenMint && (
              <div className="bg-surface/30 p-3 rounded-lg">
                <span className="text-xs text-secText">Token Mint:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono text-textColor break-all pr-2">
                    {props.details.tokenMint}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        props.details.tokenMint || SOLA_TOKEN_ADDRESS
                      );
                      toast.success('Token mint copied to clipboard');
                    }}
                    className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
                  >
                    <FiCopy size={14} className="text-secText" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Links and actions */}
          <div className="flex gap-2 mt-2">
            <a
              href={`https://solscan.io/account/${props.details.senderAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Sender
              <LuExternalLink className="ml-1" size={12} />
            </a>

            <a
              href={`https://solscan.io/account/${props.details.recipientAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View Recipient
              <LuExternalLink className="ml-1" size={12} />
            </a>

            {props.details.tokenMint && (
              <a
                href={`https://solscan.io/token/${props.details.tokenMint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View Token
                <LuExternalLink className="ml-1" size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Footer with transaction action button */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs text-secText">
            <p>
              This transaction is being prepared and will be submitted to the
              blockchain.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title="Token Transfer"
      icon={<LuArrowUpRight className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
