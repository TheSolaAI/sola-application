'use client';

import { FC } from 'react';
import { TokenAddressResultChatContent } from '@/types/chatItem';
import { LuExternalLink, LuCheck, LuX, LuCopy } from 'react-icons/lu';

interface TokenAddressResultItemProps {
  props: TokenAddressResultChatContent;
}

export const TokenAddressResultItem: FC<TokenAddressResultItemProps> = ({
  props,
}) => {
  const copyToClipboard = () => {
    if (props.tokenAddress) {
      navigator.clipboard.writeText(props.tokenAddress);
      // Could add a toast notification here
    }
  };

  return (
    <div className="flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header */}
        <div
          className={`px-4 py-3 border-b border-border flex justify-between items-center ${
            props.success ? 'bg-primary/10' : 'bg-red-500/10'
          }`}
        >
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            {props.success ? (
              <>
                <LuCheck className="text-green-500" size={18} />
                Token Address Found
              </>
            ) : (
              <>
                <LuX className="text-red-500" size={18} />
                Token Address Not Found
              </>
            )}
          </h2>
          {props.source && (
            <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
              Source: {props.source}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
              Token Symbol
            </label>
            <div className="text-textColor font-medium text-lg">
              {props.symbol}
            </div>
          </div>

          {props.success ? (
            <div className="mb-4">
              <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                Token Address
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-surface/30 px-3 py-2 rounded-lg text-sm font-mono text-textColor overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[calc(100%-60px)]">
                  {props.tokenAddress}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-full hover:bg-surface/50 transition-colors"
                  title="Copy to clipboard"
                >
                  <LuCopy className="text-secText" size={16} />
                </button>
                <a
                  href={`https://solscan.io/token/${props.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-surface/50 transition-colors"
                  title="View on Solscan"
                >
                  <LuExternalLink className="text-secText" size={16} />
                </a>
              </div>
            </div>
          ) : (
            <div className="mb-4 bg-red-500/5 p-3 rounded-lg border border-red-500/20">
              <div className="text-secText text-sm">
                {props.errorMessage ||
                  'Could not find the token address. Please check the token symbol and try again.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer with instructions */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="text-xs text-secText">
            {props.success ? (
              <p>
                You can use this token address with other tools like
                getTokenData, getTopHolders, or getRugCheck.
              </p>
            ) : (
              <p>
                Try using the full token name or a different symbol. Some tokens
                might not be indexed yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
