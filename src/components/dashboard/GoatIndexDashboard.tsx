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
} from '../ui/DashboardMetrics.tsx';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { IoIosArrowForward } from 'react-icons/io';
import { ChartBarIcon } from 'lucide-react';
import { MaskedRevealLoader } from '../general/MaskedRevealLoader.tsx';
import { BorderGlowButton } from '../ui/buttons/BorderGlow.tsx';

export const GoatIndexDashboard = () => {
  const { id, closeDashboard } = useDashboardHandler();
  const { theme } = useThemeManager();

  const [isLoading, setIsLoading] = useState(false);

  const [agentDetails, setAgentDetails] =
    useState<GoatIndexAgentResponse | null>(null);
  const [chartData, setChartData] = useState<
    { date: string; mindshare: number }[]
  >([]);
  const [chart, setChart] = useState<0 | 1>(1);

  useEffect(() => {
    // Actively fetch the ai project details on global state change
    async function fetchAgentDetails() {
      setIsLoading(true);
      try {
        const response = await apiClient.get<GoatIndexAgentResponse>(
          `/api/agent/detail/SOLANA/${id}/DAY_7`,
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

        const formattedData = mindshareData.map((entry, index) => ({
          date: new Date(Number(entry.date)).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
          }),
          mindshare: entry.value * 100,
        }));

        setChartData(formattedData);
        setIsLoading(false);
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
      fill: theme.baseBackground,
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

  const toggleChart = () => {
    setChart(chart === 0 ? 1 : 0);
  };

  return (
    <MaskedRevealLoader isLoading={isLoading}>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="h-full w-full flex flex-col gap-3 bg-backgroundContrast p-4 rounded-lg shadow-2xl"
      >
        {/* Dashboard header with back button */}
        <IoIosArrowForward
          className="rounded-2xl cursor-pointer text-textColorContrast min-w-8 min-h-8 hover:text-primary"
          onClick={closeDashboard}
        />
        <p className="flex gap-4 text-2xl items-center font-bold text-textColorContrast p-2">
          Project:{' '}
          {agentDetails?.data.agentDetail.tokenDetail.name.toUpperCase()}{' '}
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <span onClick={toggleChart}>
              <BorderGlowButton
                text={chart === 0 ? 'Show Price' : 'Show Mindshare'}
                icon={(props) => <ChartBarIcon {...props} />}
              />
            </span>
          </motion.div>
        </p>

        <div style={{ display: chart === 0 ? 'block' : 'none' }}>
          <motion.div className="rounded-2xl min-h-fit shadow-lg overflow-hidden">
            <AgCharts options={chartOptions} />
          </motion.div>
        </div>

        <div style={{ display: chart === 1 ? 'block' : 'none' }}>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl min-h-fit overflow-hidden"
          >
            <div>
              <embed
                src={`https://www.birdeye.so/tv-widget/${agentDetails?.data?.agentDetail.tokenDetail.contractAddress}?chain=solana`}
                width="100%"
                color={theme.surface}
                height="350px"
              />
            </div>
          </motion.div>
        </div>

        {/* Scrollable content container - KEY CHANGES HERE */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex-1 max-h-64 overflow-y-auto p-1 rounded-xl scrollbar-thin scrollbar-thumb-primary scrollbar-track-backgroundContrast"
        >
          {/* Content wrapper that allows flex-wrap to work properly within the scrollable container */}
          <div className="flex flex-wrap gap-1 items-start">
            <MetricCard
              label="Price"
              value={agentDetails?.data.agentDetail.metrics.price || 0}
              delta={
                agentDetails?.data.agentDetail.deltaMetrics.delta.priceDelta ||
                0
              }
            />
            <MetricCard
              label="MC"
              value={formatNumber(
                agentDetails?.data.agentDetail.metrics.marketCap || 0,
              )}
              delta={
                agentDetails?.data.agentDetail.deltaMetrics.delta
                  .marketCapDelta || 0
              }
            />
            <MetricCard
              label="Mindshare"
              value={formatNumber(
                agentDetails?.data.agentDetail.metrics.mindShare || 0,
              )}
              delta={
                agentDetails?.data.agentDetail.deltaMetrics.delta
                  .mindShareDelta || 0
              }
            />
            <MetricCard
              label="Holders"
              value={formatNumber(
                agentDetails?.data.agentDetail.metrics.holders || 0,
              )}
              delta={
                agentDetails?.data.agentDetail.deltaMetrics.delta
                  .holdersDelta || 0
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
                agentDetails?.data.agentDetail.tokenDetail.status ===
                'HAS_TOKEN'
                  ? 'YES'
                  : 'NO'
              }
            />
            <div className="w-full h-fit">
              <p className="font-semibold text-textColorContrast text-secText p-2">
                Top Tweets
              </p>
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
          </div>
        </motion.div>
      </motion.div>
    </MaskedRevealLoader>
  );
};
