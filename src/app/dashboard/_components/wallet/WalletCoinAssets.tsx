'use client';
import { useWalletHandler } from '@/store/WalletHandler';
import { useEffect, useRef, useState } from 'react';
import { titleCase } from '@/utils/titleCase';
import { LuArrowUpDown, LuPause, LuPlay } from 'react-icons/lu';
import {
  CoinsSortDropDown,
  SortDirection,
  SortType,
} from '@/app/dashboard/_components/wallet/CoinsSortDropDown';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { TokenAsset } from '@/types/wallet';
import { formatNumber } from '@/utils/formatNumber';
import Image from 'next/image';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#d0ed57',
  '#a4de6c',
  '#8dd1e1',
];

const WalletCoinAssets = () => {
  const {
    walletAssets,
    status,
    stopMonitoring,
    startMonitoring,
    currentWallet,
  } = useWalletHandler();

  /**
   * Local state
   */
  const [chartData, setChartData] = useState<any[]>([]);
  const [coinSortOpen, setCoinSortOpen] = useState(false);
  const [tokens, setTokens] = useState<TokenAsset[]>(walletAssets.tokens);
  const [sortType, setSortType] = useState<SortType>(SortType.TOTAL_PRICE);
  const [direction, setDirection] = useState<SortDirection>(
    SortDirection.ASCENDING
  );
  const [prioritizeSolana, setPrioritizeSolana] = useState<boolean>(false);

  const sortTokens = (tokensToSort: TokenAsset[]) => {
    return [...tokensToSort]
      .sort((a, b) => {
        let compareValue = 0;

        switch (sortType) {
          case SortType.TOTAL_PRICE:
            compareValue = a.totalPrice - b.totalPrice;
            break;
          case SortType.TOKEN_PRICE:
            compareValue =
              a.pricePerToken * a.decimals - b.pricePerToken * b.decimals;
            break;
        }

        // Apply ascending/descending sorting
        return direction === SortDirection.ASCENDING
          ? compareValue
          : -compareValue;
      })
      .sort((a, b) =>
        prioritizeSolana
          ? a.symbol === 'SOL'
            ? -1
            : b.symbol === 'SOL'
              ? 1
              : 0
          : 0
      );
  };

  // Automatically sort tokens when `walletAssets.tokens` or sorting parameters change
  useEffect(() => {
    setTokens(sortTokens(walletAssets.tokens));
  }, [walletAssets.tokens, sortType, direction, prioritizeSolana]);

  const updateSorting = (
    newSortType: SortType,
    newDirection: SortDirection,
    newPrioritizeSolana: boolean
  ) => {
    setSortType(newSortType);
    setDirection(newDirection);
    setPrioritizeSolana(newPrioritizeSolana);
  };

  /**
   * Refs
   */
  const coinSortRef = useRef<HTMLButtonElement>(null);

  /**
   * Converts the wallet Assets into Recharts format for the pie chart
   */
  useEffect(() => {
    const newChartData = walletAssets.tokens.map((token) => ({
      name: token.symbol,
      value: token.totalPrice,
    }));
    setChartData(newChartData);
  }, [walletAssets]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-sec_background p-3 rounded-lg border border-border shadow-lg">
          <p className="font-semibold text-textColor">{`${payload[0].name}`}</p>
          <p className="text-secText">{`${formatNumber(payload[0].value)} USDC`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Legend formatter
  const renderColorfulLegendText = (value: string) => {
    return <span className="text-textColor font-medium">{value}</span>;
  };

  return (
    <div className="flex flex-col gap-y-4 w-full transition-opacity duration-500">
      {walletAssets.tokens.length === 0 ? (
        <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg p-6 text-center">
          <p className="text-textColor font-medium">No tokens found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {/* Chart Section */}
          <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold text-textColor">
                Portfolio Distribution
              </h2>
            </div>

            <div className="p-4">
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={160}
                    innerRadius={115}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={renderColorfulLegendText}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Total Balance Section */}
            <div className="px-4 py-3 bg-surface/20 border-t border-border">
              <div className="flex flex-col items-center justify-center">
                <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                  Total Balance
                </label>
                <p className="text-textColor font-bold text-2xl">
                  {formatNumber(walletAssets.totalBalance ?? 0.0)} USDC
                </p>
              </div>
            </div>
          </div>

          {/* Status & Sort Controls */}
          <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-textColor">Assets</h2>

              <div className="flex items-center gap-x-2">
                <div className="flex items-center bg-surface/30 px-3 py-1 rounded-lg">
                  <span className="text-xs uppercase tracking-wider text-secText mr-2">
                    Status:
                  </span>
                  <div
                    className={`rounded-full w-3 h-3 mr-1 ${
                      status === 'listening'
                        ? 'bg-green-500'
                        : status === 'paused'
                          ? 'bg-yellow-500'
                          : status === 'updating'
                            ? 'bg-blue-500'
                            : status === 'error'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      status === 'listening'
                        ? 'text-green-500'
                        : status === 'paused'
                          ? 'text-yellow-500'
                          : status === 'updating'
                            ? 'text-blue-500'
                            : status === 'error'
                              ? 'text-red-500'
                              : 'text-gray-500'
                    }`}
                  >
                    {titleCase(status)}
                  </span>
                </div>

                {status === 'listening' || status === 'updating' ? (
                  <button
                    className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                    onClick={() => stopMonitoring()}
                  >
                    <LuPause className="w-5 h-5 text-secText" />
                  </button>
                ) : status === 'paused' ? (
                  <button
                    className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                    onClick={() => {
                      startMonitoring(currentWallet?.address || '', false);
                    }}
                  >
                    <LuPlay className="w-5 h-5 text-secText" />
                  </button>
                ) : null}

                <button
                  className="bg-surface/30 px-3 py-1 rounded-lg flex items-center gap-x-2 hover:bg-surface/50 transition-colors"
                  ref={coinSortRef}
                  onClick={() => setCoinSortOpen(true)}
                >
                  <span className="text-xs uppercase tracking-wider text-secText">
                    Sort
                  </span>
                  <LuArrowUpDown className="w-4 h-4 text-secText" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-3">
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    className={`bg-surface/30 rounded-lg p-3 flex items-center ${
                      token.symbol === 'SOL'
                        ? 'border-l-4 border-primaryDark'
                        : ''
                    }`}
                  >
                    {token.imageLink && (
                      <div className="mr-3">
                        <img
                          src={token.imageLink}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col">
                        <h3 className="text-textColor font-medium">
                          {token.name}{' '}
                          <span className="text-secText">({token.symbol})</span>
                        </h3>
                        <span className="text-secText text-sm">
                          ${formatNumber(token.pricePerToken)} USD
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-textColor font-medium">
                        {formatNumber(token.totalPrice)} USDC
                      </div>
                      <div className="text-secText text-sm">
                        {formatNumber(token.balance)} {token.symbol}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CoinsSortDropDown
            isOpen={coinSortOpen}
            onClose={() => setCoinSortOpen(false)}
            anchorEl={coinSortRef.current!}
            onSortChange={updateSorting}
          />
        </div>
      )}
    </div>
  );
};

export default WalletCoinAssets;
