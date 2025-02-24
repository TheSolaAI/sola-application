/**
 * This component displays the Goat Index dashboard for a selected agent.
 * It fetches agent details and visualizes key metrics using a chart.
 *
 * Features:
 * - Fetches agent details from the Goat Index API.
 * - Displays a chart with mindshare and price trends.
 * - Shows metrics like price, market cap, mindshare, and holders.
 * - Lists top tweets related to the agent.
 *
 * State:
 * - `agentDetails`: Stores fetched agent data.
 * - `chartData`: Stores formatted mindshare and price data for the chart.
 *
 * Hooks:
 * - `useDashboardHandler`: Retrieves the selected agent ID.
 * - `useThemeManager`: Provides theme settings for styling.
 *
 * API Calls:
 * - Fetches agent details using `apiClient.get()`.
 *
 * UI Components:
 * - `MetricCard`, `LargeMetricCard`, and `TweetCard` for displaying agent insights.
 * - `AgCharts` for data visualization.
 */
import { useEffect, useState } from 'react';
import { useDashboardHandler } from '../../models/DashboardHandler.ts';
import { toast } from 'sonner';
import useThemeManager from '../../models/ThemeManager.ts';
import { formatNumber } from '../../utils/formatNumber.ts';
import {
  BasicMetricCard,
  LargeMetricCard,
  MetricCard,
  TweetCard,
} from '../ui/GoatIndexMetrics.tsx';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { IoIosArrowForward } from 'react-icons/io';
import { TokenDataChatContent } from '../../types/chatItem.ts';
import { Tab } from '../ui/message_items/general/BaseTabItem.tsx';
import { Activity, Terminal, Users } from 'lucide-react';
import TerminalTabs from '../ui/TerminalPanel.tsx';
import Button from '../general/Button.tsx';
import { getTopHoldersFunction } from '../../tools/getTopHolders.ts';
import { TopHolder } from '../../types/messageCard.ts';
import { getTopHoldersHandler } from '../../lib/solana/topHolders.ts';



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
  const [activeTabId, setActiveTabId] = useState(1);
  const { id, closeDashboard, tokenData } = useDashboardHandler();
  const [agentDetails, setAgentDetails] = useState<TokenDataChatContent | null>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [topHoldersLoading, setTopHoldersLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000; // 3 seconds


  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        const agentData = tokenData;
        if (!agentData) {
          toast.error('No data available');
          return;
        }
        setAgentDetails(agentData);
      } catch (e) {
        toast.error('Error getting agent details');
      }
    }
    fetchAgentDetails();
  }, [id]);

  useEffect(() => { 
    let timeoutId: NodeJS.Timeout;

    async function fetchTopHolders() { 
      if (!agentDetails?.data) return;
      
      try {
        const topHolders = await getTopHoldersHandler(agentDetails.data.address);
        if (topHolders && topHolders.length > 0) {
          setAgentDetails(prev => {
            if (!prev) return null;
            return {
              ...prev,
              data: {
                ...prev.data,
                topHolders: topHolders
              }
            };
          });
          setTopHoldersLoading(false);
          setRetryCount(0); // Reset retry count on success
        } else if (retryCount < MAX_RETRIES) {
          // If no holders found and we haven't exceeded max retries, try again
          setRetryCount(prev => prev + 1);
          timeoutId = setTimeout(fetchTopHolders, RETRY_DELAY);
        } else {
          setTopHoldersLoading(false);
          toast.error('Unable to fetch top holders after multiple attempts');
        }
      } catch (e) {
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          timeoutId = setTimeout(fetchTopHolders, RETRY_DELAY);
        } else {
          setTopHoldersLoading(false);
          toast.error('Error getting top holders');
        }
      }
    }

    if (!agentDetails?.data?.topHolders) {
      setTopHoldersLoading(true);
      fetchTopHolders();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [agentDetails?.data?.address, retryCount]);


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

    return metrics[timeframe as keyof TimeframeData];
  };

  const currentMetrics = getTimeframeData();
  const priceChangeMetrics = {
    '30m': agentDetails?.data.priceChange30mPercent || 0,
    '1h':  agentDetails?.data.priceChange1hPercent || 0,
    '4h':  agentDetails?.data.priceChange4hPercent || 0,
    '24h': agentDetails?.data.priceChange24hPercent || 0,
  };

  const transformHoldersToTabContent = (
    holders: TopHolder[] | undefined,
    totalSupply: number
  ) => {
    const headers = ['Rank', 'Address', 'Amount', 'Percentage', 'Type'];
    
    const rows = holders?.map((holder, index) => ({
      Rank: index + 1,
      Address: holder.owner,
      Amount: holder.amount,
      Percentage: ((holder.amount / totalSupply) * 100).toFixed(2),
      Type: holder.insider ? 'Insider' : 'Holder'
    })) || [];
    
    return {
      headers,
      rows,
      isLoading: topHoldersLoading,
      retryCount: retryCount,
      maxRetries: MAX_RETRIES
    };
  };
  const holdersTab = transformHoldersToTabContent(
    agentDetails?.data?.topHolders,
    1000000000
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
            sells: currentMetrics?.sells || 0
          },
          {
            Category: 'VOLUME',
            Count: (currentMetrics?.buyVolume || 0) + (currentMetrics?.sellVolume || 0),
            buys: currentMetrics?.buyVolume || 0,
            sells: currentMetrics?.sellVolume || 0
          },
          {
            Category: 'MAKERS',
            Count: currentMetrics?.uniqueWallets || 0,
            buys: (currentMetrics?.uniqueWallets ?? 0) / 2,
            sells: (currentMetrics?.uniqueWallets ?? 0) / 2,
          }
        ]
      },
    },
    {
      id: 2,
      name: 'Holders',
      icon: Terminal,
      content:holdersTab
    },
    {
      id: 3,
      name: 'BubbleMaps',
      icon: Terminal,
      content: {
        headers: [],
        rows: [
          {
            address: agentDetails?.data.address || '',
          },
        ],
      },
    },

    {
      id: 4,
      name: 'Liquidity Providers',
      icon: Terminal,
      content: {
        headers: ['Interface', 'IP', 'Upload', 'Download'],
        rows: [
          { Interface: 'eth0', IP: '192.168.1.1', Upload: '1.2 MB/s', Download: '2.4 MB/s' }
        ]
      }
    }
  ];

  const timeframeButtons: readonly TimeframeKey[] = ['30m', '1h', '4h', '24h'] as const;

  return (
    <div className="h-full w-full flex flex-col gap-3 bg-background p-4 rounded-lg shadow-2xl">
      <IoIosArrowForward
        className="rounded-2xl cursor-pointer text-textColor w-12 h-12 hover:text-primary"
        onClick={closeDashboard}
      />
      <motion.p
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-4 text-2xl items-center font-bold text-secText p-2"
      >
        Project: {agentDetails?.data.name.toUpperCase()}{' '}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <FiExternalLink
            onClick={(e) => {
              e.preventDefault();
              window.open(
                `https://dexscreener.com/solana/${agentDetails?.data.address}`,
                '_blank',
              );
            }}
            className="font-thin text-sm self-center cursor-pointer"
          />
        </motion.div>
      </motion.p>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl min-h-fit overflow-hidden"
      >
        <div>
          <embed
            src={`https://www.gmgn.cc/kline/sol/${agentDetails?.data.address}`}
            width="100%"
            height="400px"
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-2 items-start overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-background"
      >
        <BasicMetricCard
          label="Price"
          value={formatNumber(Number(agentDetails?.data.price || 0))}
 
        />
        <BasicMetricCard
          label="Market Cap"
          value={formatNumber(Number(agentDetails?.data.marketCap || 0))}

        />
        <BasicMetricCard
          label="Volume"
          value={`$${formatNumber(
            Number(currentMetrics?.buyVolume || 0) + Number(currentMetrics?.sellVolume || 0)
          )}`}
        />
        <BasicMetricCard
          label="Liquidity"
          value={`$${formatNumber(
            Number(agentDetails?.data.liquidity || 0)
          )}`}
        />

        <div className="flex gap-2 mb-4">
        {timeframeButtons.map((tf) => (
          <Button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`w-16 py-2 px-4 ${timeframe === tf ? 'bg-primary' : 'bg-black'}`}
          >
              {tf}
              {priceChangeMetrics[tf] ? (
                <span
                  className={`text-xs ${
                    priceChangeMetrics[tf] < 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  ({formatNumber(priceChangeMetrics[tf])}%)
                </span>
              ) : null}
          </Button>
        ))}
      </div>
        <TerminalTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          className="my-tabs"
          tabClassName="my-tab"
          activeTabClassName="my-active-tab"
          contentClassName="my-content"
        />
      </motion.div>
    </div>
  );
};
