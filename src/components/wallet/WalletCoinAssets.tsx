import { useWalletHandler } from '../../models/WalletHandler.ts';
import { useEffect, useRef, useState } from 'react';
import { AgCharts } from 'ag-charts-react';
import { titleCase } from '../utils/titleCase.ts';
import { ArrowUpDown } from 'lucide-react';
import {
  CoinsSortDropDown,
  SortDirection,
  SortType,
} from './CoinsSortDropDown.tsx';
import { TokenAsset } from '../../types/wallet.ts';

const WalletCoinAssets = () => {
  const { walletAssets, status } = useWalletHandler();

  /**
   * Local state
   */
  const [chartData, setChartData] = useState<any[]>([]);
  const [coinSortOpen, setCoinSortOpen] = useState(false);
  const [tokens, setTokens] = useState<TokenAsset[]>(walletAssets.tokens);

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

  const handleTokenSorting = (
    sortType: SortType,
    direction: SortDirection,
    prioritizeSolana: boolean,
  ) => {
    let sortedTokens = [...walletAssets.tokens];

    // primary sorting
    sortedTokens.sort((a, b) => {
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

      return direction === SortDirection.ASCENDING
        ? compareValue
        : -compareValue;
    });
    if (prioritizeSolana) {
      sortedTokens.sort((a, b) =>
        a.symbol === 'SOL' ? -1 : b.symbol === 'SOL' ? 1 : 0,
      );
    }
    setTokens(sortedTokens);
  };

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
                theme: 'ag-polychroma-dark',
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
              'bg-background rounded-xl flex flex-row p-2 justify-between'
            }
          >
            <div
              className={
                'bg-baseBackground rounded-xl flex flex-row items-center p-2'
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
            onSortChange={handleTokenSorting}
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
