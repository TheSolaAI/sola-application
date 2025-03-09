/**
 * This component displays a list of Liquid Staking Token (LST) data cards,
 * showing their symbol, APY (Annual Percentage Yield), and logo.
 *
 * Dependencies:
 * - `ShowLSTDataChatContent`: Type definition for LST chat content.
 * - `BaseGridChatItem`: A wrapper for arranging the LST cards in a grid format.
 *
 * Usage:
 * ```tsx
 * <ShowLSTDataChatItem
 *   props={{
 *     data: [
 *       { symbol: "stSOL", apy: 6.75, logo_uri: "https://example.com/stsol.png" },
 *       { symbol: "mSOL", apy: 7.2, logo_uri: "https://example.com/msol.png" }
 *     ]
 *   }}
 * />
 * ```
 */
import { FC } from 'react';
import { ShowLSTDataChatContent } from '../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';

interface ShowLSTDataChatItemProps {
  props: ShowLSTDataChatContent;
}

export const ShowLSTDataChatItem: FC<ShowLSTDataChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridChatItem col={3}>
      {props.data.map((sanctumCard, index) => (
        <div
          key={sanctumCard.symbol || index}
          className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-fit transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <img
              src={sanctumCard.logo_uri}
              alt="sanctumimage"
              className="h-16 rounded-lg"
            />
            <div>
              <p className="text-base font-medium">{sanctumCard.symbol}</p>
              <p className="text-sm font-small">
                APY : {sanctumCard.apy.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </BaseGridChatItem>
  );
};
