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
  LargeMetricCard,
  MetricCard,
  TweetCard,
} from '../ui/GoatIndexMetrics.tsx';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { IoIosArrowForward } from 'react-icons/io';
import { TokenDataChatContent } from '../../types/chatItem.ts';


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

export const TokenDataDashboard = () => {
  const { id, closeDashboard,tokenData } = useDashboardHandler();
  const { theme } = useThemeManager();

  const [agentDetails, setAgentDetails] =
    useState<TokenDataChatContent | null>(null);

  useEffect(() => {
    // Actively fetch the ai project details on global state change
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
        Project: {agentDetails?.data.metadata?.name.toUpperCase()}{' '}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <FiExternalLink
            onClick={(e) => {
              e.preventDefault();
              window.open(
                `https://dexscreener.com/solana/${agentDetails?.data.metadata.address}`,
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
        className="rounded-2xl min-h-fit overflow-hidden"
      >
              <div>
          <embed
            src={`https://www.gmgn.cc/kline/sol/${agentDetails?.data.metadata.address}`}
            width="100%"
            height="400px"
          />
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-1 items-start overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-background"
      >
        <MetricCard
          label="Price"
          value={formatNumber(Number(agentDetails?.data.price || 0))}
          delta={
            Number(agentDetails?.data.priceChange)|| 0
          }
        />
        <MetricCard
          label="Market Cap"  
          value={formatNumber(
            Number(agentDetails?.data.marketCap || 0),
          )}
          delta={
            Number(agentDetails?.data.marketCap || 0)
          }
        />
        <MetricCard
          label="Volume"
          value={formatNumber(
            Number(agentDetails?.data.volume || 0),
          )}
          delta={
            0
          }
        />
        {/* <MetricCard
          label="Holders"
          value={formatNumber(
            agentDetails?.data.data.agentDetail.metrics.holders || 0,
          )}
          delta={
            agentDetails?.data.data.agentDetail.deltaMetrics.delta.holdersDelta || 0
          }
        />
        <LargeMetricCard
          label="Impressions"
          value={agentDetails?.data.data.agentDetail.metrics.avgImpressions || 0}
        />
        <LargeMetricCard
          label="Engagement"
          value={agentDetails?.data.data.agentDetail.metrics.avgEngagement || 0}
        />
        <LargeMetricCard
          label="Followers"
          value={agentDetails?.data.data.agentDetail.metrics.followers || 0}
        />
        <LargeMetricCard
          label="Token?"
          value={
            agentDetails?.data.data.agentDetail.tokenDetail.status === 'HAS_TOKEN'
              ? 'YES'
              : 'NO'
          }
        /> */}
        {/* <div className="w-full">
          <p className="font-semibold text-base text-secText p-2">Top Tweets</p>
          <div className="flex flex-wrap gap-1 items-start w-full">
            {agentDetails?.data.agentDetail.topTweets
              .slice(0, 6)
              .map((tweet, index) => {
                if (!tweet) return null;
                return (
                  <TweetCard
                    key={index}
                    label={tweet.senderName}
                    views={tweet.views}
                    impression={tweet.engagement}
                    url={tweet.url}
                  />
                );
              })}
          </div>
        </div> */}
      </motion.div>
    </div>
  );
};
