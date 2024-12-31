import React from 'react';
import {
  MessageCard,
  SingleCard,
  MultipleCards,
  NFTCard,
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
                    {nftCards.descirption}
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

          default:
            return null;
        }
      })}
    </div>
  );
};

export default MessageList;
