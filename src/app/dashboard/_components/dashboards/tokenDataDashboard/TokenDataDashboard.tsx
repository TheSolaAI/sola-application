'use client';

import { FC, useEffect } from 'react';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { TokenSummaryCard } from './TokenSummaryCard';
import { TokenChartCard } from './TokenChartCard';
import { TokenMetricsCard } from './TokenMetricsCard';
import { TokenDataResponse } from '@/types/response';

interface TokenDataDashboardProps {
  tokenData: TokenDataResponse;
}

export const TokenDataDashboard: FC<TokenDataDashboardProps> = ({
  tokenData,
}) => {
  /**
   * Global States
   */
  const { setDashboardTitle } = useLayoutContext();

  useEffect(() => {
    setDashboardTitle('Token Data');
    console.log('Token Data:', tokenData);
  });

  return (
    <>
      {tokenData === undefined ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <p className="text-secText text-sm font-medium">
            No token data available
          </p>
          <p className="text-secText text-xs font-medium">
            Please try again later
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full gap-y-4">
          <TokenSummaryCard
            address={tokenData.address}
            logoURI={tokenData.logoURI}
            price={tokenData.price}
            symbol={tokenData.symbol}
            extensions={tokenData.extensions}
            priceChange24hPercent={tokenData.priceChange24hPercent}
            name={tokenData.name}
          />
          <TokenChartCard address={tokenData.address} />
          <TokenMetricsCard
            fdv={tokenData.fdv}
            holder={tokenData.holder}
            tokenSymbol={tokenData.symbol}
            liquidity={tokenData.liquidity}
            marketCap={tokenData.marketCap}
            buy30m={tokenData.buy30m}
            buy1h={tokenData.buy1h}
            buy4h={tokenData.buy4h}
            buy24h={tokenData.buy24h}
            priceChange30mPercent={tokenData.priceChange30mPercent}
            priceChange1hPercent={tokenData.priceChange1hPercent}
            priceChange4hPercent={tokenData.priceChange4hPercent}
            priceChange24hPercent={tokenData.priceChange24hPercent}
            sell30m={tokenData.sell30m}
            sell1h={tokenData.sell1h}
            sell4h={tokenData.sell4h}
            sell24h={tokenData.sell24h}
            uniqueWallet30m={tokenData.uniqueWallet30m}
            uniqueWallet1h={tokenData.uniqueWallet1h}
            uniqueWallet4h={tokenData.uniqueWallet4h}
            uniqueWallet24h={tokenData.uniqueWallet24h}
            vBuy30mUSD={tokenData.vBuy30mUSD}
            vBuy1hUSD={tokenData.vBuy1hUSD}
            vBuy4hUSD={tokenData.vBuy4hUSD}
            vBuy24hUSD={tokenData.vBuy24hUSD}
            vSell30mUSD={tokenData.vSell30mUSD}
            vSell1hUSD={tokenData.vSell1hUSD}
            vSell4hUSD={tokenData.vSell4hUSD}
            vSell24hUSD={tokenData.vSell24hUSD}
          />
        </div>
      )}
    </>
  );
};
