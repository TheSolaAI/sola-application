/**
 * This component displays basic details of an NFT collection, including its
 * image, title, price, and the number of listed items.
 */
'use client';

import { FC } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { BaseGridMessageItem } from '@/components/messages/base/BaseGridMessageItem';
import { GetTrendingNFTSChatContent } from '@/types/chatItem';

interface GetTrendingNFTSChatItemProps {
  props: GetTrendingNFTSChatContent;
}

export const TrendingNFTMessageItem: FC<GetTrendingNFTSChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridMessageItem col={2}>
      {props.data.map((trendingNFTCard, index: number) => (
        <div
          key={trendingNFTCard.name || index}
          className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <img
              src={trendingNFTCard.image}
              alt={trendingNFTCard.name}
              className="h-16 w-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-base font-medium">{trendingNFTCard.name}</p>
              <p className="text-base font-medium">
                Floor: {trendingNFTCard.floor_price}
              </p>
              <p className="text-sm font-small">
                Listed: {trendingNFTCard.listed_count}
              </p>
              <p className="text-sm font-small">
                Volume (24hr):{' '}
                {formatNumber(trendingNFTCard.volume_24hr / 10 ** 9)}
              </p>
              <p className="text-sm font-small">
                Total Volume:{' '}
                {formatNumber(trendingNFTCard.volume_all / 10 ** 9)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </BaseGridMessageItem>
  );
};
