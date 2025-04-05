'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';
import { useAgentHandler } from '@/store/AgentHandler';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';

type CategoryTile = {
  text: string;
  subtext: string;
  action: string;
};

const CATEGORY_TILES: CategoryTile[] = [
  {
    text: 'Token Report',
    subtext: 'Get token report for a token',
    action: 'Token Report of Token $SOLA',
  },
  {
    text: 'Lulo',
    subtext: 'Show Lulo Dashboard',
    action: 'Get my lulo assets',
  },
  {
    text: 'Trade',
    subtext: 'Swap 0.1 SOL to USDC on Jupiter',
    action: 'Swap 0.1 SOL to USDC using Jupiter',
  },
  {
    text: 'Ai Mindshare',
    subtext: 'Get market mindshare for AI projects',
    action: "Show me AI projects categorized under 'DeFi'",
  },
];

export default function NewChat() {
  /**
   * Global State
   */
  const { currentChatRoom, setCurrentChatRoom } = useChatRoomHandler();
  const { state } = useChatMessageHandler();

  useEffect(() => {
    if (!currentChatRoom) {
      setCurrentChatRoom(null);
    }
  }, [setCurrentChatRoom, currentChatRoom]);

  // Memoize store selectors
  const sendTextMessage = useSessionHandler((state) => state.sendTextMessage);
  const agents = useAgentHandler((state) => state.agents);

  // Memoize click handler
  const handleTileClick = useCallback(
    (action: string) => {
      sendTextMessage(action);
    },
    [sendTextMessage]
  );

  const agentElements = useMemo(
    () =>
      agents.map((agent) => {
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
      }),
    [agents]
  );

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
      {state !== 'loading' &&
        useChatRoomHandler.getState().state !== 'loading' && (
          <>
            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="font-semibold text-lg md:text-title-xl text-secText animate-in fade-in duration-700">
                ASK SOLA
              </h1>
              <p className="font-medium text-lg md:text-title-xs text-secText animate-in fade-in duration-700">
                Perform Voice Powered Solana Intents
              </p>
            </div>

            {/* Category tiles */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
              {CATEGORY_TILES.map((item, index) => (
                <div
                  key={index}
                  className="border border-border bg-sec_background rounded-2xl p-5 text-secText hover:bg-primaryDark hover:text-textColorContrast transition cursor-pointer shadow-sm"
                  onClick={() => handleTileClick(item.action)}
                >
                  <h2 className="text-lg md:text-title-m animate-in fade-in duration-300 font-semibold">
                    {item.text}
                  </h2>
                  <p className="md:text-title-m animate-in fade-in duration-300 text-sm mt-1">
                    {item.subtext}
                  </p>
                </div>
              ))}
            </div>

            {/* Available Agents */}
            <div className="flex flex-wrap gap-2 p-2 w-full justify-center mt-3">
              {agentElements}
            </div>
          </>
        )}
    </div>
  );
}
