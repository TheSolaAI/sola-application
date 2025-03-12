'use client';

import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TokenDataChatContent } from '@/types/chatItem';
import { RugCheck } from '@/types/data_types';
import { getTopHoldersHandler } from '@/lib/solana/topHolders';
import { getRugCheckHandler } from '@/lib/solana/rugCheck';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { TokenSummaryCard } from './TokenSummaryCard';
import { TokenChartCard } from './TokenChartCard';
import { TokenMetricsCard } from './TokenMetricsCard';

interface TokenDataDashboardProps {
  tokenData: TokenDataChatContent;
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
  const [agentDetails, setAgentDetails] = useState<TokenDataChatContent | null>(
    null
  );
  const [tokenAnalysis, setTokenAnalysis] = useState<RugCheck | null>(null);

  // Combined fetch for agent details, top holders, and token analysis
  useEffect(() => {
    setAgentDetails(tokenData);
    setDashboardTitle('Token Data Dashboard');

    // If we have an address but no top holders, fetch them
    if (tokenData.data?.address && !tokenData.data?.topHolders) {
      getTopHoldersHandler(tokenData.data.address)
        .then((topHolders) => {
          if (topHolders && topHolders.length > 0) {
            setAgentDetails((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                data: {
                  ...prev.data,
                  topHolders: topHolders,
                },
              };
            });
          } else {
            toast.error('No top holders found');
          }
        })
        .catch(() => {
          toast.error('Error getting top holders');
        });
    }

    // Fetch token analysis
    if (tokenData.data?.address) {
      getRugCheckHandler(tokenData.data.address)
        .then((analysis) => {
          if (
            analysis &&
            (analysis.score !== undefined || analysis.message !== undefined)
          ) {
            setTokenAnalysis({
              score: analysis.score,
              message: analysis.message,
            });
          }
        })
        .catch((error) => {
          console.error('Error getting token analysis:', error);
          setTokenAnalysis({
            score: 0,
            message: 'Analysis failed',
          });
          toast.error('Error getting token analysis');
        });
    }
  }, [tokenData]);

  return (
    <>
      <TokenSummaryCard
        address={tokenData.data?.address}
        logoURI={tokenData.data?.logoURI}
        price={tokenData.data?.price}
        symbol={tokenData.data?.symbol}
        extensions={tokenData.data?.extensions}
        priceChange24hPercent={tokenData.data?.priceChange24hPercent}
        name={tokenData.data?.name}
      />
      <div className="bg-baseBackground rounded-xl w-full flex flex-col p-2 gap-y-2 mt-2">
        <TokenChartCard address={tokenData.data?.address} />
        <TokenMetricsCard
          fdv={tokenData.data?.fdv}
          holder={tokenData.data?.holder}
          tokenSymbol={tokenData.data?.symbol}
          liquidity={tokenData.data?.liquidity}
          marketCap={tokenData.data?.marketCap}
          buy30m={tokenData.data?.buy30m}
          buy1h={tokenData.data?.buy1h}
          buy4h={tokenData.data?.buy4h}
          buy24h={tokenData.data?.buy24h}
          priceChange30mPercent={tokenData.data?.priceChange30mPercent}
          priceChange1hPercent={tokenData.data?.priceChange1hPercent}
          priceChange4hPercent={tokenData.data?.priceChange4hPercent}
          priceChange24hPercent={tokenData.data?.priceChange24hPercent}
          sell30m={tokenData.data?.sell30m}
          sell1h={tokenData.data?.sell1h}
          sell4h={tokenData.data?.sell4h}
          sell24h={tokenData.data?.sell24h}
          uniqueWallet30m={tokenData.data?.uniqueWallet30m}
          uniqueWallet1h={tokenData.data?.uniqueWallet1h}
          uniqueWallet4h={tokenData.data?.uniqueWallet4h}
          uniqueWallet24h={tokenData.data?.uniqueWallet24h}
          vBuy30mUSD={tokenData.data?.vBuy30mUSD}
          vBuy1hUSD={tokenData.data?.vBuy1hUSD}
          vBuy4hUSD={tokenData.data?.vBuy4hUSD}
          vBuy24hUSD={tokenData.data?.vBuy24hUSD}
          vSell30mUSD={tokenData.data?.vSell30mUSD}
          vSell1hUSD={tokenData.data?.vSell1hUSD}
          vSell4hUSD={tokenData.data?.vSell4hUSD}
          vSell24hUSD={tokenData.data?.vSell24hUSD}
          topHolders={agentDetails?.data?.topHolders}
        />
      </div>
    </>
  );
};
