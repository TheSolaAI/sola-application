// LayoutContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';
import { float32ArrayToBase64 } from '../utils/bufferToAudioURL.ts';
import { ChatItem, UserAudioChatContent } from '../types/chatItem.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

type VadState = {
  listening: boolean;
  errored: string | false;
  loading: boolean;
  userSpeaking: boolean;
  pause: () => void;
  start: () => void;
  toggle: () => void;
};

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  walletLensOpen: boolean;
  setWalletLensOpen: React.Dispatch<React.SetStateAction<boolean>>;
  canAutoClose: boolean;
  setCanAutoClose: React.Dispatch<React.SetStateAction<boolean>>;
  audioIntensity: number;
  setAudioIntensity: React.Dispatch<React.SetStateAction<number>>;
  audioEl: HTMLAudioElement;
  vadInstance: VadState;
  handleWalletLensOpen: (state: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [walletLensOpen, setWalletLensOpen] = useState(false);
  const [canAutoClose, setCanAutoClose] = useState(false);
  const [audioIntensity, setAudioIntensity] = useState(0);

  const { addMessage } = useChatMessageHandler();

  /**
   * Audio element to stream the incoming audio from webRTC
   */
  const audioEl = document.createElement('audio');
  audioEl.autoplay = true;
  audioEl.setAttribute('playsinline', 'true');

  /**
   * Track user audio to display them in the chat.
   */
  const vadInstance = useMicVAD({
    startOnLoad: false,
    minSpeechFrames: 6,
    onSpeechEnd: async (audioBuffer) => {
      const base64URL = await float32ArrayToBase64(audioBuffer);
      const userAudio: UserAudioChatContent = {
        response_id: 'userAudio',
        sender: 'user',
        type: 'user_audio_chat',
        text: base64URL,
      };
      const userAudioChatItem: ChatItem<UserAudioChatContent> = {
        id: 0,
        content: userAudio,
        createdAt: new Date().toISOString(),
      };
      addMessage(userAudioChatItem);
    },
  });

  const handleWalletLensOpen = (state: boolean) => {
    if (state) {
      setSidebarOpen(false);
      setWalletLensOpen(true);
      setCanAutoClose(true);
    } else {
      if (!canAutoClose) {
        setSidebarOpen(true);
      }
      setWalletLensOpen(false);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        walletLensOpen,
        setWalletLensOpen,
        canAutoClose,
        setCanAutoClose,
        audioIntensity,
        setAudioIntensity,
        audioEl,
        vadInstance,
        handleWalletLensOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
