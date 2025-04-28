'use client';

import { FC } from 'react';
import { TokenDataResponse } from '@/types/response';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { formatNumber } from '@/utils/formatNumber';
import { FiCopy } from 'react-icons/fi';
import { LuTrendingUp, LuTrendingDown, LuExternalLink } from 'react-icons/lu';
import { toast } from 'sonner';
import { FaCoins } from 'react-icons/fa6';
import Image from 'next/image';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { TokenDataDashboard } from '@/app/dashboard/_components/dashboards/tokenDataDashboard/TokenDataDashboard';

interface TokenDataMessageItemProps {
  props: TokenDataResponse;
}

export const TokenDataMessageItem: FC<TokenDataMessageItemProps> = ({
  props,
}) => {
  // Global State
  const { setDashboardLayoutContent, dashboardOpen, handleDashboardOpen } =
    useLayoutContext();
  const { theme } = useThemeManager();

  const openDashboard = () => {
    setDashboardLayoutContent(<TokenDataDashboard tokenData={props} />);
    if (!dashboardOpen) handleDashboardOpen(true);
  };

  const copyToClipboard = () => {
    if (props.address) {
      navigator.clipboard.writeText(props.address);
      toast.success('Address copied to clipboard');
    }
  };

  const isPricePositive = (props.priceChange24hPercent || 0) > 0;
  const priceChangeColor = isPricePositive ? 'green' : 'red';

  // Regular Card View (when dashboard closed)
  const regularView = (
    <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
      {/* Header with address */}
      <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row justify-between gap-2">
        <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
          {props.name || 'Unknown Token'} {props.symbol && `(${props.symbol})`}
        </h2>

        {props.address && (
          <div className="flex items-center">
            <div className="bg-surface/30 px-3 py-1 rounded-lg text-sm font-mono text-textColor overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[240px]">
              {props.address}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
              title="Copy to clipboard"
            >
              <FiCopy className="text-secText" size={14} />
            </button>
            <a
              href={`https://solscan.io/token/${props.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
              title="View on Solscan"
              onClick={(e) => e.stopPropagation()}
            >
              <LuExternalLink className="text-secText" size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-start gap-4 md:w-1/2">
            {props.logoURI && (
              <Image
                src={props.logoURI}
                alt="token"
                className="rounded-xl"
                width={60}
                height={60}
              />
            )}

            <div className="flex-1">
              {/* Price Section */}
              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                  Current Price
                </label>
                <div className="text-textColor font-medium text-2xl">
                  ${Number(props.price).toFixed(7)}
                </div>
              </div>

              {/* Price Change - Prominent Display */}
              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                  24h Change
                </label>
                <div
                  className={`flex items-center text-lg font-medium`}
                  style={{ color: priceChangeColor }}
                >
                  {isPricePositive ? (
                    <LuTrendingUp size={24} className="mr-2" />
                  ) : (
                    <LuTrendingDown size={24} className="mr-2" />
                  )}
                  <span>
                    {isPricePositive ? '+' : ''}
                    {Number(props.priceChange24hPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Data Section - Side by side on larger screens */}
          <div className="md:w-1/2">
            <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
              Market Data
            </label>
            <div className="text-secText text-sm bg-surface/30 p-3 rounded-lg h-full">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-secText uppercase">
                    Market Cap
                  </div>
                  <div className="text-textColor">
                    ${formatNumber(Number(props.marketCap)) || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secText uppercase">
                    24h Volume
                  </div>
                  <div className="text-textColor">
                    $
                    {formatNumber(
                      Number(props.vBuy24hUSD + props.vSell24hUSD)
                    ) || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secText uppercase">
                    Buy Volume
                  </div>
                  <div className="text-textColor">
                    ${formatNumber(Number(props.vBuy24hUSD)) || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secText uppercase">
                    Sell Volume
                  </div>
                  <div className="text-textColor">
                    ${formatNumber(Number(props.vSell24hUSD)) || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Links Footer */}
      <div className="px-4 py-3 bg-surface/20 border-t border-border">
        <div className="flex flex-row gap-x-2 flex-wrap">
          <Pill
            text="DexScreener"
            color={theme.sec_background}
            textColor={theme.secText}
            icon={<FaCoins size={20} />}
            hoverable={true}
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://dexscreener.com/solana/${props.address}`,
                '_blank'
              );
            }}
          />
          <Pill
            text="View Dashboard"
            color={theme.sec_background}
            textColor={theme.secText}
            icon={<LuExternalLink size={20} />}
            hoverable={true}
            onClick={openDashboard}
          />
        </div>
      </div>
    </div>
  );

  // Compact Card View (when dashboard is open)
  const compactView = (
    <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
      {/* Compact Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {props.logoURI && (
            <Image
              src={props.logoURI}
              alt="token"
              className="rounded-lg"
              width={24}
              height={24}
            />
          )}
          <h3 className="font-medium text-textColor text-sm">
            {props.symbol || props.name?.slice(0, 8) || 'Unknown'}
          </h3>
        </div>

        {/* Price + Change in one line */}
        <div className="flex items-center gap-2">
          <span className="text-textColor text-sm font-medium">
            ${Number(props.price).toFixed(4)}
          </span>
          <span
            className="text-xs font-medium flex items-center"
            style={{ color: priceChangeColor }}
          >
            {isPricePositive ? (
              <LuTrendingUp size={12} className="mr-1" />
            ) : (
              <LuTrendingDown size={12} className="mr-1" />
            )}
            {Number(props.priceChange24hPercent).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="p-2 bg-surface/20 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="p-1 rounded-full hover:bg-surface/50 transition-colors"
            title="Copy address"
          >
            <FiCopy className="text-secText" size={12} />
          </button>
          <a
            href={`https://solscan.io/token/${props.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full hover:bg-surface/50 transition-colors"
            title="View on Solscan"
            onClick={(e) => e.stopPropagation()}
          >
            <LuExternalLink className="text-secText" size={12} />
          </a>
        </div>

        <div>
          <span className="text-xs text-secText">
            Vol: $
            {formatNumber(Number(props.vBuy24hUSD + props.vSell24hUSD), 1) ||
              'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex my-1 justify-start w-full transition-opacity duration-500"
      onClick={openDashboard}
    >
      {dashboardOpen ? compactView : regularView}
    </div>
  );
};
