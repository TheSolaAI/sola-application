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
import { FC } from 'react';
import { NFTCollectionChatContent } from '../../../types/chatItem.ts';
import BaseMonoGridChatItem from './general/BaseMonoGridChatItem.tsx';

interface NFTCollectionChatItemProps {
  props: NFTCollectionChatContent;
}

export const NFTCollectionMessageItem: FC<NFTCollectionChatItemProps> = ({
  props,
}) => {
  return (
    <BaseMonoGridChatItem>
      <img
        src={props.data.image}
        alt={props.data.symbol}
        className="h-16 w-16 rounded-lg"
      />
      <p className={`mt-1 text-small`}>Floor: ◎ {props.data.floor_price}</p>
      <p className="text-sm">
        Listed: {props.data.listed_count || 'Unknown'}
      </p>
      <p className="text-sm font-thin">
        Sales (24hr): {props.data.avg_price_24hr || 'Unknown'}
      </p>
      <p className="text-sm font-thin">
        Total Vol: {(props.data.volume_all / 10 ** 9).toFixed(2) || 'Unknown'}
      </p>
    </BaseMonoGridChatItem>
  );
};
