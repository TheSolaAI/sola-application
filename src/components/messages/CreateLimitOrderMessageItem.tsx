'use client';

import { FC } from 'react';
import { LuTrendingUp, LuExternalLink } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface LimitOrderData {
  transaction: string;
  amount: number;
  input_mint: string;
  output_mint: string;
  limit_price: number;
  action: string; // 'buy' or 'sell'
  priority_fee_needed: boolean;
  params_order: any; // Additional parameters for the order
  details?: {
    tickers?: {
      inputTokenTicker?: string;
      outputTokenTicker?: string;
    };
  };
}

interface CreateLimitOrderMessageItemProps {
  props: LimitOrderData;
}

export const CreateLimitOrderMessageItem: FC<
  CreateLimitOrderMessageItemProps
> = ({ props }) => {
  // Format token names for better display
  const getTokenDisplay = (mintAddress: string) => {
    if (!mintAddress) return 'Unknown';
    if (mintAddress.startsWith('$')) {
      return mintAddress.substring(1); // Remove $ prefix for symbols
    }
    // For addresses, show abbreviated version
    return mintAddress.length > 12
      ? `${mintAddress.substring(0, 6)}...${mintAddress.substring(mintAddress.length - 4)}`
      : mintAddress;
  };

  // Get token names without $ if they exist
  const inputToken = props.details?.tickers?.inputTokenTicker
    ? props.details.tickers.inputTokenTicker
    : getTokenDisplay(props.input_mint);
  const outputToken = props.details?.tickers?.outputTokenTicker
    ? props.details.tickers.outputTokenTicker
    : getTokenDisplay(props.output_mint);

  // Determine action text
  const actionText = props.action === 'buy' ? 'Buy' : 'Sell';

  // Compact content
  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium">
        {actionText} {props.amount} {inputToken} @ {props.limit_price}{' '}
        {outputToken}
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <>
      <div className="flex items-center gap-1">
        <a
          href={`https://solscan.io`}
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
          {props.priority_fee_needed
            ? 'Priority Fee Required'
            : 'No Priority Fee'}
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
            <LuTrendingUp className="text-primary" size={28} />
          </div>
          Limit Order
        </h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Order Type</p>
                <div className="flex items-center mt-1">
                  <p className="text-textColor text-lg font-bold">
                    {actionText} Limit Order
                  </p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Amount</p>
                <div className="flex items-center mt-1">
                  <p className="text-textColor text-lg font-bold">
                    {props.amount} {inputToken}
                  </p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Limit Price</p>
                <p className="text-textColor text-lg font-bold">
                  {props.limit_price} {outputToken}
                </p>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Priority Fee</p>
                <p className="text-textColor text-lg font-bold">
                  {props.priority_fee_needed ? 'Required' : 'Not Required'}
                </p>
              </div>
            </div>

            {/* Token Addresses */}
            <div className="flex flex-col gap-2">
              <div className="bg-surface/30 p-2 rounded-lg flex items-center justify-between">
                <span className="text-xs text-secText">Input Token:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-textColor mr-1">
                    {props.input_mint}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(props.input_mint);
                      toast.success('Copied to clipboard');
                    }}
                    className="p-1 rounded-full hover:bg-surface/50"
                  >
                    <FiCopy size={12} className="text-secText" />
                  </button>
                </div>
              </div>
              <div className="bg-surface/30 p-2 rounded-lg flex items-center justify-between">
                <span className="text-xs text-secText">Output Token:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-textColor mr-1">
                    {props.output_mint}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(props.output_mint);
                      toast.success('Copied to clipboard');
                    }}
                    className="p-1 rounded-full hover:bg-surface/50"
                  >
                    <FiCopy size={12} className="text-secText" />
                  </button>
                </div>
              </div>
              <div className="bg-surface/30 p-2 rounded-lg flex items-center justify-between">
                <span className="text-xs text-secText">Transaction ID:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-textColor mr-1">
                    {props.transaction.length > 20
                      ? `${props.transaction.substring(0, 10)}...${props.transaction.substring(props.transaction.length - 10)}`
                      : props.transaction}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(props.transaction);
                      toast.success('Copied to clipboard');
                    }}
                    className="p-1 rounded-full hover:bg-surface/50"
                  >
                    <FiCopy size={12} className="text-secText" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with transaction action button */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs text-secText">
            <p>
              This limit order will execute when the market price reaches your
              specified limit price.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title="Limit Order"
      icon={<LuTrendingUp className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
