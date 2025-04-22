'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import useThemeManager from '@/store/ThemeManager';
import { hexToRgb } from '@/utils/hexToRGB';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { SimpleMessageChatItem } from '@/components/messages/SimpleMessageChatItem';
import UserInput from '@/components/messages/UserInput';
import { Message, useChat } from '@ai-sdk/react';
import SessionControls from '../_components/SessionControls';
import SkeletonWave from '@/components/common/SkeletonWave';
import React from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import useKeyboardHeight from '@/hooks/useKeyboardHeight';
import { toast } from 'sonner';
import { UIMessage } from 'ai';
import { ToolResult } from '@/types/tool';
import { TokenAddressResultItem } from '@/components/messages/TokenAddressResultItem';
import { AiProjects } from '@/components/messages/AiProjects';
import { LuloChatItem } from '@/components/messages/LuloMessageItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { BubbleMapChatItem } from '@/components/messages/BubbleMapCardItem';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);
  const { id } = useParams();

  /**
   * Global State
   */
  const { theme } = useThemeManager();
  const { rooms, setCurrentChatRoom, currentChatRoom } = useChatRoomHandler();
  const {
    initChatMessageHandler,
    messages: dbMessages,
    setLoadingMessage,
  } = useChatMessageHandler();
  const { isPWA, keyboardHeight } = useKeyboardHeight();

  /**
   * Local State
   */
  const primaryRGB = hexToRgb(theme.primary);

  // Set up useChat hook
  const { messages, setMessages, append, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: dbMessages,
    id: `chat-${id}`,
    body: {
      walletPublicKey: useWalletHandler.getState().currentWallet?.address,
      currentRoomID: id,
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  console.log('Chat messages:', messages, dbMessages);

  // Set current room based on URL parameter
  useEffect(() => {
    if (!currentChatRoom && id && rooms.length > 0) {
      const roomId = parseInt(id as string);
      const currentRoom = rooms.find((room) => room.id === roomId);

      if (currentRoom) {
        setCurrentChatRoom(currentRoom).then(() => {
          // Initialize messages for this chat room
          initChatMessageHandler();
        });
      }
    }
  }, [id, rooms, currentChatRoom, initChatMessageHandler, setCurrentChatRoom]);

  // Function to handle smooth scrolling to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  // Handle scrolling to bottom on new messages
  useEffect(() => {
    if (isAutoScrollEnabled.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Function to detect when user manually scrolls up (to disable auto-scroll)
  const handleScroll = () => {
    if (scrollableContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom

      // Only update if the value changes to avoid unnecessary re-renders
      isAutoScrollEnabled.current = isAtBottom;
    }
  };

  // Detect new message and show a "scroll to bottom" button when user is scrolled up
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (!isAutoScrollEnabled.current && messages.length > 0) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    try {
      await append({
        role: 'user',
        content: text,
      });

      // Set loading message
      setLoadingMessage('Processing your request...');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoadingMessage(null);
    }
  };

  // Handler for direct AI responses (for fallback responses without tool calls)
  const handleAddAIResponse = async (responseText: string) => {
    try {
      // First ensure the latest user message is in the chat
      // (This is needed because when using the toolset determination endpoint
      // directly, the message might not be in useChat's state yet)
      const latestUserMsg = messages.findLast((m) => m.role === 'user');

      if (!latestUserMsg) {
        console.warn('No user message found to respond to');
      }

      // Now add the AI response
      await append({
        role: 'assistant',
        content: responseText,
      });

      setLoadingMessage(null);
    } catch (error) {
      console.error('Error adding AI response:', error);
      toast.error('Failed to process response');
      setLoadingMessage(null);
    }
  };

  // Render message or tool result based on content type
  const renderMessageContent = (message: UIMessage) => {
    // Handle user messages
    if (message.role === 'user' || message.role === 'data') {
      return (
        <UserInput
          text={message.content}
          transcript={message.role === 'data'}
        />
      );
    }

    // Handle assistant messages with parts (tool results)
    if (message.parts) {
      return message.parts.map((part, partIndex) => {
        if (part.type === 'text') {
          return (
            <SimpleMessageChatItem key={`text-${partIndex}`} text={part.text} />
          );
        } else if (
          part.type === 'tool-invocation' &&
          part.toolInvocation.state === 'result'
        ) {
          return (
            <React.Fragment key={`tool-${message.id}-${partIndex}`}>
              {renderToolResult(
                part.toolInvocation.toolName,
                part.toolInvocation.result
              )}
            </React.Fragment>
          );
        }
        return null;
      });
    }

    // Handle simple text messages
    return <SimpleMessageChatItem text={message.content} />;
  };

  const renderToolResult = (
    toolName: string,
    args: ToolResult
  ): React.ReactNode => {
    switch (toolName) {
      case '  ':
        return <TokenAddressResultItem props={args.data} />;
      case 'trendingAiProjects':
        return <AiProjects props={args.data} />;
      case 'depositLuloTool':
        return <LuloChatItem props={args.data} />;
      case 'createGetTokenDataTool':
        return <TokenDataMessageItem props={args.data} />;
      case 'bubblemapTool':
        return <BubbleMapChatItem props={args.data} />;
      case 'topHoldersTool':
        return <TopHoldersMessageItem props={args.data} />;
      case 'resolveSnsNameTool':
        return <TokenAddressResultItem props={args.data} />;
    }
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
            {messages.map((message, index) => (
              <div key={`message-${message.id || index}`}>
                {renderMessageContent(message)}
              </div>
            ))}

            {/* Show loading indicator when processing */}
            {isLoading && <SkeletonWave />}

            {/* Show error if any */}
            {error && (
              <div className="text-red-500 p-3 rounded-lg">
                An error occurred. Please try again.
              </div>
            )}
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

        {/* Floating scroll to bottom button */}
        {showScrollButton && (
          <button
            className="fixed bottom-24 right-8 bg-primary text-white p-2 rounded-full shadow-lg z-20"
            onClick={scrollToBottom}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}
      </div>

      <div
        className="absolute left-0 right-0 z-20 p-4 pb-8 bottom-0"
        style={{
          bottom: isPWA && keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
          transition: 'background 0.1s linear',
        }}
      >
        <SessionControls
          onSendMessage={handleSendMessage}
          onAddAIResponse={handleAddAIResponse}
          isProcessing={isLoading}
          messages={messages}
        />
      </div>
    </div>
  );
}
