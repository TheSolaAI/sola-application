/**
 * This component displays the details of top 5 Xstocks, including its
 * image, title, price, and the number of listed items.
 */
'use client';

import { FC } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { BaseGridMessageItem } from '@/components/messages/base/BaseGridMessageItem';
import { TopXstocks } from '@/types/xstocks';

interface GetTopXStocksChatItemProps {
  props: TopXstocks;
}

export const TopXStocksMessageItem: FC<GetTopXStocksChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridMessageItem col={2}>
      {props.data.map((xstock, index: number) => (
        <div
          key={xstock.name || index}
          className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <img
              src={xstock.image}
              alt={xstock.name}
              className="h-16 w-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-base font-medium">{xstock.name}</p>
              <p className="text-base font-medium">
                Price: {formatNumber(xstock.price)}
              </p>
              <p className="text-sm font-small">
                MC: {formatNumber(xstock.market_cap)}
              </p>
              <p className="text-sm font-small">
                Volume (24hr): {formatNumber(xstock.volume_24hr / 10 ** 9)}
              </p>
              <p className="text-sm font-small">
                Price Change: {formatNumber(xstock.price_change_24hr)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </BaseGridMessageItem>
  );
};
