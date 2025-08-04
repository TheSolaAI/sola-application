'use client';
import { FC } from 'react';
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
        Larger bubbles represent wallets with higher token concentrations.
        Connected bubbles indicate transaction relationships.
      </p>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="Token Ownership Map"
      subtitle={shortenedAddress}
      footer={footer}
    >
      <div className="relative">
        <iframe
          src={`https://iframe.bubblemaps.io/map?address=${tokenAddress}&chain=solana&partnerId=TZJrbZ0wWGkrKquXkTq4`}
          className="w-full min-h-94 rounded-lg"
          title="Token Bubblemap Visualization"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </BaseBorderedMessageItem>
  );
};
