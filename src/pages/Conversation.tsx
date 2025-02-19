import { SessionControls } from '../components/SessionControls.tsx';
import { useChatRoomHandler } from '../models/ChatRoomHandler.ts';
import React, { useEffect } from 'react';
import { ChatRoom } from '../types/chatRoom.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { SimpleMessageChatItem } from '../components/ui/message_items/SimpleMessageChatItem.tsx';
import { ChatContentType, ChatItem } from '../types/chatItem.ts';
import { useLayoutContext } from '../layout/LayoutProvider.tsx';
import useThemeManager from '../models/ThemeManager.ts';
import { hexToRgb } from '../utils/hexToRGB.ts';
import { TokenDataMessageItem } from '../components/ui/message_items/TokenDataMessageItem.tsx';
import { BubbleMapChatItem } from '../components/ui/message_items/BubbleMapCardItem.tsx';
import { SwapChatItem } from '../components/ui/message_items/SwapMessageItem.tsx';
import { ShowLSTDataChatItem } from '../components/ui/message_items/LSTCardItem.tsx';
import { RugCheckChatItem } from '../components/ui/message_items/RugCheckMessageItem.tsx';
import { MarketDataChatItem } from '../components/ui/message_items/MarketDataMessageItem.tsx';
import { ShowLimitOrdersChatItem } from '../components/ui/message_items/ShowLimitOrderChatItem.tsx';
import { TransactionDataMessageItem } from '../components/ui/message_items/TransactionCard.tsx';
import { LuloChatItem } from '../components/ui/message_items/LuloMessageItem.tsx';
import { TopHoldersMessageItem } from '../components/ui/message_items/TopHoldersMessageItem.tsx';
import { AudioPlayerMessageItem } from '../components/ui/message_items/AudioPlayerMessageItem.tsx';
import { NFTCollectionMessageItem } from '../components/ui/message_items/NFTCollectionCardItem.tsx';
import { TrendingNFTMessageItem } from '../components/ui/message_items/TrendingNFTMessageItem.tsx';
import { AiProjects } from '../components/ui/message_items/AiProjects.tsx';

const Conversation = () => {
  const navigate = useNavigate();
  const { theme } = useThemeManager();
  const { audioIntensity } = useLayoutContext();

  const primaryRGB = hexToRgb(theme.primary);
  const primaryDarkRGB = hexToRgb(theme.primaryDark);

  /**
   * Global state
   */
  const { setCurrentChatRoom, rooms, allRoomsLoaded } = useChatRoomHandler();
  const { messages, currentChatItem } = useChatMessageHandler();

  /**
   * Current Route
   */
  const pathParts = window.location.pathname.split('/');
  const chatRoomId = pathParts[pathParts.length - 1];

  useEffect(() => {
    if (chatRoomId && allRoomsLoaded) {
      const numericChatRoomId = Number(chatRoomId); // Convert to number
      if (!isNaN(numericChatRoomId)) {
        // isNan check before find
        const foundRoom = rooms.find(
          (room: ChatRoom) => room.id === numericChatRoomId,
        );
        if (foundRoom) {
          setCurrentChatRoom(foundRoom);
        } else {
          toast.error('Chat not Found');
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [chatRoomId, allRoomsLoaded]);

  /**
   * The primary render function. If provided a chatItem, it returns the React component that should be rendered
   */
  const renderMessageItem = (
    chatItem: ChatItem<ChatContentType>,
    index: number,
  ): React.ReactNode => {
    if (!chatItem) return null;

    const { type } = chatItem.content;

    if (type === 'simple_message') {
      return <SimpleMessageChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'user_audio_chat') {
      return <AudioPlayerMessageItem key={index} props={chatItem.content} />;
    }
    if (type === 'token_data') {
      return <TokenDataMessageItem key={index} props={chatItem.content} />;
    }
    if (type === 'bubble_map') {
      return <BubbleMapChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'swap') {
      return <SwapChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'get_lst_data') {
      return <ShowLSTDataChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'rug_check') {
      return <RugCheckChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'market_data') {
      return <MarketDataChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'get_limit_order') {
      return <ShowLimitOrdersChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'top_holders') {
      return <TopHoldersMessageItem key={index} props={chatItem.content} />;
    }
    if (type === 'user_lulo_data') {
      return <LuloChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'transaction_message') {
      return (
        <TransactionDataMessageItem key={index} props={chatItem.content} />
      );
    }
    if (type === 'transfer_sol') {
      return (
        <TransactionDataMessageItem key={index} props={chatItem.content} />
      );
    }
    if (type === 'transfer_spl') {
      return (
        <TransactionDataMessageItem key={index} props={chatItem.content} />
      );
    }
    if (type === 'nft_collection_data') {
      return <NFTCollectionMessageItem key={index} props={chatItem.content} />;
    }
    if (type === 'get_trending_nfts') {
      return <TrendingNFTMessageItem key={index} props={chatItem.content} />;
    }
    if (type === 'ai_projects_classification') {
      return <AiProjects key={index} props={chatItem.content} />;
    }

    return null; // Prevent rendering an empty fragment
  };

  return (
    <div className="relative flex flex-col w-full h-screen">
      {/* Messages Container (Scrollable) */}
      <div className="flex-1 mt-12 max-h-[80vh] overflow-y-auto w-full sm:w-[60%] self-center pb-[6rem] no-scrollbar">
        {messages.map((chatItem, index) => {
          return renderMessageItem(chatItem, index);
        })}
        {currentChatItem && renderMessageItem(currentChatItem, -1)}
      </div>

      {/* Session Controls (Fixed at Bottom of the Screen) */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center w-full p-4 pb-8 animate-wave transition-all duration-[5000]"
        style={{
          background: `linear-gradient(to top, rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, ${0.5 + 1.5 * audioIntensity}), rgba(${primaryDarkRGB.r}, ${primaryDarkRGB.g}, ${primaryDarkRGB.b}, ${0.3 + 1.2 * audioIntensity}), transparent)`,
          transition: 'background 0.1s linear',
        }}
      >
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;
