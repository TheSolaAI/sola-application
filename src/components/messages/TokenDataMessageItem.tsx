/**
 * This component displays token-related data, including price, price change,
 * market cap, and 24-hour volume. It also provides a button to view the token
 * on Dexscreener.
 */
import { FC } from 'react';
import { ChatItemProps, TokenDataChatContent } from '@/types/chatItem';
import BaseGridChatItem from '@/components/messages/general/BaseGridChatItem';
import { LuExternalLink } from 'react-icons/lu';
import { formatNumber } from '@/utils/formatNumber';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { TokenDataDashboard } from '@/app/dashboard/_components/dashboards/tokenDataDashboard/TokenDataDashboard';
import Image from 'next/image';

export const TokenDataMessageItem: FC<ChatItemProps<TokenDataChatContent>> = ({
  props,
}) => {
  const { data } = props;

  /**
   * Global State
   */
  const { setDashboardLayoutContent, dashboardOpen, handleDashboardOpen } =
    useLayoutContext();

  return (
    <BaseGridChatItem col={2}>
      <div
        className="relative inline-flex overflow-hidden rounded-lg p-[1px]"
        // On click set the dashboard content and open the dashboard
        onClick={() => {
          setDashboardLayoutContent(<TokenDataDashboard tokenData={props} />);
          if (!dashboardOpen) handleDashboardOpen(true);
        }}
      >
        {/* Animated border */}
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />

        {/* Main content */}
        <div className="relative p-2 w-full rounded-lg bg-sec_background overflow-x-auto text-secText cursor-pointer hover:bg-background">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <Image
                src={data.logoURI}
                alt="coin logo"
                height={40}
                width={40}
                className="rounded-lg"
              />
              <div>
                <h3 className="truncate text-sm font-medium">
                  {data.name || 'Unknown'}
                </h3>
                <p className="mt-1 text-xs font-medium">
                  ${Number(data.price).toFixed(7)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    Number(data.priceChange24hPercent) > 0
                      ? 'text-green-500'
                      : Number(data.priceChange24hPercent) < 0
                        ? 'text-red-500'
                        : 'text-bodydark2'
                  }`}
                >
                  {Number(data.priceChange24hPercent).toFixed(2) || 'Unknown'}%
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://dexscreener.com/solana/${data.address}`,
                  '_blank'
                );
              }}
              className="p-1 rounded-lg bg-sec_background hover:opacity-80 transition"
            >
              <LuExternalLink className="w-4 h-4 text-primaryDark" />
            </button>
          </div>

          <div className="flex flex-row gap-2 text-sm mt-2">
            {[
              { label: 'MC', value: data.marketCap },
              {
                label: '24H_Vol',
                value: data.vBuy24hUSD + data.vSell24hUSD,
              },
            ].map(({ label, value }, i) => (
              <p key={i}>
                {label}: ${formatNumber(Number(value)) || 'Unknown'}
              </p>
            ))}
          </div>
        </div>
      </div>
    </BaseGridChatItem>
  );
};
