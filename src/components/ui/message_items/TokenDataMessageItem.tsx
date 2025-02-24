/**
 * This component displays token-related data, including price, price change,
 * market cap, and 24-hour volume. It also provides a button to view the token
 * on Dexscreener.
 *
 * Dependencies:
 * - `ChatItemProps<TokenDataChatContent>`: Type definition for chat item props.
 * - `BaseGridChatItem`: A wrapper component for grid-based chat item layout.
 * - `ExternalLink`: Icon from `lucide-react` for external links.
 * - `formatNumber`: Utility function for formatting large numbers.
 *
 * Usage:
 * ```tsx
 * <TokenDataMessageItem
 *   props={{
 *     data: {
 *       metadata: { name: "SOL" },
 *       price: 120.45,
 *       priceChange: -2.5,
 *       marketCap: 500000000,
 *       volume: 12000000,
 *       address: "SOL_TOKEN_ADDRESS"
 *     }
 *   }}
 * />
 * ```
 */

import { FC } from 'react';
import {
  ChatItemProps,
  TokenDataChatContent,
} from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';
import { ExternalLink } from 'lucide-react';
import { formatNumber } from '../../../utils/formatNumber.ts';
import { useDashboardHandler } from '../../../models/DashboardHandler.ts';

export const TokenDataMessageItem: FC<ChatItemProps<TokenDataChatContent>> = ({
  props,
}) => {
  const { openDashboard } = useDashboardHandler();
  console.log(props.data);
  return (
    <div
    onClick={() => {
      openDashboard('tokenData', props.data.address,props);
    }}
    >
      <BaseGridChatItem col={2}>
        <div className="p-2 rounded-lg bg-sec_background overflow-x-auto text-secText">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <img
                src={props.data.logoURI}
                alt={'coin logo'}
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <h3 className="truncate text-sm font-medium">
                  {props.data.name || 'Unknown'}
                </h3>
                <p className="mt-1 text-xs font-medium">
                  ${Number(Number(props.data.price).toFixed(7))}
                </p>
                <p
                  className={`text-xs font-medium ${
                    Number(props.data.priceChange24hPercent) > 0
                      ? 'text-green-500'
                      : Number(props.data.priceChange24hPercent) < 0
                        ? 'text-red-500'
                        : 'text-bodydark2'
                  }`}
                >
                  {Number(Number(props.data.priceChange24hPercent).toFixed(2)) ||
                    'Unknown'}
                  %
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                window.open(
                  `https://dexscreener.com/solana/${props.data.address}`,
                  '_blank',
                )
              }
              className="p-1 rounded-lg bg-sec_background hover:opacity-80 transition"
            >
              <ExternalLink className="w-4 h-4 text-primaryDark" />
            </button>
          </div>

          <div className="flex flex-row gap-2 text-sm mt-2">
            {[
              { label: 'MC', value: props.data.marketCap },
              {
                label: '24H_Vol',
                value: props.data.vBuy24hUSD + props.data.vSell24hUSD,
              },
            ].map(({ label, value }, i) => (
              <p key={i}>
                {label}: ${formatNumber(Number(value)) || 'Unknown'}
              </p>
            ))}
          </div>
        </div>
      </BaseGridChatItem>
    </div>
  );
};
