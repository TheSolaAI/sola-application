import { SessionControls } from '../components/SessionControls.tsx';
import { useChatRoomHandler } from '../models/ChatRoomHandler.ts';
import React, { useEffect, useState } from 'react';
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
import { useAgentHandler } from '../models/AgentHandler.ts';
import quick_prompts from '../config/quick_prompts.json';
import { useSessionHandler } from '../models/SessionHandler.ts';
import { ScaleLoader } from 'react-spinners';
import { LoaderMessageItem } from '../components/ui/message_items/LoaderMessageItem.tsx';
import { InProgressMessageChatItem } from '../components/ui/message_items/InProgressMessageChatItem.tsx';

const Conversation = () => {
  const navigate = useNavigate();

  /**
   * Global state
   */
  const { setCurrentChatRoom, rooms, allRoomsLoaded } = useChatRoomHandler();
  const { messages, currentChatItem, state } = useChatMessageHandler();
  const { sendTextMessage } = useSessionHandler();
  const { agents } = useAgentHandler();
  const { theme } = useThemeManager();
  const { audioIntensity } = useLayoutContext();

  /**
   * Local State
   */
  const primaryRGB = hexToRgb(theme.primary);
  const primaryDarkRGB = hexToRgb(theme.primaryDark);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
   * Load some random suggestions
   */
  useEffect(() => {
    const promptsCopy = [...quick_prompts];
    for (let i = promptsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [promptsCopy[i], promptsCopy[j]] = [promptsCopy[j], promptsCopy[i]];
    }

    setSuggestions(promptsCopy.slice(0, 6));
  }, []);
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
    if (type === 'in_progress_message') {
      return <InProgressMessageChatItem key={index} props={chatItem.content} />;
    }
    if (type === 'loader_message') {
      return <LoaderMessageItem key={index} props={chatItem.content} />;
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
    <div className="relative flex flex-col w-full h-screen overflow-hidden">
      {/* Empty state message */}
      {state === 'loading' && (
        <div
          className={
            'absolute inset-0 flex flex-col gap-4 items-center justify-center'
          }
        >
          <ScaleLoader color={theme.textColor} height={80} width={20} />
        </div>
      )}

      {messages.length === 0 && !currentChatItem && state !== 'loading' && (
       <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-20">
       {/* Logo and Title */}
       <div className="flex flex-col items-center mb-8">
         <h1 className="font-semibold text-lg md:text-title-xl text-secText animate-in fade-in duration-700">
           ASK SOLA
         </h1>
         
         {/* Subtitle */}
         <p className="font-semibold text-lg md:text-title-xs text-secText animate-in fade-in duration-700">
           Perform Voice Powered Solana Intents
         </p>
       </div>

       {/* Category tiles */}
       <div className="grid grid-cols-2 gap-6 w-full max-w-xl mt-6">
         {/* Category Tile Component */}
         {[
           { text: "Token Report", subtext: "Get token report for a token", action: "Token Report of Token SOLA" },
           { text: "Liquid Stake", subtext: "Stake SOL into LSTs", action: "Show me the best LSTs to buy" },
           { text: "Trade", subtext: "Swap 0.1 SOL to USDC on Jupiter", action: "Swap 0.1 SOL to USDC using Jupiter" },
           { text: "Ai Mindshare", subtext: "Get market mindshare for AI projects", action: "Show me AI projects categorized under 'DeFi'" },
         ].map((item, index) => (
           <div 
             key={index} 
             className="border border-gray-300 bg-sec_background rounded-2xl p-5 hover:bg-sec_hover transition cursor-pointer shadow-sm"
             onClick={() => sendTextMessage(item.action)}
           >
             <h2 className="text-lg md:text-title-m text-secText animate-in fade-in duration-700 font-semibold text-lg">{item.text}</h2>
             <p className="text-lg md:text-title-m text-secText animate-in fade-in duration-700 text-sm mt-1">{item.subtext}</p>
           </div>
         ))}
       </div>

          {/* Available Agents */}
          <div className="flex flex-wrap gap-2 p-2 w-full justify-center mt-3">
            {agents.map((agent) => {
              const Icon = agent.logo;
              return (
                <div
                  key={agent.slug}
                  className="flex items-center gap-2 bg-sec_background rounded-2xl px-3 py-2"
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-secText" />
                  <span className="text-xs md:text-sm font-medium text-secText">
                    {agent.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full">
        <div className="relative w-full h-full">
          {/* Top fade gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, 
                ${theme.background} 0%,
                rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0) 100%
              )`,
            }}
          />

          {/* Scrollable content */}
          <div className="absolute inset-0 overflow-y-auto no-scrollbar">
            <div className="w-full sm:w-[60%] mx-auto pb-32 mt-10">
              {messages.map((chatItem, index) =>
                renderMessageItem(chatItem, index),
              )}
              {currentChatItem && renderMessageItem(currentChatItem, -1)}
            </div>
          </div>

          {/* Bottom fade gradient (above the controls) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to top, 
                ${theme.background} 0%,
                rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0) 100%
              )`,
            }}
          />
        </div>
      </div>

      {/* Session Controls (Fixed at Bottom) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8"
        style={{
          background: `linear-gradient(to top, 
            rgba(${primaryDarkRGB.r}, ${primaryDarkRGB.g}, ${primaryDarkRGB.b}, ${audioIntensity * 1.2}),
            transparent 80%)`,
          transition: 'background 0.1s linear',
        }}
      >
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;