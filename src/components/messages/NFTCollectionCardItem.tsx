/**
 * This component displays basic details of an NFT collection, including its
 * image, title, price, and the number of listed items.
 *
 * Dependencies:
 * - `NFTCollectionChatContent`: Type definition for NFT collection chat content.
 * - `BaseMonoGridChatItem`: A wrapper component for consistent chat item styling.
 *
 * Usage:
 * ```tsx
 * <NFTCollectionChatItem
 *   props={{
 *     data: {
 *       image: "https://example.com/nft.png",
 *       title: "Cool NFT Collection",
 *       price: 2.5,
 *       listed: 150,
 *     }
 *   }}
 * />
 * ```
 */

'use client';

import { FC } from 'react';
import { NFTCollectionChatContent } from '@/types/chatItem';
import BaseGridChatItem from '@/components/messages/general/BaseGridChatItem';
import { formatNumber } from '@/utils/formatNumber';

interface NFTCollectionChatItemProps {
  props: NFTCollectionChatContent;
}

export const NFTCollectionMessageItem: FC<NFTCollectionChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridChatItem col={2}>
      <div
        key={props.data.symbol}
        className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <img
            src={props.data.image}
            alt={props.data.symbol}
            className="h-16 w-16 object-cover rounded-lg"
          />
          <div>
            <p className="text-base font-medium">{props.data.symbol}</p>
            <p className="text-base font-medium">
              Floor: {props.data.floor_price}
            </p>
            <p className="text-sm font-small">
              Listed: {props.data.listed_count}
            </p>
            <p className="text-sm font-small">
              Avg Floor (24hr):
              {formatNumber(props.data.avg_price_24hr / 10 ** 9)}
            </p>
            <p className="text-sm font-small">
              Total Volume: {formatNumber(props.data.volume_all / 10 ** 9)}
            </p>
          </div>
        </div>
      </div>
    </BaseGridChatItem>
  );
};
