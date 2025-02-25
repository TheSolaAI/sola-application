import { useEffect, useState } from 'react';
import { useDashboardHandler } from '../../models/DashboardHandler.ts';
import { toast } from 'sonner';
import { formatNumber } from '../../utils/formatNumber.ts';
import { BasicMetricCard, MetricCard } from '../ui/DashboardMetrics.tsx';
import { motion } from 'framer-motion';
import { IoIosArrowForward } from 'react-icons/io';
import { TokenDataChatContent } from '../../types/chatItem.ts';
import { Tab } from '../ui/message_items/general/BaseTabItem.tsx';
import { Activity, Terminal } from 'lucide-react';
import TerminalTabs from '../ui/TerminalPanel.tsx';
import { TopHolder } from '../../types/messageCard.ts';
import { getTopHoldersHandler } from '../../lib/solana/topHolders.ts';
import { getRugCheckFunction } from '../../tools/getRugCheck.ts';
import useThemeManager from '../../models/ThemeManager.ts';
import { RugCheck } from '../../types/data_types.ts';
import { BorderGlowButton } from '../ui/buttons/BorderGlow.tsx';
import { useSessionHandler } from '../../models/SessionHandler.ts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

type TimeframeMetrics = {
  buys: number;
  sells: number;
  buyVolume: number;
  sellVolume: number;
  priceChange: number;
  uniqueWallets: number;
};

type TimeframeData = {
  '30m': TimeframeMetrics;
  '1h': TimeframeMetrics;
  '4h': TimeframeMetrics;
  '24h': TimeframeMetrics;
};

type TimeframeKey = keyof TimeframeData;

