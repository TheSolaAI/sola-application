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

export const NFTCollectionChatItem: FC<NFTCollectionChatItemProps> = ({ props }) => {
  return (
    <BaseMonoGridChatItem>
      <img
        src={props.data.image}
        alt={props.data.title}
        className="h-20 w-20 rounded-lg"
      />
      <h3 className=" hidden md:block md:text-large font-semibold">
        {props.data.title || 'Unknown'}
      </h3>
      <p className={`mt-1 text-small`}>◎ {props.data.price}</p>
      <p className="text-small">Listed: {props.data.listed || 'Unknown'}</p>
    </BaseMonoGridChatItem>
  );
};
