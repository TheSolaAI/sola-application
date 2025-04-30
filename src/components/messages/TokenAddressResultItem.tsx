'use client';

import { TokenAddressResult } from '@/types/token';
import { FC, useState, useRef, useEffect } from 'react';
import {
  LuExternalLink,
  LuCoins,
  LuCopy,
  LuChevronDown,
  LuChevronUp,
} from 'react-icons/lu';
import { toast } from 'sonner';

interface TokenAddressResultItemProps {
  props: TokenAddressResult;
}

export const TokenAddressResultItem: FC<TokenAddressResultItemProps> = ({
  props,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const compactContentRef = useRef<HTMLDivElement>(null);

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

  const copyToClipboard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (props.tokenAddress) {
      navigator.clipboard.writeText(props.tokenAddress);
      // Could add a toast notification here
    }
  };

  // Compact view content
  const compactView = (
    <div ref={compactContentRef}>
      {/* Compact Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-surface/30 p-1 rounded-lg">
            <LuCoins className="text-orange-400" size={16} />
          </div>
          <h3 className="font-medium text-textColor text-sm">
            {props.success ? props.symbol : `${props.symbol} Not Found`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-secText font-mono truncate max-w-[150px]">
            {props.tokenAddress}
          </div>
          <LuChevronDown className="text-secText" size={16} />
        </div>
      </div>

      {/* Compact Footer */}
      <div className="p-2 bg-surface/20 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <a
            href={`https://solscan.io/token/${props.tokenAddress}`}
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
            {props.source ? `Source: ${props.source}` : 'Token Address'}
          </span>
        </div>
      </div>
    </div>
  );

  // Expanded view content
  const expandedView = (
    <div ref={expandedContentRef}>
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
        <div className="text-xs text-secText">
          <p>
            You can use this token address with other tools like getTokenData,
            getTopHolders, or getRugCheck.
          </p>
        </div>
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
    </div>
  );

  const containerClasses = isExpanded
    ? 'flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-all duration-300 ease-in-out'
    : 'flex my-1 justify-start max-w-[100%] md:max-w-[30%] transition-all duration-300 ease-in-out';

  return (
    <div className={containerClasses}>
      <div
        className="w-full overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg cursor-pointer hover:border-primary/30 transition-all duration-300 ease-in-out"
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
        {isExpanded ? expandedView : compactView}
      </div>
    </div>
  );
};