export const TokenDataDashboard = () => {
  /*
   * Global States
   */
  const { sendTextMessage } = useSessionHandler();
  const { id, closeDashboard, tokenData } = useDashboardHandler();

  const [activeTabId, setActiveTabId] = useState(1);
  const [agentDetails, setAgentDetails] = useState<TokenDataChatContent | null>(
    null,
  );
  const [timeframe, setTimeframe] = useState<TimeframeKey>('24h');
  const [tokenAnalysis, setTokenAnalysis] = useState<RugCheck | undefined>(
    undefined,
  );

  // Combined fetch for agent details, top holders, and token analysis
  useEffect(() => {
    if (tokenData) {
      setAgentDetails(tokenData);

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
        getRugCheckFunction({ token: tokenData.data.address })
          .then((analysis) => {
            setTokenAnalysis(analysis.props?.data);
          })
          .catch(() => {
            toast.error('Error getting token analysis');
          });
      }
    } else {
      toast.error('No data available');
    }
  }, [id, tokenData]);

  // Get timeframe metrics from agent details
  const getTimeframeData = (): TimeframeMetrics | null => {
    if (!agentDetails?.data) return null;

    const data = agentDetails.data;
    const metrics: TimeframeData = {
      '30m': {
        buys: data.buy30m || 0,
        sells: data.sell30m || 0,
        buyVolume: data.vBuy30mUSD || 0,
        sellVolume: data.vSell30mUSD || 0,
        priceChange: data.priceChange30mPercent || 0,
        uniqueWallets: data.uniqueWallet30m || 0,
      },
      '1h': {
        buys: data.buy1h || 0,
        sells: data.sell1h || 0,
        buyVolume: data.vBuy1hUSD || 0,
        sellVolume: data.vSell1hUSD || 0,
        priceChange: data.priceChange1hPercent || 0,
        uniqueWallets: data.uniqueWallet1h || 0,
      },
      '4h': {
        buys: data.buy4h || 0,
        sells: data.sell4h || 0,
        buyVolume: data.vBuy4hUSD || 0,
        sellVolume: data.vSell4hUSD || 0,
        priceChange: data.priceChange4hPercent || 0,
        uniqueWallets: data.uniqueWallet4h || 0,
      },
      '24h': {
        buys: data.buy24h || 0,
        sells: data.sell24h || 0,
        buyVolume: data.vBuy24hUSD || 0,
        sellVolume: data.vSell24hUSD || 0,
        priceChange: data.priceChange24hPercent || 0,
        uniqueWallets: data.uniqueWallet24h || 0,
      },
    };

    return metrics[timeframe];
  };

  const currentMetrics = getTimeframeData();
  const priceChangeMetrics = {
    '30m': agentDetails?.data?.priceChange30mPercent || 0,
    '1h': agentDetails?.data?.priceChange1hPercent || 0,
    '4h': agentDetails?.data?.priceChange4hPercent || 0,
    '24h': agentDetails?.data?.priceChange24hPercent || 0,
  };

  // Transform holders data for display
  const transformHoldersToTabContent = (
    holders: TopHolder[] | undefined,
    totalSupply: number,
  ) => {
    const headers = ['Rank', 'Address', 'Amount', 'Percentage', 'Type'];

    const rows =
      holders?.map((holder, index) => ({
        Rank: index + 1,
        Address: holder.owner,
        Amount: holder.amount,
        Percentage: ((holder.amount / totalSupply) * 100).toFixed(2),
        Type: holder.insider ? 'Insider' : 'Holder',
      })) || [];

    return {
      headers,
      rows,
    };
  };

  const holdersTab = transformHoldersToTabContent(
    agentDetails?.data?.topHolders,
    1000000000,
  );

  const tabs: Tab[] = [
    {
      id: 1,
      name: 'Stats',
      icon: Activity,
      content: {
        headers: ['Category', 'Count', 'Volume'],
        rows: [
          {
            Category: 'TXNS',
            Count: `${(currentMetrics?.buys ?? 0) + (currentMetrics?.sells ?? 0)}`,
            buys: currentMetrics?.buys || 0,
            sells: currentMetrics?.sells || 0,
          },
          {
            Category: 'VOLUME',
            Count:
              (currentMetrics?.buyVolume || 0) +
              (currentMetrics?.sellVolume || 0),
            buys: currentMetrics?.buyVolume || 0,
            sells: currentMetrics?.sellVolume || 0,
          },
          {
            Category: 'MAKERS',
            Count: currentMetrics?.uniqueWallets || 0,
            buys: (currentMetrics?.uniqueWallets ?? 0) / 2,
            sells: (currentMetrics?.uniqueWallets ?? 0) / 2,
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Holders',
      icon: Terminal,
      content: holdersTab,
    },
    {
      id: 3,
      name: 'BubbleMaps',
      icon: Terminal,
      content: {
        headers: [],
        rows: [
          {
            address: agentDetails?.data?.address || '',
          },
        ],
      },
    },
    {
      id: 4,
      name: 'Token Analytics',
      icon: Terminal,
      content: {
        headers: ['score', 'message'],
        rows: [
          {
            score: tokenAnalysis?.score || 'not found',
            message: tokenAnalysis?.message || 'not found',
          },
        ],
      },
    },
  ];

  const timeframeButtons: readonly TimeframeKey[] = [
    '30m',
    '1h',
    '4h',
    '24h',
  ] as const;

  return (
    <div className="h-full w-full flex flex-col gap-3 bg-backgroundContrast p-4 rounded-lg shadow-2xl">
      <IoIosArrowForward
        className="rounded-2xl cursor-pointer text-textColorContrast min-w-8 min-h-8 hover:text-primary"
        onClick={closeDashboard}
      />
      <motion.p
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-4 text-2xl items-center font-bold text-textColorContrast p-2  "
      >
        <span
          className="cursor-pointer hover:text-primaryDark"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://dexscreener.com/solana/${agentDetails?.data?.address}`,
              '_blank',
            );
          }}
        >
          Ticker: ${agentDetails?.data?.symbol?.toUpperCase()}
        </span>
        <span
          onClick={() =>
            sendTextMessage(
              `Just Tell the user that, the token ${agentDetails?.data?.name} as risk level of ${tokenAnalysis?.score} (higher the score, better) and risk analysis ${tokenAnalysis?.message} and this analysis is powered by ANTI-RUG. Dont perform any function calls.`,
            )
          }
        >
          <BorderGlowButton text={'Anti-Rug Analysis'} />
        </span>
      </motion.p>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl min-h-fit overflow-hidden"
      >
        <div>
          <embed
            src={`https://www.gmgn.cc/kline/sol/${agentDetails?.data?.address}`}
            width="100%"
            color={useThemeManager().theme.surface}
            height="350px"
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-2 px-2 items-start overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-backgroundContrast"
      >
        <MetricCard
          label="Price"
          value={formatNumber(Number(agentDetails?.data?.price || 0))}
          delta={priceChangeMetrics[timeframe]}
        />
        <BasicMetricCard
          label="Market Cap"
          value={formatNumber(Number(agentDetails?.data?.marketCap || 0))}
        />
        <BasicMetricCard
          label="Volume"
          value={`$${formatNumber(
            Number(currentMetrics?.buyVolume || 0) +
              Number(currentMetrics?.sellVolume || 0),
          )}`}
        />
        <BasicMetricCard
          label="Liquidity"
          value={`$${formatNumber(Number(agentDetails?.data?.liquidity || 0))}`}
        />

        <div className="flex gap-2 w-full justify-end my-4 px-1">
          {timeframeButtons.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`w-16 p-2 rounded-full shadow-md hover:text-secText ${timeframe === tf ? 'bg-background text-textColor' : 'bg-black dark:bg-white text-textColorContrast'}`}
            >
              {tf}
            </button>
          ))}
        </div>

        <TerminalTabs
          tabs={tabs}
          agentDetails={agentDetails}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          className="my-tabs"
          tabClassName="my-tab"
          contentClassName="my-content"
        />
      </motion.div>
    </div>
  );
};
