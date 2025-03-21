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
import useThemeManager from '@/store/ThemeManager';
import { formatNumber } from '@/utils/formatNumber';

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
  const { theme } = useThemeManager();

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
        <div className="bg-baseBackground p-2 rounded-lg border border-gray-300">
          <p className="font-semibold">{`${payload[0].name}`}</p>
          <p className="text-secText">{`${formatNumber(payload[0].value)} USDC`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Legend formatter
  const renderColorfulLegendText = (value: string) => {
    return <span className="text-textColor">{value}</span>;
  };

  return (
    <div className="text-textColor flex flex-col">
      {walletAssets.tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <div className={'flex flex-col gap-y-2'}>
          {/* Main Content Start*/}
          {/* Chart Section Start*/}
          <div className="bg-background rounded-xl">
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

            {/* Total Balance Section Below Chart */}
            <div className="flex flex-col items-center justify-center py-4">
              <h2 className="text-textColor font-bold text-lg">
                Total Balance
              </h2>
              <p className="text-textColor font-bold text-2xl">
                {formatNumber(walletAssets.totalBalance ?? 0.0)} USDC
              </p>
            </div>
          </div>
          {/* Chart Section End*/}
          {/* Status Bar Section Start*/}
          <div
            className={
              'bg-background rounded-xl flex flex-row p-2 justify-between items-center'
            }
          >
            <div
              className={
                'bg-baseBackground rounded-xl flex flex-row items-center p-2 justify-center'
              }
            >
              <h1 className="text-textColor font-semibold text-lg">Status:</h1>
              <div
                className={`rounded-full w-4 h-4 ml-2 ${
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
              <p
                className={`font-medium ml-1 ${
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
              </p>
              {status === 'listening' || status === 'updating' ? (
                <button className={'ml-3'} onClick={() => stopMonitoring()}>
                  <LuPause className={'w-6 h-6 text-secText '} />
                </button>
              ) : status === 'paused' ? (
                <button
                  className={'ml-3'}
                  onClick={() => {
                    startMonitoring(currentWallet?.address!, false);
                  }}
                >
                  <LuPlay className={'w-6 h-6 text-secText '} />
                </button>
              ) : null}
            </div>

            <button
              className={
                'bg-baseBackground rounded-xl flex flex-row justify-between items-center p-2 gap-x-2 px-4'
              }
              ref={coinSortRef}
              onClick={() => setCoinSortOpen(true)}
            >
              <h1 className={'text-secText font-medium text-lg'}>Sort</h1>
              <LuArrowUpDown className={'w-6 h-6 text-secText'} />
            </button>
          </div>
          {/*Status Bar Section End*/}
          <CoinsSortDropDown
            isOpen={coinSortOpen}
            onClose={() => setCoinSortOpen(false)}
            anchorEl={coinSortRef.current!}
            onSortChange={updateSorting}
          />
          <div className="flex flex-col gap-2">
            {tokens.map((token, index) => (
              <div
                key={index}
                className={`bg-background rounded-xl w-full flex flex-row items-center p-3 gap-2 ${token.symbol === 'SOL' ? 'border-primaryDark border-[1px]' : ''}`}
              >
                <img
                  src={token.imageLink}
                  alt="token"
                  className="w-8 h-8 rounded-xl"
                />
                <div className="flex flex-col items-start flex-1">
                  <h1 className="text-textColor font-semibold text-lg">
                    {token.name}({token.symbol})
                  </h1>
                  <h1 className="text-secText font-regular text-s">
                    ${formatNumber(token.pricePerToken)} USD
                  </h1>
                </div>
                <div className={'flex flex-col items-end'}>
                  <h1 className="text-lg text-textColor font-medium">
                    {formatNumber(token.totalPrice)} USDC
                  </h1>
                  <h1 className="text-secText font-regular text-s">
                    {formatNumber(token.balance)} {token.symbol}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCoinAssets;
