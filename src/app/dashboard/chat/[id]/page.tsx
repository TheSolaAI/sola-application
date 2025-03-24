'use client';
import useThemeManager from '@/store/ThemeManager';
import { hexToRgb } from '@/utils/hexToRGB';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useParams } from 'next/navigation';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { LuArrowDown } from 'react-icons/lu';
import { useChat } from '@ai-sdk/react';
import { Message } from 'ai';
import { SimpleMessageChatItem } from '@/components/messages/SimpleMessageChatItem';
import { getParticularTool } from '@/lib/ai/agentsConfig';

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);
  const { id } = useParams();

  /**
   * Global State
   */
  const { theme } = useThemeManager();
  const { currentChatItem, initChatMessageHandler } = useChatMessageHandler();
  const { rooms, setCurrentChatRoom, currentChatRoom } = useChatRoomHandler();
  const { messages, addToolResult } = useChat({
    id: id as string,
    maxSteps: 8,
    sendExtraMessageFields: true,
    initialMessages: useChatMessageHandler.getState().messages,
  });

  console.log(messages);

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

  const renderToolResult = (
    toolName: string,
    args: any,
    result: any
  ): React.ReactNode => {
    const tool = getParticularTool(toolName);

    if (!tool || !tool.implementation) {
      console.warn(`Tool ${toolName} not found or has no implementation`);
      return null;
    }

    try {
      // Make sure the implementation returns a React component
      return tool.implementation(result);
    } catch (error) {
      console.error(`Error rendering tool ${toolName}:`, error);
      return <div className="text-red-500">Error rendering tool result</div>;
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
            {messages.map((message, messageIndex) => {
              return (
                <div key={`message-${messageIndex}`}>
                  {message.parts &&
                    message.parts.map((part, partIndex) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <SimpleMessageChatItem
                              key={`text-${messageIndex}-${partIndex}`}
                              text={part.text}
                            />
                          );
                        case 'tool-invocation':
                          if (part.toolInvocation.state === 'result') {
                            // Return the component, don't just call the function
                            return (
                              <React.Fragment
                                key={`tool-${messageIndex}-${partIndex}`}
                              >
                                {renderToolResult(
                                  part.toolInvocation.toolName,
                                  part.toolInvocation.args,
                                  part.toolInvocation.result
                                )}
                              </React.Fragment>
                            );
                          }
                          return null;
                        default:
                          console.warn(`Unknown part type: ${part.type}`);
                          return null;
                      }
                    })}
                </div>
              );
            })}
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
