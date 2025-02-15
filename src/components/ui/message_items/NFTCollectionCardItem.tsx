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
        className="h-20 w-50 rounded-lg"
      />
      <h1 className=" hidden md:block md:text-large font-semibold">
        {props.data.symbol || 'Unknown'}
      </h1>
      <p className={`mt-1 text-small`}>◎ {props.data.floor_price}</p>
      <p className="text-small">Listed: {props.data.listed_count || 'Unknown'}</p>
      <p className="text-small">Sales (24hr): {props.data.avg_price_24hr || 'Unknown'}</p>
      <p className="text-small">Volume (All): {props.data.volume_all/10**9 || 'Unknown'}</p>
    </BaseMonoGridChatItem>
  );
};
