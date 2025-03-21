'use client';

import { FC, useState, useMemo } from 'react';
import { GraphPoint, Metrics } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatNumber } from '@/utils/formatNumber';
import { Pill } from '@/components/common/Pill';
import { IoIosAnalytics } from 'react-icons/io';
import { toast } from 'sonner';

interface MetricsSummaryCardProps {
  metrics?: Metrics;
  priceData?: GraphPoint[];
  mindshareData?: GraphPoint[];
  marketCapData?: GraphPoint[];
  tokenSymbol?: string;
}

type ChartType = 'combined' | 'price' | 'mindshare' | 'marketCap';

export const MetricsSummaryCard: FC<MetricsSummaryCardProps> = ({
  metrics,
  priceData = [],
  mindshareData = [],
  marketCapData = [],
  tokenSymbol,
}) => {
  const { theme } = useThemeManager();
  const [activeChart, setActiveChart] = useState<ChartType>('combined');

  /**
   * Normalize all values for the combined chart
   */
  const normalizeData = (data: GraphPoint[], dataType: string) => {
    if (!data || data.length === 0) return [];

    // Find min and max for normalization
    const values = data.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // Avoid division by zero if all values are the same
    if (range === 0) {
      return data.map((point) => ({
        ...point,
        normalizedValue: 50,
        originalValue: point.value,
        dataType,
      }));
    }

    // Normalize to 0-100 range
    return data.map((point) => ({
      ...point,
      normalizedValue: ((point.value - min) / range) * 100,
      originalValue: point.value,
      dataType,
    }));
  };

  /**
   * Returns chart data based on the currently active chart
   */
  const chartData = useMemo(() => {
    if (activeChart === 'combined') {
      // For combined view, we need to ensure we have data for all three metrics
      if (!priceData.length || !mindshareData.length || !marketCapData.length) {
        return [];
      }

      // Normalize all data sets
      const normalizedPrice = normalizeData(priceData, 'price');
      const normalizedMindshare = normalizeData(mindshareData, 'mindshare');
      const normalizedMarketCap = normalizeData(marketCapData, 'marketCap');

      // Get all unique dates from all datasets
      const allDatesSet = new Set([
        ...normalizedPrice.map((p) => p.date),
        ...normalizedMindshare.map((p) => p.date),
        ...normalizedMarketCap.map((p) => p.date),
      ]);

      // Sort dates chronologically
      const allDates = Array.from(allDatesSet).sort(
        (a, b) => Number(a) - Number(b)
      );

      // Create a datapoint for each date
      return allDates.map((date) => {
        const pricePoint = normalizedPrice.find((p) => p.date === date);
        const mindsharePoint = normalizedMindshare.find((p) => p.date === date);
        const marketCapPoint = normalizedMarketCap.find((p) => p.date === date);

        return {
          date,
          price: pricePoint?.normalizedValue ?? null,
          priceOriginal: pricePoint?.originalValue ?? null,
          mindshare: mindsharePoint?.normalizedValue ?? null,
          mindshareOriginal: mindsharePoint?.originalValue ?? null,
          marketCap: marketCapPoint?.normalizedValue ?? null,
          marketCapOriginal: marketCapPoint?.originalValue ?? null,
        };
      });
    } else if (activeChart === 'price') {
      return [...priceData].sort((a, b) => Number(a.date) - Number(b.date));
    } else if (activeChart === 'mindshare') {
      return [...mindshareData].sort((a, b) => Number(a.date) - Number(b.date));
    } else {
      return [...marketCapData].sort((a, b) => Number(a.date) - Number(b.date));
    }
  }, [activeChart, priceData, mindshareData, marketCapData]);

  /**
   * Calculate min and max values for reference lines
   */
  const referenceValues = useMemo(() => {
    const getMinMax = (data: GraphPoint[]) => {
      if (!data || data.length === 0) return { min: 0, max: 0 };
      const values = data.map((point) => point.value);
      return {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    return {
      price: getMinMax(priceData),
      mindshare: getMinMax(mindshareData),
      marketCap: getMinMax(marketCapData),
    };
  }, [priceData, mindshareData, marketCapData]);

  /**
   * Returns chart color based on type
   */
  const getChartColor = (type: ChartType | string) => {
    switch (type) {
      case 'price':
        return '#4CAF50'; // Green
      case 'mindshare':
        return '#2196F3'; // Blue
      case 'marketCap':
        return '#FFC107'; // Amber
      default:
        return '#E91E63'; // Pink
    }
  };

  /**
   * Converts milliseconds timestamp to month name/day format
   */
  const formatDate = (timestamp: string) => {
    const date = new Date(Number(timestamp));
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  /**
   * Format reference line label based on chart type
   */
  const formatReferenceLineLabel = (value: number, type: ChartType) => {
    if (type === 'mindshare') {
      return `${value.toFixed(2)}%`;
    }
    return formatNumber(value);
  };

  // Custom tooltip formatter that shows original values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: theme.baseBackground,
            border: `1px solid ${theme.sec_background}`,
            maxWidth: '200px',
          }}
        >
          <p className="text-textColor font-semibold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => {
            // Skip null values
            if (entry.value === null) return null;

            let value = entry.value;
            let name = entry.name;

            // For combined view, show original values
            if (activeChart === 'combined') {
              const originalKey = `${entry.dataKey}Original`;
              if (
                payload[0].payload[originalKey] !== undefined &&
                payload[0].payload[originalKey] !== null
              ) {
                value = payload[0].payload[originalKey];
                // Format value based on type
                if (
                  entry.dataKey === 'price' ||
                  entry.dataKey === 'marketCap'
                ) {
                  value = formatNumber(value);
                } else if (entry.dataKey === 'mindshare') {
                  value = `${value.toFixed(2)}%`;
                }
              }

              name =
                entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1);
            } else {
              value =
                entry.dataKey === 'value'
                  ? activeChart === 'mindshare'
                    ? `${value.toFixed(2)}%`
                    : formatNumber(value)
                  : value;
            }

            return (
              <p
                key={index}
                className="truncate"
                style={{ color: entry.color }}
              >
                {name}: {value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Check if we have data for the current view
  const hasData = useMemo(() => {
    if (activeChart === 'combined') {
      return (
        priceData.length > 0 &&
        mindshareData.length > 0 &&
        marketCapData.length > 0
      );
    } else if (activeChart === 'price') {
      return priceData.length > 0;
    } else if (activeChart === 'mindshare') {
      return mindshareData.length > 0;
    } else {
      return marketCapData.length > 0;
    }
  }, [activeChart, priceData, mindshareData, marketCapData]);

  return (
    <div className="bg-background rounded-xl w-full flex flex-col p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Metrics Summary Column */}
        <div className="flex flex-col gap-y-3 w-full lg:w-2/5">
          <div className="flex flex-row gap-x-2 items-center">
            <h1 className="text-textColor text-xl sm:text-2xl font-semibold">
              Metrics
            </h1>
            {tokenSymbol && (
              <Pill
                text={tokenSymbol}
                icon={<IoIosAnalytics size={16} className="sm:text-lg" />}
                color={theme.baseBackground}
                textColor={theme.secText}
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 flex-1">
            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">Price</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.price ? formatNumber(metrics.price) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">Market Cap</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.marketCap ? formatNumber(metrics.marketCap) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">Liquidity</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.liquidity ? formatNumber(metrics.liquidity) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">24h Volume</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.tradingVolume
                  ? formatNumber(metrics.tradingVolume)
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">Holders</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.holders?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">Mind Share</p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">{`${metrics?.mindShare?.toFixed(2) || 'N/A'}%`}</p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">
                Avg. Impressions
              </p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.avgImpressions?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-2 sm:p-3">
              <p className="text-secText text-xs sm:text-sm">
                Social Followers
              </p>
              <p className="text-textColor text-lg sm:text-2xl font-bold truncate">
                {metrics?.followers?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="flex flex-col gap-y-3 w-full lg:w-3/5 mt-4 lg:mt-0">
          {/* Chart Tabs */}
          <div className="flex flex-row gap-2 flex-wrap">
            <Pill
              text="Combined"
              color={
                activeChart === 'combined'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={activeChart === 'combined' ? 'white' : theme.secText}
              onClick={() => setActiveChart('combined')}
              hoverable={true}
            />
            <Pill
              text="Price"
              color={
                activeChart === 'price'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={activeChart === 'price' ? 'white' : theme.secText}
              onClick={() => setActiveChart('price')}
              hoverable={true}
            />
            <Pill
              text="Mind Share"
              color={
                activeChart === 'mindshare'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={activeChart === 'mindshare' ? 'white' : theme.secText}
              onClick={() => setActiveChart('mindshare')}
              hoverable={true}
            />
            <Pill
              text="Market Cap"
              color={
                activeChart === 'marketCap'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={activeChart === 'marketCap' ? 'white' : theme.secText}
              onClick={() => setActiveChart('marketCap')}
              hoverable={true}
            />
          </div>

          {/* Chart Area */}
          <div className="h-64 sm:h-80 lg:h-96" style={{ minHeight: '250px' }}>
            {!hasData ? (
              <div className="w-full h-full flex items-center justify-center text-secText">
                No data available for this chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={theme.secText}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke={theme.secText}
                    tick={{ fontSize: 10 }}
                    tickCount={5}
                    minTickGap={15}
                  />
                  <YAxis
                    stroke={theme.secText}
                    domain={
                      activeChart === 'combined' ? [0, 100] : ['auto', 'auto']
                    }
                    tickFormatter={
                      activeChart === 'combined'
                        ? (value) => `${value}%`
                        : undefined
                    }
                    tick={{ fontSize: 10 }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Legend for combined view */}
                  {activeChart === 'combined' && (
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
                      iconSize={8}
                    />
                  )}

                  {/* Reference Lines */}
                  {activeChart !== 'combined' && (
                    <>
                      <ReferenceLine
                        y={referenceValues[activeChart].min}
                        stroke="#FF5252"
                        strokeDasharray="3 3"
                        label={{
                          value: `Min: ${formatReferenceLineLabel(
                            referenceValues[activeChart].min,
                            activeChart
                          )}`,
                          position: 'insideBottomLeft',
                          fill: '#FF5252',
                          fontSize: 9,
                        }}
                      />
                      <ReferenceLine
                        y={referenceValues[activeChart].max}
                        stroke="#69F0AE"
                        ifOverflow="extendDomain"
                        strokeDasharray="3 3"
                        yAxisId={0}
                        label={{
                          value: `Max: ${formatReferenceLineLabel(
                            referenceValues[activeChart].max,
                            activeChart
                          )}`,
                          position: 'insideTopLeft',
                          fill: '#69F0AE',
                          fontSize: 9,
                        }}
                      />
                    </>
                  )}

                  {/* Chart Lines */}
                  {activeChart === 'combined' ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="price"
                        name="Price"
                        stroke={getChartColor('price')}
                        activeDot={{ r: 6 }}
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="mindshare"
                        name="Mind Share"
                        stroke={getChartColor('mindshare')}
                        activeDot={{ r: 6 }}
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="marketCap"
                        name="Market Cap"
                        stroke={getChartColor('marketCap')}
                        activeDot={{ r: 6 }}
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                        connectNulls={true}
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={
                        activeChart.charAt(0).toUpperCase() +
                        activeChart.slice(1)
                      }
                      stroke={getChartColor(activeChart)}
                      activeDot={{ r: 6 }}
                      strokeWidth={1.5}
                      dot={{ r: 2 }}
                      connectNulls={true}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
