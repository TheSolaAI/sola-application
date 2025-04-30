'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { LuArrowRightLeft, LuExternalLink } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { TokenSwapData } from '@/types/token';
import { toast } from 'sonner';

interface SwapTokenMessageItem {
  props: TokenSwapData;
}

export const SwapTokenMessageItem: FC<SwapTokenMessageItem> = ({ props }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Get height of expanded content when it changes
  useEffect(() => {
    if (expandedContentRef.current) {
      setContentHeight(expandedContentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match this with the CSS transition duration
  };

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
    : getTokenDisplay(props.details.input_mint);
  const outputToken = props.details?.tickers?.outputTokenTicker
    ? props.details.tickers.outputTokenTicker
    : getTokenDisplay(props.details.output_mint);

  // Compact View (collapsed state)
  const compactView = (
    <div className="w-full overflow-hidden rounded-xl bg-sec_background  shadow-lg">
      {/* Compact Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuArrowRightLeft className="text-primary" size={16} />
          </div>
          <h3 className="font-medium text-textColor text-sm">Token Swap</h3>
        </div>

        {/* Swap Info in one line */}
        <div className="flex items-center gap-2">
          <span className="text-textColor text-sm font-medium">
            {props.details.amount} {inputToken} → {props.details.outAmount}{' '}
            {outputToken}
          </span>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="p-2 bg-surface/20 flex justify-between items-center">
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
            Fee: {props.details.priorityFee.toLocaleString()} SOL
          </span>
        </div>
      </div>
    </div>
  );

  // Expanded content
  const expandedContent = (
    <div ref={expandedContentRef}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
        <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuArrowRightLeft className="text-primary" size={28} />
          </div>
          Token Swap
        </h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">From</p>
                <div className="flex items-center mt-1">
                  <p className="text-textColor text-lg font-bold">
                    {props.details.amount} {inputToken}
                  </p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">To</p>
                <div className="flex items-center mt-1">
                  <p className="text-textColor text-lg font-bold">
                    {props.details.outAmount} {outputToken}
                  </p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Priority Fee</p>
                <p className="text-textColor text-lg font-bold">
                  {props.details.priorityFee.toLocaleString()} SOL
                </p>
              </div>

              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Swap Mode</p>
                <p className="text-textColor text-lg font-bold">
                  {props.details.inputParams?.swap_mode || 'Standard'}
                </p>
              </div>
            </div>

            {/* Token Addresses */}
            <div className="flex flex-col gap-2">
              <div className="bg-surface/30 p-2 rounded-lg flex items-center justify-between">
                <span className="text-xs text-secText">Input Token:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-textColor mr-1">
                    {props.details.input_mint}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(props.details.input_mint);
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
                    {props.details.output_mint}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(props.details.output_mint);
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
              This transaction is being prepared and will be submitted to the
              blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex my-1 justify-start max-w-lg">
      <div
        className="w-full cursor-pointer overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg transition-all duration-300 ease-in-out"
        onClick={toggleExpand}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '80px', // Adjust based on your compact view height
          opacity: isAnimating ? (isExpanded ? 1 : 0.9) : 1,
          transform: isAnimating
            ? isExpanded
              ? 'scale(1)'
              : 'scale(0.99)'
            : 'scale(1)',
        }}
      >
        {isExpanded ? expandedContent : compactView}
      </div>
    </div>
  );
};
