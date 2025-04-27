'use client';

import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getTopHoldersHandler } from '@/lib/solana/topHolders';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { TokenSummaryCard } from './TokenSummaryCard';
import { TokenChartCard } from './TokenChartCard';
import { TokenMetricsCard } from './TokenMetricsCard';
import { TokenDataResponse } from '@/types/response';
import { useUserHandler } from '@/store/UserHandler';

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

  /**
   * Local State
   */
  const [agentDetails, setAgentDetails] = useState<unknown | null>(null);

  // Combined fetch for agent details, top holders, and token analysis
  // useEffect(() => {
  //   setAgentDetails(tokenData);
  //   setDashboardTitle('Token Data Dashboard');

  //   // If we have an address but no top holders, fetch them
  //   if (tokenData.address) {
  //     getTopHoldersHandler(
  //       tokenData.address,
  //       useUserHandler.getState().authToken || ''
  //     )
  //       .then((topHolders) => {
  //         if (topHolders && topHolders.length > 0) {
  //           setAgentDetails((prev: unknown) => {
  //             if (!prev) return null;
  //             return {
  //               ...prev,
  //               data: {
  //                 ...prev.data,
  //                 topHolders: topHolders,
  //               },
  //             };
  //           });
  //         } else {
  //           toast.error('No top holders found');
  //         }
  //       })
  //       .catch(() => {
  //         toast.error('Error getting top holders');
  //       });
  //   }
  // }, [tokenData]);

  return (
    <>
      <TokenSummaryCard
        address={tokenData.address}
        logoURI={tokenData.logoURI}
        price={tokenData.price}
        symbol={tokenData.symbol}
        extensions={tokenData.extensions}
        priceChange24hPercent={tokenData.priceChange24hPercent}
        name={tokenData.name}
      />
      <div className="bg-baseBackground rounded-xl w-full flex flex-col p-2 gap-y-2 mt-2">
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
    </>
  );
};
