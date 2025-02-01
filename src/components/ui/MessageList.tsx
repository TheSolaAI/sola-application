import React, { Fragment, useState } from 'react';

import {
  BubblemapCard,
  LuloCard,
  MarketDataCard,
  MessageCard,
  NFTCard,
  NFTCollectionCard,
  RugCheckCard,
  SanctumCard,
  ShowLimitOrderCard,
  TokenCard,
  TopHolder,
  TransactionCard,
  TrendingNFTCard,
} from '../../types/messageCard';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Input,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Copy, ExternalLink, X } from 'lucide-react';
import axios from 'axios';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { tokenList } from '../../config/tokens/tokenMapping';
import { SwapParams } from '../../types/jupiter.ts';
import { responseToOpenai } from '../../lib/utils/response';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import RenderBlinks from './RenderBlinks';
import AgentTranscription from './AgentTransacriptions.tsx';
import MessageBox from './MessageBox.tsx';
import GridBox from './GridBox.tsx';
import { useWalletHandler } from '../../models/WalletHandler.ts';

const wallet_service_url = process.env.WALLET_SERVICE_URL;

interface Props {
  messageList: MessageCard[];
}

const MessageList: React.FC<Props> = ({ messageList }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sanctumAddress, setSanctumAddress] = useState<string>('');
  const [sanctumAmount, setSanctumAmount] = useState<string>('0');
  const [sanctumSymbol, setSanctumSymbol] = useState<string>('');
  const [sanctumApy, setSanctumApy] = useState<number>(0);
  const [link, setSolscanLink] = useState<string>('');
  const [expandedToken, setExpandedToken] = useState<string | null>(null); // Tracks which token is expanded
  const [bubbleMap, setBubbleMap] = useState<string | null>(null); // Tracks which token is expanded

  const handleExpand = (tokenAddress: string) => {
    setExpandedToken((prev) => (prev === tokenAddress ? null : tokenAddress));
  };
  const handleBubbleMap = (tokenAddress: string) => {
    setBubbleMap((prev) => (prev === tokenAddress ? null : tokenAddress));
  };
  let { currentWallet } = useWalletHandler();

  const rpc = process.env.SOLANA_RPC;
  function closeModal() {
    setIsOpen(false);
  }
  function openModal(symbol: any, address: any, apy: any) {
    setSanctumAddress(address);
    setSanctumSymbol(symbol);
    setSanctumApy(apy);
    setIsOpen(true);
  }
  async function invokeSwap(
    amount: string,
    address: string,
    solanaWallet: ConnectedSolanaWallet | null,
  ): Promise<any | null> {
    if (!rpc || !solanaWallet) {
      console.error('RPC URL is not defined');
      return null;
    }

    let fin_amount = Number(amount) * 10 ** tokenList.SOL.DECIMALS;
    // let wallet_balance = getAssetById(tokenList.SOL.MINT)?.balance
    // if (!wallet_balance) {
    //   setIsSufficient(false)
    //   return
    // }
    // if (fin_amount > wallet_balance) {
    //   console.log('Insufficient balance');
    //   return null;
    // }
    let params: SwapParams = {
      input_mint: tokenList.SOL.MINT,
      output_mint: address,
      public_key: solanaWallet.address,
      amount: fin_amount,
      swap_mode: 'EXACT_IN',
    };
    console.log(address);
    try {
      const response = await axios.post<any>(
        wallet_service_url + 'api/wallet/jup/swap',
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const swapTransaction = response.data['transaction'];
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);
      const connection = new Connection(rpc);
      const signedTransaction = await solanaWallet.signTransaction(transaction);
      const serializedTransaction = signedTransaction.serialize();

      const signature = await connection.sendRawTransaction(
        serializedTransaction,
      );
      const link = `https://solscan.io/tx/${signature}`;
      setSolscanLink(link);
      return responseToOpenai(
        `success fully swapped the LST. Ask what the user wants to do next`,
      );
    } catch (error) {
      console.error('Error during swap:', error);
      return null;
    }
  }
  function formatNumber(num: number) {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2).replace(/\.0$/, '') + 'B';
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(2).replace(/\.0$/, '') + 'K';
    } else {
      return num.toString();
    }
  }

  return (
    <div className="mx-2 md:py-4 md:px-24 w-full flex flex-col overflow-y-scroll no-scrollbar">
      {messageList.map((item, index) => {
        switch (item.type) {
          case 'aiTranscription':
            return <AgentTranscription item={item} index={index} />;

          case 'message':
            return <MessageBox item={item} index={index} />;

          case 'transaction': {
            const transactionCard = item.card as TransactionCard;
            return (
              <GridBox index={index} col={3}>
                <div className="flex p-4 bg-sec_background text-secText overflow-scroll">
                  <div>
                    <img src="/solscan.png" alt="solscan" className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">
                      {transactionCard.title}
                    </span>
                    <span>{transactionCard.status}</span>
                    <a
                      href={transactionCard.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View details on Solscan ↗
                    </a>
                  </div>
                </div>
              </GridBox>
            );
          }

          case 'agent':
            return (
              <div key={index} className="m-1 flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-bodydark2">{item.message}</span>
              </div>
            );

          case 'tokenCards': {
            const tokens = item.card as TokenCard[];
            return (
              <GridBox index={index} col={3}>
                {tokens.map((token, tIndex) => (
                  <div
                    key={tIndex}
                    className="p-2 rounded-lg bg-sec_background text-secText"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <img
                          src={token.image || '/placeholder.png'}
                          alt={token.metadata?.name || 'Token'}
                          className="h-fit rounded-lg bg-graydark"
                        />
                        <div>
                          <h3 className="truncate text-sm font-medium">
                            {token.metadata?.name || 'Unknown'}
                          </h3>
                          <p className="mt-1 text-xs font-medium">
                            ${token.price}
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              Number(token.priceChange) > 0
                                ? 'text-green-500'
                                : Number(token.priceChange) < 0
                                  ? 'text-red-500'
                                  : 'text-bodydark2'
                            }`}
                          >
                            {token.priceChange || 'Unknown'}%
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://dexscreener.com/solana/${token.address}`,
                            '_blank',
                          )
                        }
                        className="p-1 rounded-lg bg-sec_background hover:opacity-80 transition"
                      >
                        <ExternalLink className="w-4 h-4 text-primaryDark" />
                      </button>
                    </div>

                    <div className="flex flex-row gap-2 text-sm mt-2">
                      {[
                        { label: 'MC', value: token.marketCap },
                        { label: '24H Vol', value: token.volume },
                      ].map(({ label, value }, i) => (
                        <p key={i}>
                          {label}: ${formatNumber(Number(value)) || 'Unknown'}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </GridBox>
            );
          }
          case 'nftCollectionCard': {
            const nftCollectionCard = item.card as NFTCollectionCard;
            return (
              <div className="grid grid-cols-1 gap-6 my-4">
                <div className="flex w-fit items-center gap-3 dark:text-bodydark2">
                  <a
                    href={
                      'https://magiceden.io/marketplace/' +
                      nftCollectionCard.symbol
                    }
                    target="_blank"
                    className="flex gap-4"
                    rel="noreferrer"
                  >
                    <img
                      src={nftCollectionCard.image || '/placeholder.png'}
                      alt={nftCollectionCard.title || 'NFT NAME'}
                      className="h-22 w-22 rounded-lg  bg-graydark"
                    />

                    <div>
                      <h3 className="truncate text-large font-medium">
                        {nftCollectionCard.title || 'Unknown'}
                      </h3>
                      <p className={`mt-1 text-small font-medium`}>
                        ◎ {nftCollectionCard.price}
                      </p>
                      <p className="text-small text-bodydark2 mt-2">
                        Listed: {nftCollectionCard.listed || 'Unknown'}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            );
          }
          case 'luloCard': {
            const lulo = item.card as LuloCard;

            const tokenBalance = lulo.tokenBalance;

            return (
              <>
                <div className="mb-4 bg-[#F5F5F5] flex flex-row gap-4 p-3 rounded-lg leading-relaxed overflow-auto dark:bg-darkalign2 dark:text-bodydark2 no-scrollbar transition-opacity duration-500 opacity-100 transform">
                  <img
                    src="/lulo.png"
                    alt="luloimage"
                    className="h-16 rounded-sm"
                  />
                  <div>
                    <p className="text-base font-medium">
                      Deposit Value : {lulo.depositValue.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium">
                      Interest Earned : {lulo.interestEarned.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium">
                      Total Value : {lulo.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-4 dark:bg-darkalign2 dark:text-bodydark2">
                  {tokenBalance.map((token, tokenIndex) => (
                    <a
                      key={tokenIndex}
                      href={`https://dexscreener.com/solana/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-full overflow-hidden block rounded-xl bg-[#F5F5F5] border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            token.mint
                              ? `/${token.mint}.png`
                              : '/placeholder.png'
                          }
                          alt="Token"
                          className="h-10 w-10 rounded-lg "
                        />
                        <div>
                          <h3 className="truncate text-sm font-medium">
                            Balance : {token.balance.toFixed(2) || 'Unknown'}
                          </h3>
                          <p className={`mt-1 text-xs font-medium`}>
                            Mint : {token.mint.substring(0, 3)}...
                            {token.mint.slice(-3)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Value : {token.usdValue}
                      </p>
                    </a>
                  ))}
                </div>
              </>
            );
          }
          case 'nftcards': {
            const nftCards = item.card as NFTCard;
            return (
              <div
                key={index}
                className="mb-4 bg-graydark rounded-xl shadow-md overflow-hidden dark:bg-darkalign2 dark:text-bodydark2"
              >
                <img
                  src={nftCards.image}
                  alt={nftCards.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="p-4">
                  <h4 className="mb-2 text-lg font-semibold text-bodydark1">
                    {nftCards.title}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {nftCards.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-700 text-sm">
                      Price: {nftCards.price}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Size: {nftCards.size}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Date: {nftCards.date}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          case 'marketDataCard': {
            const marketdataCard = item.card as MarketDataCard;
            console.log(marketdataCard);
            return (
              <div
                key={index}
                className="mb-4 bg-graydark rounded-xl shadow-md overflow-hidden dark:bg-darkalign2 dark:text-bodydark2 p-4"
              >
                {/* Market Analysis Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Market Analysis
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {marketdataCard.marketAnalysis.map((analysis, idx) => (
                      <a
                        key={idx}
                        className="bg-gray-200 dark:bg-darkalign1 text-gray-800 dark:text-bodydark p-2 rounded-md text-sm font-medium"
                        href={analysis.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {analysis.text}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          case 'limitOrder': {
            const showLimitOrderCard = item.card as ShowLimitOrderCard;
            return (
              <div className="grid grid-cols-1 w-full sm:grid-cols-2 md:grid-cols-2 gap-4 my-4 rounded-xl dark:bg-darkalign2 dark:text-bodydark2">
                {showLimitOrderCard.orders.map((order, index) => (
                  <div
                    key={order.order_id}
                    className="group relative w-full overflow-hidden block  p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="truncate text-sm font-medium">
                          Order ID: {order.order_id}
                        </h3>
                        <p className="mt-1 text-xs font-medium">
                          Created At:{' '}
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Input Amount:{' '}
                        {(
                          parseFloat(order.input_amount) /
                          Math.pow(
                            10,
                            Object.entries(tokenList).find(
                              ([_, v]) => v.MINT === order.input_mint,
                            )![1].DECIMALS,
                          )
                        ).toFixed(
                          Object.entries(tokenList).find(
                            ([_, v]) => v.MINT === order.input_mint,
                          )![1].DECIMALS,
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Input Mint: {order.input_mint.substring(0, 3)}...
                        {order.input_mint.slice(-3)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Output Amount:{' '}
                        {(
                          parseFloat(order.output_amount) /
                          Math.pow(
                            10,
                            Object.entries(tokenList).find(
                              ([_, v]) => v.MINT === order.output_mint,
                            )![1].DECIMALS,
                          )
                        ).toFixed(
                          Object.entries(tokenList).find(
                            ([_, v]) => v.MINT === order.output_mint,
                          )![1].DECIMALS,
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Output Mint: {order.output_mint.substring(0, 3)}...
                        {order.output_mint.slice(-3)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          case 'sanctumCard': {
            const sanctumCards = item.card as SanctumCard[];
            console.log(sanctumCards);
            return (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3 my-4">
                {sanctumCards.map((sanctumCard, index) => (
                  <div
                    key={sanctumCard.symbol || index}
                    onClick={() => {
                      openModal(
                        sanctumCard.symbol,
                        sanctumCard.address,
                        sanctumCard.apy,
                      );
                    }}
                    className="group relative overflow-hidden block rounded-xl bg-[#F5F5F5] p-3 w-fit dark:bg-darkalign2 dark:text-bodydark2 transition-all duration-300 ease-in-out hover:bg-[#e0e0e0] hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={sanctumCard.logo_uri}
                        alt="sanctumimage"
                        className="h-16 rounded-sm"
                      />
                      <div>
                        <p className="text-base font-medium">
                          {sanctumCard.symbol}
                        </p>
                        <p className="text-sm font-small">
                          APY : {sanctumCard.apy.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <Transition appear show={isOpen} as={Fragment}>
                      <Dialog
                        as="div"
                        className="relative w-full h-full z-9999"
                        onClose={closeModal}
                      >
                        <TransitionChild
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <div className="fixed inset-0 bg-black bg-opacity-15" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                          <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                              as={Fragment}
                              enter="ease-out duration-100"
                              enterFrom="opacity-0 scale-95"
                              enterTo="opacity-100 scale-100"
                              leave="ease-in duration-100"
                              leaveFrom="opacity-100 scale-100"
                              leaveTo="opacity-0 scale-95"
                            >
                              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle
                                  as="h3"
                                  className="text-lg w-full font-medium flex items-center justify-between text-gray-900"
                                >
                                  <div>{sanctumSymbol} Swap Details</div>
                                  <button
                                    type="button"
                                    className="inline-flex justify-center rounder-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    onClick={closeModal}
                                  >
                                    <X />
                                  </button>
                                </DialogTitle>
                                <div className="mt-2">
                                  <p className="text-m text-gray-500">
                                    APY: {sanctumApy.toFixed(2)}% <br />
                                    {link && (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="no opener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        SolScan Transaction url
                                      </a>
                                    )}
                                  </p>
                                  <Input
                                    type="string"
                                    name="amount"
                                    className="mt-2 bg-grey-900 text-black border border-indigo-500 rounded-md"
                                    onChange={(e) =>
                                      setSanctumAmount(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="mt-4">
                                  <button
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    onClick={() => {
                                      invokeSwap(
                                        sanctumAmount,
                                        sanctumAddress,
                                        currentWallet,
                                      );
                                    }}
                                  >
                                    Swap
                                  </button>
                                </div>
                              </DialogPanel>
                            </TransitionChild>
                          </div>
                        </div>
                      </Dialog>
                    </Transition>
                  </div>
                ))}
              </div>
            );
          }
          case 'rugCheckCard': {
            const rugCheckCard = item.card as RugCheckCard;

            const issues = rugCheckCard?.issues || [];
            const scoreColor =
              issues.length === 0
                ? 'text-green-500'
                : issues.length === 1
                  ? 'text-yellow-500'
                  : issues.length === 2
                    ? 'text-orange-500'
                    : 'text-red-500';

            // Determine risk level color
            const getRiskColor = (level: 'warn' | 'danger' | 'none') => {
              switch (level) {
                case 'warn':
                  return 'text-orange-500';
                case 'danger':
                  return 'text-red-500';
                default:
                  return 'text-green-500';
              }
            };

            return (
              <div className="grid grid-cols-1 gap-2 my-4 bg-[#F5F5F5] rounded-lg p-4 dark:bg-darkalign2">
                {/* Display overall risk score */}
                <div className="flex items-center gap-3">
                  <h3 className={scoreColor}>
                    Risk Level: {rugCheckCard.score}
                  </h3>
                </div>

                {/* Display risk details */}
                <div className="flex flex-col gap-4 ">
                  {rugCheckCard.issues.length === 0 ? (
                    <p className="text-green-500 font-thin">No Risks Found</p>
                  ) : (
                    rugCheckCard.issues.map((risk, index) => (
                      <div
                        key={index}
                        className="bg-[#F5F5F5] p-4 rounded-lg shadow dark:bg-darkalign2"
                      >
                        <h4 className={`font-bold ${getRiskColor(risk.level)}`}>
                          {risk.name} ({risk.level})
                        </h4>
                        <p>{risk.description}</p>
                        {risk.value && (
                          <p className="font-thin">Value: {risk.value}</p>
                        )}
                        <p className="font-thin">Score: {risk.score}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          }
          case 'trendingNFTCard': {
            const trendingNFTCard = item.card as TrendingNFTCard[];
            return (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 gap-3 my-4">
                {trendingNFTCard.map((nftCards, tokenIndex) => (
                  <div
                    key={tokenIndex}
                    className="mb-4 bg-graydark rounded-xl shadow-md overflow-hidden dark:bg-darkalign2 dark:text-bodydark2"
                  >
                    <img
                      src={nftCards.image}
                      alt={nftCards.name}
                      className="h-56 object-cover rounded-lg"
                    />
                    <div className="p-4">
                      <h4 className="mb-4 text-lg font-semibold text-bodydark1 dark:text-bodydark2">
                        {nftCards.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2 ">
                        <p className="text-gray-700 text-sm dark:text-graydark">
                          Price: {nftCards.floor_price} ◎
                        </p>
                        <p className="text-gray-700 text-sm dark:text-graydark">
                          Listings: {nftCards.listed_count}
                        </p>
                        <p className="text-gray-700 text-sm dark:text-graydark">
                          1d: {nftCards.volume_24hr.toFixed(2)} ◎
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          case 'bubblemapCard': {
            const bubblemapCard = item.card as BubblemapCard;
            return (
              <div className="mb-4 h-100 bg-graydark rounded-xl shadow-md overflow-hidden dark:bg-darkalign2 dark:text-bodydark2">
                <iframe
                  src={`https://app.bubblemaps.io/sol/token/${bubblemapCard.token}`}
                  className="w-full h-full"
                />
              </div>
            );
          }
          case 'blinkCard': {
            const blink = item.link || '';
            return (
              <div className="p-4 flex w-full justify-center ">
                <RenderBlinks actionName={blink} />
              </div>
            );
          }
          case 'topHoldersCard': {
            const topHolders = item.card as TopHolder[];
            return (
              <div className=" rounded-lg p-4 my-4 shadow-md bg-[#F5F5F5] h-full dark:bg-darkalign2 dark:text-bodydark2">
                {' '}
                <h2 className="text-lg font-semibold mb-4 text-bodydark2">
                  Top Holders Information
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    {' '}
                    <thead>
                      <tr>
                        <th className="px-4 py-2 font-medium text-left uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-4 py-2 font-medium text-righ uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topHolders.map((value, index) => (
                        <tr key={index}>
                          {' '}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="truncate">
                                {value.owner.slice(0, 5)}...
                                {value.owner.slice(-5)}
                              </span>{' '}
                              <button
                                onClick={() => {
                                  window.open(
                                    `https://solscan.io/account/${value.owner}`,
                                    '_blank',
                                  );
                                }}
                                className="mx-4 text-xs font-medium rounded-lg hover:scale-105 hover:shadow-lg transition-all"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center whitespace-nowrap">
                            {formatNumber(value.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export default MessageList;
