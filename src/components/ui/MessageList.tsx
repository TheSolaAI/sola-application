import React from 'react';
import {
  MessageCard,
  SingleCard,
  MultipleCards,
  NFTCard,
  TokenCard,
  TransactionCard,
} from '../../types/messageCard';

interface Props {
  messageList: MessageCard[];
}

const MessageList: React.FC<Props> = ({ messageList }) => {
  const formatHoldersCount = (count: number | undefined): string => {
    if (!count) return 'Unknown';
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  const formatListedTime = (date: string | undefined): string => {
    if (!date) return 'Unknown';
    const difference = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
    return difference > 0 ? `${difference} days ago` : 'Today';
  };

  return (
    <div className="p-4 rounded-lg text-bodydark1 w-3/5">
      {messageList.map((item, index) => {
        switch (item.type) {
          case 'message':
            return (
              <div key={index} className="mb-4 bg-[#F5F5F5] p-3 rounded-lg">
                {item.message}
                {item.link && (
                  <a href={item.link} className="text-blue-400">
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
                className="mb-4 bg-[#F5F5F5] border rounded-lg p-4"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {singleCard.title}
                </h4>
                <p className="text-gray-400">
                  Status: {singleCard.status || 'Unknown'} <br />
                  Date: {singleCard.date}
                </p>
              </div>
            );

          case 'cards':
            const multipleCards = item.card as MultipleCards;
            return (
              <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                {multipleCards.map((subCard, subIndex) => (
                  <div
                    key={subIndex}
                    className="bg-[#F5F5F5] rounded-lg p-3 text-center"
                  >
                    {subCard.metric}: {subCard.value}
                  </div>
                ))}
              </div>
            );

          case 'nftcards':
            const nftCards = item.card as NFTCard[];
            return nftCards.map((nftCard, nftIndex) => (
              <div
                key={nftIndex}
                className="mb-4 bg-graydark rounded-xl shadow-md overflow-hidden"
              >
                <img
                  src={nftCard.image}
                  alt={nftCard.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="mb-2 text-lg font-semibold">
                    {nftCard.title}
                  </h4>
                  <p className="text-gray-500 text-sm">{nftCard.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-700 text-sm">
                      Price: {nftCard.price}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Size: {nftCard.size}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Date: {nftCard.date}
                    </p>
                  </div>
                </div>
              </div>
            ));

          case 'tokenCards':
            const tokens = item.card as TokenCard[];
            return (
              <div key={index} className="grid gap-4">
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
                        alt={token.name}
                        className="h-10 w-10 rounded-lg bg-gray-200"
                      />
                      <div>
                        <h3 className="truncate text-sm font-medium">
                          {token.name}
                        </h3>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            token.change >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {token.change.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Market Cap: {token.marketCap || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Holders: {formatHoldersCount(token.holdersCount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Listed: {formatListedTime(token.listedAt)}
                    </p>
                  </a>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default MessageList;
