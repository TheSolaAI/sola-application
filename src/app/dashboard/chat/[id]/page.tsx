'use client';
import useThemeManager from '@/store/ThemeManager';
import { hexToRgb } from '@/utils/hexToRGB';
import React, { useEffect, useRef, useState } from 'react';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ChatContentType, ChatItem } from '@/types/chatItem';
import { messageComponentMap } from '@/lib/messageComponentMap';
import { useParams } from 'next/navigation';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { LuArrowDown } from 'react-icons/lu';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);
  const { id } = useParams();

  /**
   * Global State
   */
  const { theme } = useThemeManager();
  const { messages, currentChatItem, initChatMessageHandler } =
    useChatMessageHandler();
  const { rooms, setCurrentChatRoom, currentChatRoom } = useChatRoomHandler();

  /**
   * Local State
   */
  const primaryRGB = hexToRgb(theme.primary);

  // Handle scrolling to bottom on new messages
  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      scrollToBottom();
    }
  }, [messages, currentChatItem]);

  // Set current room based on URL parameter
  useEffect(() => {
    if (!currentChatRoom && id && rooms.length > 0) {
      const roomId = parseInt(id as string);
      const currentRoom = rooms.find((room) => room.id === roomId);

      if (currentRoom) {
        console.log('id page executed', currentChatRoom, id, rooms.length);
        setCurrentChatRoom(currentRoom).then(() => {
          // Initialize messages for this chat room
          initChatMessageHandler();
        });
      }
    }
  }, [id, rooms, setCurrentChatRoom, initChatMessageHandler]);

  // Function to handle smooth scrolling to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  // Function to detect when user manually scrolls up (to disable auto-scroll)
  const handleScroll = () => {
    if (scrollableContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom

      // Only update if the value changes to avoid unnecessary re-renders
      isAutoScrollEnabled.current = isAtBottom;

      // If user scrolls back to bottom, re-enable auto-scroll
      if (isAtBottom) {
        isAutoScrollEnabled.current = true;
      }
    }
  };

  // Detect new message and show a "scroll to bottom" button when user is scrolled up
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (
      !isAutoScrollEnabled.current &&
      (messages.length > 0 || currentChatItem)
    ) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }, [messages, currentChatItem]);

  const renderMessageItem = (
    chatItem: ChatItem<ChatContentType>,
    index: number
  ): React.ReactNode => {
    if (!chatItem) return null;

    const { type } = chatItem.content;
    const Component = messageComponentMap[type];

    if (Component) {
      return <Component key={index} props={chatItem.content} />;
    }

    return null;
  };

  return (
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
        <div
          ref={scrollableContainerRef}
          className="absolute inset-0 overflow-y-auto no-scrollbar"
          onScroll={handleScroll}
        >
          <div className="w-full sm:w-[60%] mx-auto pb-32 mt-10">
            {messages.map((chatItem, index) =>
              renderMessageItem(chatItem, index)
            )}
            {currentChatItem && renderMessageItem(currentChatItem, -1)}
          </div>
          {/* This empty div is used as a reference for scrolling to the bottom */}
          <div ref={messagesEndRef} />
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
  );
}
