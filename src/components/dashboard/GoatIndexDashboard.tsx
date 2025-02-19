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
import { AgCharts } from 'ag-charts-react';
import { AgCartesianChartOptions } from 'ag-charts-community';
import { useDashboardHandler } from '../../models/DashboardHandler.ts';
import { apiClient, ApiClient } from '../../api/ApiClient.ts';
import { GoatIndexAgentResponse } from '../../types/goatIndex.ts';
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

export const GoatIndexDashboard = () => {
  const { id, closeDashboard } = useDashboardHandler();
  const { theme } = useThemeManager();

  const [agentDetails, setAgentDetails] =
    useState<GoatIndexAgentResponse | null>(null);
  const [chartData, setChartData] = useState<
    { date: string; mindshare: number; price: number }[]
  >([]);

  useEffect(() => {
    // Actively fetch the ai project details on global state change
    async function fetchAgentDetails() {
      try {
        const response = await apiClient.get<GoatIndexAgentResponse>(
          `/api/agent/detail/SOLANA/${id}/HOUR_6`,
          undefined,
          'goatIndex',
        );

        if (ApiClient.isApiError(response)) {
          console.error(response);
          toast.error('Error getting agent details');
          return;
        }

        const agentData = response.data.data;
        setAgentDetails(response.data);
        const mindshareData = agentData?.agentDetail.mindshareGraphs || [];
        const priceData = agentData?.agentDetail.priceGraphs || [];

        // Combine data by timestamp
        const formattedData = mindshareData.map((entry, index) => ({
          date: new Date(Number(entry.date)).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
          }),
          mindshare: entry.value * 100,
          price: priceData[index]?.value || 0,
        }));

        setChartData(formattedData);
      } catch (e) {
        toast.error('Error getting agent details');
      }
    }

    fetchAgentDetails();
  }, [id]);

  // The chart config
  const chartOptions: AgCartesianChartOptions = {
    theme: 'ag-vivid',
    background: {
      fill: theme.sec_background,
    },
    animation: {
      enabled: true,
      duration: 3000,
    },
    data: chartData,
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: { color: theme.secText },
      },
      {
        type: 'number',
        position: 'left',
        keys: ['mindshare'],
        label: { color: theme.primary },
        gridLine: { enabled: false },
      },
      {
        type: 'number',
        position: 'right',
        keys: ['price'],
        label: { color: theme.secText },
        gridLine: { enabled: false },
      },
    ],
    series: [
      {
        type: 'area',
        xKey: 'date',
        yKey: 'mindshare',
        yName: 'Mindshare',
        fill: theme.primary,
        stroke: theme.primary,
        strokeWidth: 2,
        marker: { enabled: false },
        interpolation: { type: 'smooth' },
      },
      {
        type: 'line',
        xKey: 'date',
        yKey: 'price',
        yName: 'Price',
        stroke: theme.secText,
        strokeWidth: 2,
        marker: {
          enabled: false,
        },
        interpolation: { type: 'smooth', tension: 0 },
      },
    ],
    legend: {
      position: 'bottom',
      item: {
        label: {
          fontSize: 13,
          color: theme.textColor,
        },
      },
    },
  };

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
        Project: {agentDetails?.data.agentDetail.tokenDetail.name.toUpperCase()}{' '}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <FiExternalLink
            onClick={(e) => {
              e.preventDefault();
              window.open(
                `https://www.goatindex.ai/solana/${agentDetails?.data.agentDetail.tokenDetail.contractAddress}`,
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
        <AgCharts options={chartOptions} />
      </motion.div>
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-1 items-start overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-background"
      >
        <MetricCard
          label="Price"
          value={agentDetails?.data.agentDetail.metrics.price || 0}
          delta={
            agentDetails?.data.agentDetail.deltaMetrics.delta.priceDelta || 0
          }
        />
        <MetricCard
          label="MC"
          value={formatNumber(
            agentDetails?.data.agentDetail.metrics.marketCap || 0,
          )}
          delta={
            agentDetails?.data.agentDetail.deltaMetrics.delta.marketCapDelta ||
            0
          }
        />
        <MetricCard
          label="Mindshare"
          value={formatNumber(
            agentDetails?.data.agentDetail.metrics.mindShare || 0,
          )}
          delta={
            agentDetails?.data.agentDetail.deltaMetrics.delta.mindShareDelta ||
            0
          }
        />
        <MetricCard
          label="Holders"
          value={formatNumber(
            agentDetails?.data.agentDetail.metrics.holders || 0,
          )}
          delta={
            agentDetails?.data.agentDetail.deltaMetrics.delta.holdersDelta || 0
          }
        />
        <LargeMetricCard
          label="Impressions"
          value={agentDetails?.data.agentDetail.metrics.avgImpressions || 0}
        />
        <LargeMetricCard
          label="Engagement"
          value={agentDetails?.data.agentDetail.metrics.avgEngagement || 0}
        />
        <LargeMetricCard
          label="Followers"
          value={agentDetails?.data.agentDetail.metrics.followers || 0}
        />
        <LargeMetricCard
          label="Token?"
          value={
            agentDetails?.data.agentDetail.tokenDetail.status === 'HAS_TOKEN'
              ? 'YES'
              : 'NO'
          }
        />
        <div className="w-full">
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
        </div>
      </motion.div>
    </div>
  );
};
