'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LuArrowUp, LuArrowDown, LuUsers, LuWallet } from 'react-icons/lu';
import { formatNumber } from '@/utils/formatNumber';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { TopHolder } from '@/types/messageCard';

interface TokenCardProps {
  marketCap: number;
  fdv: number;
  liquidity: number;
  priceChange30mPercent: number;
  priceChange1hPercent: number;
  priceChange4hPercent: number;
  priceChange24hPercent: number;
  uniqueWallet30m: number;
  uniqueWallet1h: number;
  uniqueWallet4h: number;
  uniqueWallet24h: number;
  holder: number;
  sell30m: number;
  buy30m: number;
  vBuy30mUSD: number;
  vSell30mUSD: number;
  sell1h: number;
  buy1h: number;
  vBuy1hUSD: number;
  vSell1hUSD: number;
  sell4h: number;
  buy4h: number;
  vBuy4hUSD: number;
  vSell4hUSD: number;
  sell24h: number;
  buy24h: number;
  vBuy24hUSD: number;
  vSell24hUSD: number;
  topHolders?: TopHolder[];
  tokenSymbol?: string;
}

type TimeFrame = '30m' | '1h' | '4h' | '24h';

export const TokenMetricsCard: React.FC<TokenCardProps> = (props) => {
  /**
   * Local State
   */
  const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>('24h');

  /**
   * Global State
   */
  const { theme } = useThemeManager();

  // Format percentage with + or - sign
  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(2);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  // Prepare normalized transaction data for the selected time frame
  const getNormalizedTransactionData = () => {
    let buyCount = 0;
    let sellCount = 0;
    let buyVolume = 0;
    let sellVolume = 0;

    switch (activeTimeFrame) {
      case '30m':
        buyCount = props.buy30m;
        sellCount = props.sell30m;
        buyVolume = props.vBuy30mUSD;
        sellVolume = props.vSell30mUSD;
        break;
      case '1h':
        buyCount = props.buy1h;
        sellCount = props.sell1h;
        buyVolume = props.vBuy1hUSD;
        sellVolume = props.vSell1hUSD;
        break;
      case '4h':
        buyCount = props.buy4h;
        sellCount = props.sell4h;
        buyVolume = props.vBuy4hUSD;
        sellVolume = props.vSell4hUSD;
        break;
      case '24h':
      default:
        buyCount = props.buy24h;
        sellCount = props.sell24h;
        buyVolume = props.vBuy24hUSD;
        sellVolume = props.vSell24hUSD;
        break;
    }

    const totalCount = buyCount + sellCount;
    const totalVolume = buyVolume + sellVolume;

    // Avoid division by zero
    const countData =
      totalCount === 0
        ? { buyRatio: 0, sellRatio: 0 }
        : {
            buyRatio: buyCount / totalCount,
            sellRatio: sellCount / totalCount,
          };

    const volumeData =
      totalVolume === 0
        ? { buyVolumeRatio: 0, sellVolumeRatio: 0 }
        : {
            buyVolumeRatio: buyVolume / totalVolume,
            sellVolumeRatio: sellVolume / totalVolume,
          };

    return [
      {
        name: 'Count',
        ...countData,
        buyCount,
        sellCount,
        totalCount,
      },
      {
        name: 'Volume',
        ...volumeData,
        buyVolume,
        sellVolume,
        totalVolume,
      },
    ];
  };

  // Prepare unique wallets data for all time frames
  const walletData = [
    { name: '30m', wallets: props.uniqueWallet30m },
    { name: '1h', wallets: props.uniqueWallet1h },
    { name: '4h', wallets: props.uniqueWallet4h },
    { name: '24h', wallets: props.uniqueWallet24h },
  ];

  // Prepare price change data
  const priceChangeData = [
    { name: '30m', change: props.priceChange30mPercent },
    { name: '1h', change: props.priceChange1hPercent },
    { name: '4h', change: props.priceChange4hPercent },
    { name: '24h', change: props.priceChange24hPercent },
  ];

  // Custom tooltip for transaction chart
  const TransactionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      if (data.name === 'Count') {
        return (
          <div className="bg-background p-3 rounded-lg border border-sec_background">
            <p className="text-textColor font-semibold">Transaction Count</p>
            <p className="text-green-500">
              Buy: {data.buyCount} ({(data.buyRatio * 100).toFixed(1)}%)
            </p>
            <p className="text-red-500">
              Sell: {data.sellCount} ({(data.sellRatio * 100).toFixed(1)}%)
            </p>
            <p className="text-textColor">Total: {data.totalCount}</p>
          </div>
        );
      } else {
        return (
          <div className="bg-background p-3 rounded-lg border border-sec_background">
            <p className="text-textColor font-semibold">Transaction Volume</p>
            <p className="text-green-500">
              Buy: {formatNumber(data.buyVolume)} (
              {(data.buyVolumeRatio * 100).toFixed(1)}%)
            </p>
            <p className="text-red-500">
              Sell: {formatNumber(data.sellVolume)} (
              {(data.sellVolumeRatio * 100).toFixed(1)}%)
            </p>
            <p className="text-textColor">
              Total: {formatNumber(data.totalVolume)}
            </p>
          </div>
        );
      }
    }
    return null;
  };

  // Create top holders pie chart data
  const topHoldersData = props.topHolders || [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="bg-background rounded-xl w-full flex flex-col p-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h1 className="text-textColor text-2xl font-semibold">Token Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Key Metrics & Price Changes */}
        <div className="flex flex-col gap-4">
          {/* Key Metrics */}
          <div className="bg-sec_background rounded-lg p-4">
            <h2 className="text-secText text-lg mb-3">Key Metrics</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Market Cap</p>
                <p className="text-textColor text-xl font-bold">
                  {formatNumber(props.marketCap)}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Fully Diluted Value</p>
                <p className="text-textColor text-xl font-bold">
                  {formatNumber(props.fdv)}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Liquidity</p>
                <p className="text-textColor text-xl font-bold">
                  {formatNumber(props.liquidity)}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-secText text-sm">Holders</p>
                  <p className="text-textColor text-xl font-bold">
                    {props.holder.toLocaleString()}
                  </p>
                </div>
                <LuUsers className="text-secText" size={24} />
              </div>
            </div>
          </div>

          {/* Price Changes */}
          <div className="bg-sec_background rounded-lg p-4 h-full">
            <h2 className="text-secText text-lg mb-3">Price Changes</h2>
            <div className="grid grid-cols-2 gap-3">
              {priceChangeData.map((item) => (
                <div
                  key={item.name}
                  className="bg-background rounded-lg p-3 flex items-center justify-between"
                >
                  <p className="text-secText text-sm">{item.name}</p>
                  <div className="flex items-center">
                    {item.change >= 0 ? (
                      <LuArrowUp size={16} className="text-green-500 mr-1" />
                    ) : (
                      <LuArrowDown size={16} className="text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-xl font-bold ${
                        item.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {formatPercentage(item.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Holders */}
          {props.topHolders && props.topHolders.length > 0 && (
            <div className="bg-sec_background rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-secText text-lg">Top Holders</h2>
                <LuWallet size={18} className="text-secText" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topHoldersData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="address"
                      label={({ address, percentage }) =>
                        `${percentage.toFixed(1)}%`
                      }
                    >
                      {topHoldersData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(2)}%`,
                        'Percentage',
                      ]}
                      labelFormatter={(label) => `Address: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Transaction Activity & Unique Wallets */}
        <div className="flex flex-col gap-4">
          {/* Transaction Activity */}
          <div className="bg-sec_background rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-3">
              <h2 className="text-secText text-lg">Transaction Activity</h2>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Pill
                  text="30m"
                  color={
                    activeTimeFrame === '30m'
                      ? theme.primaryDark
                      : theme.sec_background
                  }
                  textColor={
                    activeTimeFrame === '30m' ? theme.textColor : theme.secText
                  }
                  hoverable
                  onClick={() => setActiveTimeFrame('30m')}
                />
                <Pill
                  text="1h"
                  color={
                    activeTimeFrame === '1h'
                      ? theme.primaryDark
                      : theme.sec_background
                  }
                  textColor={
                    activeTimeFrame === '1h' ? theme.textColor : theme.secText
                  }
                  hoverable
                  onClick={() => setActiveTimeFrame('1h')}
                />
                <Pill
                  text="4h"
                  color={
                    activeTimeFrame === '4h'
                      ? theme.primaryDark
                      : theme.sec_background
                  }
                  textColor={
                    activeTimeFrame === '4h' ? theme.textColor : theme.secText
                  }
                  hoverable
                  onClick={() => setActiveTimeFrame('4h')}
                />
                <Pill
                  text="24h"
                  color={
                    activeTimeFrame === '24h'
                      ? theme.primaryDark
                      : theme.sec_background
                  }
                  textColor={
                    activeTimeFrame === '24h' ? theme.textColor : theme.secText
                  }
                  hoverable
                  onClick={() => setActiveTimeFrame('24h')}
                />
              </div>
            </div>

            {/* Transaction Activity Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  width={500}
                  height={300}
                  data={getNormalizedTransactionData()}
                  stackOffset="none"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    color={theme.border}
                    opacity={0.3}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip content={<TransactionTooltip />} />
                  <Bar
                    dataKey="buyRatio"
                    name="Buy Count"
                    stackId="count"
                    fill="#4CAF50"
                    hide={false}
                  />
                  <Bar
                    dataKey="sellRatio"
                    name="Sell Count"
                    stackId="count"
                    fill="#F44336"
                    hide={false}
                  />
                  <Bar
                    dataKey="buyVolumeRatio"
                    name="Buy Volume"
                    stackId="volume"
                    fill="#4CAF50"
                    hide={false}
                  />
                  <Bar
                    dataKey="sellVolumeRatio"
                    name="Sell Volume"
                    stackId="volume"
                    fill="#F44336"
                    hide={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Transaction Count and Volume Summary */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Buy Transactions</p>
                <p className="text-green-500 text-xl font-bold">
                  {activeTimeFrame === '30m'
                    ? props.buy30m
                    : activeTimeFrame === '1h'
                      ? props.buy1h
                      : activeTimeFrame === '4h'
                        ? props.buy4h
                        : props.buy24h}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Sell Transactions</p>
                <p className="text-red-500 text-xl font-bold">
                  {activeTimeFrame === '30m'
                    ? props.sell30m
                    : activeTimeFrame === '1h'
                      ? props.sell1h
                      : activeTimeFrame === '4h'
                        ? props.sell4h
                        : props.sell24h}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Buy Volume</p>
                <p className="text-green-500 text-xl font-bold">
                  {formatNumber(
                    activeTimeFrame === '30m'
                      ? props.vBuy30mUSD
                      : activeTimeFrame === '1h'
                        ? props.vBuy1hUSD
                        : activeTimeFrame === '4h'
                          ? props.vBuy4hUSD
                          : props.vBuy24hUSD
                  )}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-secText text-sm">Sell Volume</p>
                <p className="text-red-500 text-xl font-bold">
                  {formatNumber(
                    activeTimeFrame === '30m'
                      ? props.vSell30mUSD
                      : activeTimeFrame === '1h'
                        ? props.vSell1hUSD
                        : activeTimeFrame === '4h'
                          ? props.vSell4hUSD
                          : props.vSell24hUSD
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Unique Wallets Activity */}
          <div className="bg-sec_background rounded-lg p-4">
            <h2 className="text-secText text-lg mb-1">
              Unique Wallets Activity
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={walletData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    opacity={0.5}
                  />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="wallets" name="Unique Wallets" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
