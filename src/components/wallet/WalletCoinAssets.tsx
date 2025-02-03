import { useWalletHandler } from '../../models/WalletHandler.ts';
import { useEffect, useRef, useState } from 'react';
import { AgCharts } from 'ag-charts-react';
import { titleCase } from '../utils/titleCase.ts';
import { ArrowUpDown, PauseIcon, PlayIcon } from 'lucide-react';
import {
  CoinsSortDropDown,
  SortDirection,
  SortType,
} from './CoinsSortDropDown.tsx';
import { TokenAsset } from '../../types/wallet.ts';
import useThemeManager from '../../models/ThemeManager.ts';

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
    SortDirection.ASCENDING,
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
          : 0,
      );
  };

  // Automatically sort tokens when `walletAssets.tokens` or sorting parameters change
  useEffect(() => {
    setTokens(sortTokens(walletAssets.tokens));
  }, [walletAssets.tokens, sortType, direction, prioritizeSolana]);

  const updateSorting = (
    newSortType: SortType,
    newDirection: SortDirection,
    newPrioritizeSolana: boolean,
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
   * Converts the wallet Assets into AGT chart format for the pie chart
   */
  useEffect(() => {
    setChartData([]);
    walletAssets.tokens.forEach((token) => {
      setChartData((prev) => [
        ...prev,
        {
          token: token.symbol,
          amount: token.totalPrice,
        },
      ]);
    });
  }, [walletAssets]);

  return (
    <div className="text-textColor flex flex-col">
      {walletAssets.tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <div className={'flex flex-col gap-y-2'}>
          <div className="bg-background rounded-xl">
            <AgCharts
              style={{ height: '500px' }}
              options={{
                data: chartData,
                theme:
                  theme.baseTheme === 'dark'
                    ? 'ag-polychroma-dark'
                    : 'ag-polychroma',
                series: [
                  {
                    title: {
                      text: 'Wallet Assets',
                    },
                    type: 'donut',
                    calloutLabelKey: 'token',
                    angleKey: 'amount',
                    innerRadiusRatio: 0.7,
                    innerLabels: [
                      {
                        text: 'Total Balance',
                        fontWeight: 'bold',
                        spacing: 10,
                      },
                      {
                        text: walletAssets.totalBalance?.toPrecision(10),
                        fontWeight: 'bold',
                        fontSize: 20,
                      },
                    ],
                  },
                ],
                background: {
                  visible: false,
                },
              }}
            />
          </div>
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
                  <PauseIcon className={'w-6 h-6 text-secText '} />
                </button>
              ) : status === 'paused' ? (
                <button
                  className={'ml-3'}
                  onClick={() => {
                    startMonitoring(currentWallet?.address!, false);
                  }}
                >
                  <PlayIcon className={'w-6 h-6 text-secText '} />
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
              <ArrowUpDown className={'w-6 h-6 text-secText'} />
            </button>
          </div>
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
                    @ {token.pricePerToken} USD
                  </h1>
                </div>
                <div className={'flex flex-col items-end'}>
                  <h1 className="text-lg text-textColor font-medium">
                    {token.totalPrice.toPrecision(6)} USDC
                  </h1>
                  <h1 className="text-secText font-regular text-s">
                    {token.balance} {token.symbol}
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
