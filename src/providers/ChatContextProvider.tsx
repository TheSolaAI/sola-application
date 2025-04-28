import React, { createContext, useContext, ReactNode } from 'react';
import { UIMessage } from 'ai';
import { useAudioPlayer } from '@/hooks/chat/useAudioPlayer';
import { useScrollBehavior } from '@/hooks/chat/useScrollBehavior';
import { useChatMessages } from '@/hooks/chat/useChatMessages';

interface ChatContextValue {
  // Audio-related
  isAudioPlaying: boolean;
  handleUserInteraction: () => void;

  // Message-related
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | null;
  processMessage: (text: string) => Promise<void>;

  // Scroll-related
  showScrollButton: boolean;
  scrollToBottom: (element: HTMLElement | null) => void;
  handleScroll: (element: HTMLElement | null) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  const audioController = useAudioPlayer();
  const scrollController = useScrollBehavior();
  const chatMessages = useChatMessages(
    roomId,
    audioController,
    scrollController
  );

  const value: ChatContextValue = {
    // Audio-related
    isAudioPlaying: audioController.isAudioPlaying,
    handleUserInteraction: audioController.handleUserInteraction,

    // Message-related
    messages: chatMessages.messages,
    isLoading: chatMessages.isLoading,
    error: chatMessages.error || null,
    processMessage: chatMessages.processMessage,

    // Scroll-related
    showScrollButton: scrollController.showScrollButton,
    scrollToBottom: scrollController.manualScrollToBottom,
    handleScroll: scrollController.handleScroll,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
