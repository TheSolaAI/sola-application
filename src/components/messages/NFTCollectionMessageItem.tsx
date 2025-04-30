/**
 * This component displays basic details of an NFT collection, including its
 * image, title, price, and the number of listed items.
 */
'use client';

import { FC } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { NFTCollection } from '@/types/nft';
import { BaseGridMessageItem } from './base/BaseGridMessageItem';

interface NFTCollectionMessageItemProps {
  props: NFTCollection;
}

export const NFTCollectionMessageItem: FC<NFTCollectionMessageItemProps> = ({
  props,
}) => {
  return (
    <BaseGridMessageItem col={2}>
      <div
        key={props.symbol}
        className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <img
            src={props.image}
            alt={props.symbol}
            className="h-16 w-16 object-cover rounded-lg"
          />
          <div>
            <p className="text-base font-medium">{props.symbol}</p>
            <p className="text-base font-medium">Floor: {props.floor_price}</p>
            <p className="text-sm font-small">Listed: {props.listed_count}</p>
            <p className="text-sm font-small">
              Avg Floor (24hr):
              {formatNumber(props.avg_price_24hr / 10 ** 9)}
            </p>
            <p className="text-sm font-small">
              Total Volume: {formatNumber(props.volume_all / 10 ** 9)}
            </p>
          </div>
        </div>
      </div>
    </BaseGridMessageItem>
  );
};
