import { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-react';
import { AgCartesianChartOptions } from 'ag-charts-community';
import { useDashboardHandler } from '../../models/DashboardHandler.ts';
import { apiClient, ApiClient } from '../../api/ApiClient.ts';
import { GoatIndexAgentResponse } from '../../types/goatIndex.ts';
import { toast } from 'sonner';
import useThemeManager from '../../models/ThemeManager.ts';

export const GoatIndexDashboard = () => {
  const { id } = useDashboardHandler();
  const { theme } = useThemeManager();

  const [agentDetails, setAgentDetails] =
    useState<GoatIndexAgentResponse | null>(null);
  const [chartData, setChartData] = useState<
    { date: string; mindshare: number; price: number }[]
  >([]);

  useEffect(() => {
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

  const chartOptions: AgCartesianChartOptions = {
    theme: 'ag-polychroma-dark',
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
        label: { color: '#A0A0A0' },
      },
      {
        type: 'number',
        position: 'left',
        keys: ['mindshare'],
        label: { color: theme.primary },
      },
      {
        type: 'number',
        position: 'right',
        keys: ['price'],
        label: { color: theme.secText },
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
          color: '#FFFFFF',
        },
      },
    },
  };

  return (
    <div className="h-full w-full flex flex-col gap-3 bg-background p-4 rounded-lg shadow-2xl">
      <p className="text-2xl font-bold text-secText p-2">
        Project: {agentDetails?.data.agentDetail.tokenDetail.name.toUpperCase()}
      </p>
      <div className="rounded-2xl overflow-hidden">
        <AgCharts options={chartOptions} />
      </div>
    </div>
  );
};
