import React from 'react';
import {
  MessageCard,
  SingleCard,
  MultipleCards,
  NFTCard,
  TransactionCard,
  TokenCard,
  LuloCard,
  SanctumCard,
} from '../../types/messageCard';

interface Props {
  messageList: MessageCard[];
}

const MessageList: React.FC<Props> = ({ messageList }) => {
  return (
    <div className="p-4 rounded-lg text-bodydark1 w-3/5 ">
      {messageList.map((item, index) => {
        switch (item.type) {
          case 'message':
            return (
              <div
                key={index}
                className="mb-4 bg-[#F5F5F5] p-3 rounded-lg text-bodydark1 leading-relaxed overflow-auto no-scrollbar transition-opacity duration-500 opacity-100 transform"
              >
                {item.message}
                {item.link && (
                  <a href={`${item.link}`} className="text-blue-400">
                    Solscan Link
                  </a>
                )}
              </div>
            );

          case 'transaction':
            const transactionCard = item.card as TransactionCard;
            return (
              <div
                key={index}
                className="flex items-center justify-between mb-4 p-4 bg-[#F5F5F5] border rounded-lg"
              >
                <div>
                  <h4 className="text-lg font-semibold">
                    {transactionCard.title}
                  </h4>
                  <p className="text-xs">
                    Confirmation : {transactionCard.status}
                  </p>
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
            );

          case 'card':
            const singleCard = item.card as SingleCard;
            return (
              <div
                key={index}
                className="mb-4 bg-[#F5F5F5] border rounded-lg p-4 shadow-md overflow-auto no-scrollbar transition-opacity duration-500 opacity-100 transform"
              >
                <h4 className="mb-2 text-lg font-semibold text-bodydark1">
                  {singleCard.title}
                </h4>
                <p className="text-gray-400">
                  Status: {singleCard.status} <br />
                  Date: {singleCard.date}
                </p>
              </div>
            );

          case 'cards':
            const multipleCards = item.card as MultipleCards;
            return (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 mb-4 overflow-auto no-scrollbar transition-opacity duration-500 opacity-100 transform"
              >
                {multipleCards.map((subCard, subIndex) => (
                  <div
                    key={subIndex}
                    className="bg-[#F5F5F5] rounded-lg p-3 text-center shadow-sm text-bodydark1"
                  >
                    {subCard.metric}: {subCard.value}
                  </div>
                ))}
              </div>
            );

          case 'agent':
            return (
              <div key={index} className="mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-bodydark2">{item.message}</span>
              </div>
            );

          case 'tokenCards':
            const tokens = item.card as TokenCard[];
            return (
              <div className="grid grid-cols-1 gap-6 my-4">
                {tokens.map((token, tokenIndex) => (
                  <a
                    key={tokenIndex}
                    href={`https://dexscreener.com/solana/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block rounded-xl bg-[#F5F5F5] border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={token.image || '/placeholder.png'}
                        alt={token.metadata?.name || 'Token'}
                        className="h-10 w-10 rounded-lg  bg-graydark"
                      />
                      <div>
                        <h3 className="truncate text-sm font-medium">
                          {token.metadata?.name || 'Unknown'}
                        </h3>
                        <p className={`mt-1 text-xs font-medium`}>
                          $ {token.price}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-bodydark2 mt-2">
                      Market Cap: $ {token.marketCap || 'Unknown'}
                    </p>
                    <div className="bg-bodydark flex justify-center items-center h-fit m-2">
                      <div className="w-full max-w-4xl h-52 bg-white shadow-lg rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.gmgn.cc/kline/sol/${token.address}`}
                          className="w-full h-full"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            );

          case 'luloCard':
            const lulo = item.card as LuloCard;

            const tokenBalance = lulo.tokenBalance;

            return (
              <>
                <div className="mb-4 bg-[#F5F5F5] flex flex-row gap-4 p-3 rounded-lg leading-relaxed overflow-auto no-scrollbar transition-opacity duration-500 opacity-100 transform">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-4">
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
                          src={`/${token.mint}.png` || '/placeholder.png'}
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
          case 'nftcards':
            const nftCards = item.card as NFTCard;
            return (
              <div
                key={index}
                className="mb-4 bg-graydark rounded-xl shadow-md overflow-hidden"
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

          case 'sanctumCard':
            const sanctumCard = item.card as SanctumCard;
            return (
              <a
                href={sanctumCard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-xl bg-[#F5F5F5] border p-3 w-fit "
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sanctumCard.logo}
                    alt="sanctumimage"
                    className="h-16 rounded-sm"
                  />
                  <div>
                    <p className="text-base font-medium">
                      Symbol : {sanctumCard.symbol}
                    </p>
                    <p className="text-sm font-thin">
                      APY : {sanctumCard.apy}%
                    </p>
                  </div>
                </div>
              </a>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default MessageList;
