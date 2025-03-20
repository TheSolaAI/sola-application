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
   * @returns
   */
  const getChartData = () => {
    if (activeChart === 'combined') {
      // first normalize
      const normalizedPrice = normalizeData(priceData, 'price');
      const normalizedMindshare = normalizeData(mindshareData, 'mindshare');
      const normalizedMarketCap = normalizeData(marketCapData, 'marketCap');

      // Find all unique dates across all datasets
      const allDates = new Set([
        ...normalizedPrice.map((point) => point.date),
        ...normalizedMindshare.map((point) => point.date),
        ...normalizedMarketCap.map((point) => point.date),
      ]);

      // Create combined dataset
      return Array.from(allDates)
        .map((date) => {
          const pricePoint = normalizedPrice.find((p) => p.date === date);
          const mindsharePoint = normalizedMindshare.find(
            (p) => p.date === date
          );
          const marketCapPoint = normalizedMarketCap.find(
            (p) => p.date === date
          );

          return {
            date,
            price: pricePoint?.normalizedValue || 0,
            priceOriginal: pricePoint?.originalValue || 0,
            mindshare: mindsharePoint?.normalizedValue || 0,
            mindshareOriginal: mindsharePoint?.originalValue || 0,
            marketCap: marketCapPoint?.normalizedValue || 0,
            marketCapOriginal: marketCapPoint?.originalValue || 0,
          };
        })
        .sort((a, b) => Number(a.date) - Number(b.date));
    } else if (activeChart === 'price') {
      return priceData.sort((a, b) => Number(a.date) - Number(b.date));
    } else if (activeChart === 'mindshare') {
      return mindshareData.sort((a, b) => Number(a.date) - Number(b.date));
    } else {
      return marketCapData.sort((a, b) => Number(a.date) - Number(b.date));
    }
  };

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
   * @param timestamp
   * @returns
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
          className="p-3 rounded-lg"
          style={{
            backgroundColor: theme.baseBackground,
            border: `1px solid ${theme.sec_background}`,
          }}
        >
          <p className="text-textColor font-semibold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => {
            let value = entry.value;
            let name = entry.name;

            // For combined view, show original values
            if (activeChart === 'combined') {
              const originalKey = `${entry.dataKey}Original`;
              if (payload[0].payload[originalKey] !== undefined) {
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
              <p key={index} style={{ color: entry.color }}>
                {name}: {value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-background rounded-xl w-full flex flex-col p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Metrics Summary Column */}
        <div className="flex flex-col gap-y-3 md:w-2/5">
          <div className="flex flex-row gap-x-2">
            <h1 className="text-textColor text-2xl font-semibold">Metrics</h1>
            <Pill
              text={tokenSymbol}
              icon={<IoIosAnalytics size={18} />}
              color={theme.baseBackground}
              textColor={theme.secText}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Price</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.price ? formatNumber(metrics.price) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Market Cap</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.marketCap ? formatNumber(metrics.marketCap) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Liquidity</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.liquidity ? formatNumber(metrics.liquidity) : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">24h Volume</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.tradingVolume
                  ? formatNumber(metrics.tradingVolume)
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Holders</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.holders?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Mind Share</p>
              <p className="text-textColor text-2xl font-bold">{`${metrics?.mindShare?.toFixed(2) || 'N/A'}%`}</p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Avg. Impressions</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.avgImpressions?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Social Followers</p>
              <p className="text-textColor text-2xl font-bold">
                {metrics?.followers?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="flex flex-col gap-y-3 md:w-3/5">
          {/* Chart Tabs */}
          <div className="flex flex-row gap-x-2 flex-wrap">
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

          {/* Chart Area - Full height to match metrics area */}
          <div className="flex-grow" style={{ minHeight: '346px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getChartData()}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke={theme.secText}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke={theme.secText}
                />
                <YAxis
                  stroke={theme.secText}
                  domain={
                    activeChart === 'combined' ? [0, 100] : ['auto', 'auto']
                  }
                  tickFormatter={
                    activeChart === 'combined'
                      ? (value) => `${value}%` // Show as percentage for normalized data
                      : undefined // Default formatter for other charts
                  }
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Reference Lines for Min and Max (only for individual charts) */}
                {activeChart !== 'combined' && (
                  <>
                    <ReferenceLine
                      y={referenceValues[activeChart].min}
                      stroke="#FF5252" // Red for min
                      strokeDasharray="3 3"
                      label={{
                        value: `Min: ${formatReferenceLineLabel(
                          referenceValues[activeChart].min,
                          activeChart
                        )}`,
                        position: 'insideBottomLeft',
                        fill: '#FF5252',
                        fontSize: 12,
                      }}
                    />
                    <ReferenceLine
                      y={referenceValues[activeChart].max}
                      stroke="#69F0AE" // Green for max
                      strokeDasharray="3 3"
                      label={{
                        value: `Max: ${formatReferenceLineLabel(
                          referenceValues[activeChart].max,
                          activeChart
                        )}`,
                        position: 'insideTopLeft',
                        fill: '#69F0AE',
                        fontSize: 12,
                      }}
                    />
                  </>
                )}

                {activeChart === 'combined' ? (
                  <>
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Price"
                      stroke={getChartColor('price')}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="mindshare"
                      name="Mind Share"
                      stroke={getChartColor('mindshare')}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="marketCap"
                      name="Market Cap"
                      stroke={getChartColor('marketCap')}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={
                      activeChart.charAt(0).toUpperCase() + activeChart.slice(1)
                    }
                    stroke={getChartColor(activeChart)}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
