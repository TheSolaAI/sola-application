'use client';

import { FC } from 'react';
import { BubbleMapChatContent } from '@/types/chatItem';
import { LuExternalLink } from 'react-icons/lu';

interface BubbleMapChatItemProps {
  props: BubbleMapChatContent;
}

export const BubbleMapChatItem: FC<BubbleMapChatItemProps> = ({ props }) => {
  const tokenAddress = props.data.token;
  const shortenedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return (
    <div className="flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-textColor">
            Token Ownership Map
          </h2>
          <a
            href={`https://solscan.io/token/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-secText hover:text-primary transition-colors"
          >
            <span className="font-mono mr-1">{shortenedAddress}</span>
            <LuExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Bubblemap iframe */}
        <div className="relative">
          <iframe
            src={`https://app.bubblemaps.io/sol/token/${props.data.token}`}
            className="w-full min-h-94 rounded-b-lg"
            title="Token Bubblemap Visualization"
          />
        </div>

        {/* Footer with explanation */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="text-xs text-secText">
            <p>
              This Bubblemap shows the token ownership structure. Larger bubbles
              represent wallets with higher token concentrations. Connected
              bubbles indicate transaction relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
