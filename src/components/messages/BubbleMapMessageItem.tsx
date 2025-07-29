'use client';

import { FC } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';

interface BubbleMapMessageItemProps {
  props: { token: string };
}

export const BubbleMapMessageItem: FC<BubbleMapMessageItemProps> = ({
  props,
}) => {
  if (!props || !props.token) {
    return null;
  }
  const tokenAddress = props.token;
  const shortenedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  const footer = (
    <div className="text-xs text-secText">
      <p>
        This Bubblemap shows the token ownership structure. Larger bubbles
        represent wallets with higher token concentrations. Connected bubbles
        indicate transaction relationships.
      </p>
    </div>
  );

  const subtitle = (
    <a
      href={`https://solscan.io/token/${tokenAddress}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-sm text-secText hover:text-primary transition-colors"
    >
      <span className="font-mono mr-1">{shortenedAddress}</span>
      <LuExternalLink className="h-3.5 w-3.5" />
    </a>
  );

  return (
    <BaseBorderedMessageItem
      title="Token Ownership Map"
      subtitle={shortenedAddress}
      footer={footer}
    >
      {/* Bubblemap iframe using secure proxy */}
      <div className="relative">
        <iframe
          src={`/api/bubblemaps?address=${tokenAddress}&chain=solana&limit=80`}
          className="w-full min-h-94 rounded-lg"
          title="Token Bubblemap Visualization"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </BaseBorderedMessageItem>
  );
};
