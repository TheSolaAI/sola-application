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
import { generateId, UIMessage } from 'ai';
import { ToolResult } from '@/types/tool';
import { TokenAddressResultItem } from '@/components/messages/TokenAddressResultItem';
import { AiProjects } from '@/components/messages/AiProjects';
import { LuloChatItem } from '@/components/messages/LuloMessageItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { BubbleMapChatItem } from '@/components/messages/BubbleMapCardItem';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';
import { useUserHandler } from '@/store/UserHandler';
import ReasoningMessageItem from '@/components/messages/ReasoningMessageItem';
import SourceMessageItem from '@/components/messages/SourceMessageItem';
import InfoText from '../_components/InfoText';
import { VersionedTransaction } from '@solana/web3.js';
import { ShowLimitOrdersChatItem } from '@/components/messages/ShowLimitOrderChatItem';
import { CreateLimitOrderChatItem } from '@/components/messages/CreateLimitOrderMessageItem';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionCardItem';

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

  // Audio playback states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'sign_and_send_tx') {
        interface TransactionArgs {
          transactionHash: string;
        }
        try {
          const { transactionHash } = toolCall.args as TransactionArgs;
          const currentWallet = useWalletHandler.getState().currentWallet;

          if (!currentWallet) {
            return {
              success: false,
              error: 'No wallet connected',
            };
          }

          // Decode the base64 transaction
          const transactionBuffer = Buffer.from(transactionHash, 'base64');
          const transaction =
            VersionedTransaction.deserialize(transactionBuffer);

          // Sign the transaction with the wallet
          const signedTransaction =
            await currentWallet.signTransaction(transaction);
          const rawTransaction = signedTransaction.serialize();

          // Send the signed transaction to backend API
          const response = await fetch('/api/wallet/sendTransaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serializedTransaction:
                Buffer.from(rawTransaction).toString('base64'),
              options: {
                skipPreflight: true,
                maxRetries: 10,
              },
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            return {
              success: false,
              error: 'Transaction failed',
              message: responseData,
            };
          }

          return {
            success: true,
            message: responseData,
          };
        } catch (error) {
          return {
            success: false,
            error: `Transaction processing error: ${error || 'Unknown error'}`,
          };
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();

      audioRef.current.onplay = () => setIsAudioPlaying(true);
      audioRef.current.onended = () => setIsAudioPlaying(false);
      audioRef.current.onpause = () => setIsAudioPlaying(false);

      // Clean up on component unmount
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      };
    }
  }, []);

  // Stop audio when chat ID changes
  useEffect(() => {
    stopAudio();
  }, [id]);

  // Convert base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);

      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  // Function to play audio from base64 data
  const playAudio = (base64Audio: string) => {
    if (!audioRef.current) return;

    // Stop any currently playing audio
    stopAudio();

    const audioBlob = base64ToBlob(base64Audio, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);

    audioRef.current.src = audioUrl;
    audioRef.current.play().catch((err) => {
      console.error('Error playing audio:', err);
      toast.error('Could not play audio response');
    });
  };

  // Function to stop audio playback
  const stopAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  };

  // Stop audio when user interacts
  const handleUserInteraction = () => {
    if (isAudioPlaying) {
      stopAudio();
    }
  };

  // Check for a pending message from localStorage
  useEffect(() => {
    const pendingMessage = localStorage.getItem('pending_message');

    if (pendingMessage) {
      localStorage.removeItem('pending_message');

      // Process the message
      setLoadingMessage('Processing your request...');

      processMessage(pendingMessage)
        .then(() => {
          // Message sent successfully
          console.log('Initial message processed');
        })
        .catch((err) => {
          console.error('Error processing initial message:', err);
          toast.error('Failed to process your message');
        })
        .finally(() => {
          setLoadingMessage(null);
        });
    }
  }, [id]);

  // Process the message through toolset determination and chat API
  const processMessage = async (messageContent: string) => {
    // Stop any playing audio when user sends a new message
    handleUserInteraction();

    if (!useWalletHandler.getState().currentWallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Create message object for current message
    const currentMessage = {
      id: generateId(),
      content: messageContent,
      role: 'user',
      createdAt: new Date(),
    } as Message;

    // Get previous messages for context (up to 5 previous messages)
    const previousMessages = messages.slice(-5).map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      createdAt: new Date(),
    }));

    setLoadingMessage('Processing your request...');

    try {
      // Step 1: First determine the required toolset
      const toolsetResponse = await fetch('/api/get-required-toolsets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserHandler.getState().authToken}`,
        },
        body: JSON.stringify({
          walletPublicKey: useWalletHandler.getState().currentWallet?.address,
          message: currentMessage,
          previousMessages: previousMessages,
          currentRoomID: id,
        }),
      });

      if (toolsetResponse.status === 403) {
        toast.error(
          'Usage limit exceeded. Please upgrade your tier for more requests.',
          {
            description:
              "Based on your SOLA token holdings, you've reached your usage limit for this time period.",
            duration: 5000,
            action: {
              label: 'Learn More',
              onClick: () => window.open('https://docs.solaai.xyz/', '_blank'),
            },
          }
        );
        setLoadingMessage(null);
        return;
      }

      if (!toolsetResponse.ok) {
        throw new Error('Failed to determine required toolset');
      }

      const toolsetData = await toolsetResponse.json();
      console.log('Toolset determination result:', toolsetData);

      // If fallbackResponse is provided, no toolset is needed
      if (toolsetData.selectedToolset.length === 0 || toolsetData.audioData) {
        console.log(
          'Direct response (no toolset needed):',
          toolsetData.fallbackResponse
        );

        handleAddUserMessage(currentMessage);
        handleAddAIResponse(toolsetData.fallbackResponse);

        if (toolsetData.audioData) {
          playAudio(toolsetData.audioData);
        }

        setLoadingMessage(null);
        return;
      }

      await handleSendMessage(messageContent, toolsetData.selectedToolset);
    } catch (error) {
      console.error('Error in message processing flow:', error);
      toast.error('Failed to process your request');
      setLoadingMessage(null);
    }
  };

  const handleSendMessage = async (text: string, toolsets: string[]) => {
    console.log('Sending message:', text);
    console.log('Toolsets:', toolsets);

    // Stop any playing audio
    stopAudio();

    try {
      await append(
        {
          role: 'user',
          content: text,
        },
        { body: { requiredToolSets: toolsets } }
      );

      // Set loading message
      setLoadingMessage('Processing your request...');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoadingMessage(null);
    }
  };

  // Handle AI Response
  const handleAddAIResponse = (responseText: string) => {
    try {
      const latestUserMsg = messages.findLast((m) => m.role === 'user');

      if (!latestUserMsg) {
        console.warn('No user message found to respond to');
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: generateId(),
          role: 'assistant',
          content: responseText,
          parts: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        },
      ]);

      setLoadingMessage(null);
    } catch (error) {
      console.error('Error adding AI response:', error);
      toast.error('Failed to process response');
      setLoadingMessage(null);
    }
  };

  const handleAddUserMessage = (userMessage: Message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: generateId(),
        role: 'user',
        content: userMessage.content,
        parts: [{ type: 'text', text: userMessage.content }],
      },
    ]);
  };

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

  // Render message or tool result based on content type
  const renderMessageContent = (message: UIMessage) => {
    const role = message.role;
    if (message.role === 'user') {
      return <UserInput text={message.content} transcript={true} />;
    }

    // Handle assistant messages with parts (tool results)
    if (message.parts) {
      return message.parts.map((part, partIndex) => {
        if (part.type === 'text') {
          return role === 'user' ? (
            <UserInput text={message.content} transcript={true} />
          ) : (
            <SimpleMessageChatItem key={`text-${partIndex}`} text={part.text} />
          );
        } else if (part.type === 'reasoning') {
          return (
            <ReasoningMessageItem
              key={`reasoning-${message.id}`}
              reasoning={part.reasoning}
            />
          );
        } else if (part.type === 'source') {
          return (
            <SourceMessageItem
              key={`source-${message.id}`}
              sourceType={part.source.sourceType}
              id={part.source.id}
              url={part.source.url}
              title={part.source.title}
            />
          );
        } else if (
          part.type === 'tool-invocation' &&
          part.toolInvocation.state === 'result'
        ) {
          console.log('Tool invocation result:', part.toolInvocation);
          return (
            <React.Fragment key={`tool-${message.id}-${partIndex}`}>
              {renderToolResult(
                part.toolInvocation.toolName,
                part.toolInvocation.result
              )}
            </React.Fragment>
          );
        } else if (part.type === 'step-start') {
          return (
            <div
              key={`step-start-${generateId()}`}
              className="h-px flex-grow opacity-30"
            ></div>
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
      case 'tokenAddressTool':
        return <TokenAddressResultItem props={args.data} />;
      case 'getLimitOrderTool':
        return <ShowLimitOrdersChatItem props={args.data} />;
      case 'createLimitOrderTool':
        return <CreateLimitOrderChatItem props={args.data} />;
      case 'trendingAiProjects':
        return <AiProjects props={args.data} />;
      case 'depositLuloTool':
        return <LuloChatItem props={args.data} />;
      case 'getTokenDataTool':
        return <TokenDataMessageItem props={args.data} />;
      case 'bubblemapTool':
        return <BubbleMapChatItem props={args.data} />;
      case 'topHoldersTool':
        return <TopHoldersMessageItem props={args.data} />;
      case 'resolveSnsNameTool':
        return <TokenAddressResultItem props={args.data} />;
      case 'getNFTPrice':
        return <NFTCollectionMessageItem props={args.data} />;
      case 'getTrendingNFTs':
        return <NFTCollectionMessageItem props={args.data} />;
      default:
        return <SimpleMessageChatItem text={JSON.stringify(args.data)} />;
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
          onSendMessage={processMessage}
          isProcessing={isLoading}
          onUserInteraction={handleUserInteraction}
          isAudioPlaying={isAudioPlaying}
        />
        <InfoText />
      </div>
    </div>
  );
}
