'use client';

import { FC, useEffect, useState } from 'react';
import { apiClient, ApiClient } from '@/lib/ApiClient';
import { GoatIndexAgentResponse } from '@/types/goatIndex';
import { toast } from 'sonner';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { ProjectSummaryCard } from './ProjectSummaryCard';
import { MetricsSummaryCard } from './MetricsSummaryCard';
import { GithubSummaryCard } from './GithubSummaryCard';
import { TweetsSummaryCard } from './TweetsSummaryCard';

interface GoatIndexDashboardProps {
  contract_address: string;
}

export const GoatIndexDashboard: FC<GoatIndexDashboardProps> = ({
  contract_address,
}) => {
  /**
   * Global State
   */
  const { setDashboardTitle } = useLayoutContext();

  /**
   * Local State
   */
  const [isLoading, setIsLoading] = useState(false);
  const [agentDetails, setAgentDetails] =
    useState<GoatIndexAgentResponse | null>(null);

  useEffect(() => {
    // Reset states when contract_address changes
    setIsLoading(true);
    setAgentDetails(null);
    setDashboardTitle('Goat Index Dashboard');

    // Actively fetch the ai project details on contract_address change
    async function fetchAgentDetails() {
      try {
        const response = await apiClient.get<GoatIndexAgentResponse>(
          `/api/agent/detail/SOLANA/${contract_address}/DAY_7`,
          undefined,
          'goatIndex'
        );
        console.log(response);

        if (ApiClient.isApiError(response)) {
          console.error(response);
          toast.error('Error getting agent details');
          setIsLoading(false);
          return;
        }
        setAgentDetails(response.data);
        setIsLoading(false);
      } catch (e) {
        toast.error('Error getting agent details');
        setIsLoading(false);
      }
    }

    fetchAgentDetails();
  }, [contract_address]);

  return (
    <MaskedRevealLoader isLoading={isLoading}>
      <ProjectSummaryCard
        tokenDetail={agentDetails?.data.agentDetail.tokenDetail}
      />
      <div className="bg-baseBackground rounded-xl w-full flex flex-col p-2 gap-y-2 mt-2">
        <MetricsSummaryCard
          metrics={agentDetails?.data.agentDetail.metrics}
          priceData={agentDetails?.data.agentDetail.priceGraphs}
          mindshareData={agentDetails?.data.agentDetail.mindshareGraphs}
          marketCapData={agentDetails?.data.agentDetail.marketCapGraphs}
          tokenSymbol={agentDetails?.data.agentDetail.tokenDetail.symbol}
        />
        <GithubSummaryCard
          stats={agentDetails?.data.agentDetail.tokenDetail.githubAnalysis}
        />
        <TweetsSummaryCard tweets={agentDetails?.data.agentDetail.topTweets} />
      </div>
    </MaskedRevealLoader>
  );
};
