'use client';
import React, { useState } from 'react';
import {
  LuAudioLines,
  LuSend,
  LuRefreshCw,
  LuCircleStop,
} from 'react-icons/lu';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useUserHandler } from '@/store/UserHandler';
import { useWalletHandler } from '@/store/WalletHandler';
import { UIMessage, generateId } from 'ai';

interface SessionControlsProps {
  // Function to add message to useChat hook
  onSendMessage: (message: string) => void;
  // Function to add AI response directly to messages (for fallback responses)
  onAddAIResponse: (message: string) => void;
  // Flag to indicate if the chat is currently processing
  isProcessing: boolean;
  // Current messages in useChat
  messages?: UIMessage[];
}

const SessionControls: React.FC<SessionControlsProps> = ({
  onSendMessage,
  onAddAIResponse,
  isProcessing,
  messages = [],
}) => {
  const { state } = useSessionHandler();
  const { establishConnection } = useSessionManager();
  const { setShowVerifyHoldersPopup, sessionStatus } =
    useSessionManagerHandler();
  const { createChatRoom, currentChatRoom } = useChatRoomHandler();
  const { setLoadingMessage } = useChatMessageHandler();
  const { currentWallet } = useWalletHandler();

  const [isConnecting, setIsConnecting] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isToolsetProcessing, setIsToolsetProcessing] = useState(false);

  const { isRecording, recordingTime, startRecording, stopRecording } =
    useAudioRecorder();

  // Reconnect to session
  const handleReconnect = async () => {
    setIsConnecting(true);
    try {
      const hasConnected = await establishConnection();
      if (!hasConnected) {
        setShowVerifyHoldersPopup(true);
      }
    } catch (error) {
      toast.error('Failed to reconnect. Please try again.');
      console.error('Reconnection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Process the message through toolset determination and chat API
  const processMessage = async (messageContent: string) => {
    if (!currentWallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Create message object for current message
    const currentMessage = {
      id: generateId(),
      content: messageContent,
      role: 'user',
      createdAt: new Date(),
    };

    // Get previous messages for context (up to 5 previous messages)
    const previousMessages = messages.slice(-5).map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      createdAt: new Date(),
    }));

    setIsToolsetProcessing(true);
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
          walletPublicKey: currentWallet.address,
          message: currentMessage,
          previousMessages: previousMessages,
        }),
      });

      if (!toolsetResponse.ok) {
        throw new Error('Failed to determine required toolset');
      }

      const toolsetData = await toolsetResponse.json();
      console.log('Toolset determination result:', toolsetData);

      // If fallbackResponse is provided, no toolset is needed
      if (toolsetData.fallbackResponse) {
        console.log(
          'Direct response (no toolset needed):',
          toolsetData.fallbackResponse
        );

        // Add AI response directly to messages without calling chat API
        onAddAIResponse(toolsetData.fallbackResponse);
        setLoadingMessage(null);
        setIsToolsetProcessing(false);
        return;
      }

      // Step 2: We have a toolset, so let the useChat hook handle it
      // This will trigger the /api/chat endpoint via useChat
      onSendMessage(messageContent);
    } catch (error) {
      console.error('Error in message processing flow:', error);
      toast.error('Failed to process your request');
      setLoadingMessage(null);
      setIsToolsetProcessing(false);
    }
  };

  // Handle text input submission
  const sendMessageToAI = async () => {
    if (!inputText.trim()) return;

    if (state === 'error' || state === 'idle') {
      toast.error('Connection lost. Please reconnect first.');
      return;
    }

    // Ensure we have a chat room
    if (!currentChatRoom) {
      await createChatRoom({ name: 'New Chat' });
    }

    // Process the message with toolset determination
    await processMessage(inputText);

    // Clear input
    setInputText('');
  };

  // Handle push-to-talk recording
  const handlePushToTalk = async () => {
    if (isRecording) {
      setIsUploading(true);
      try {
        // Stop recording and get the audio blob
        const blob = await stopRecording();
        if (!blob) {
          toast.error('Failed to capture audio');
          return;
        }

        // Create form data for upload
        const formData = new FormData();
        formData.append('audio', blob, 'recording.wav');

        // Ensure we have a chat room
        if (!currentChatRoom) {
          await createChatRoom({ name: 'New Chat' });
        }

        // Show loading message
        setLoadingMessage('Processing your speech...');

        // Upload the audio for transcription
        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useUserHandler.getState().authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process speech');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Transcription failed');
        }

        // Process the transcribed text
        const transcribedText = data.text.trim();
        if (transcribedText) {
          toast.success('Audio transcribed successfully!');

          // Process the message with toolset determination
          await processMessage(transcribedText);
        } else {
          toast.warning('No speech detected');
          setLoadingMessage(null);
        }
      } catch (error) {
        console.error('Speech processing error:', error);
        toast.error('Failed to process speech');
        setLoadingMessage(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Could not access microphone');
      }
    }
  };

  const isConnectedAndOpen = sessionStatus === 'connected';
  const isErrorState =
    sessionStatus === 'error' ||
    state === 'idle' ||
    state === 'error' ||
    sessionStatus === 'idle' ||
    sessionStatus === 'connecting';

  // Disable controls during any processing state
  const isDisabled = isUploading || isProcessing || isToolsetProcessing;

  return (
    <div className="relative flex items-center justify-center w-full h-full mb-10">
      {/* Input Controls */}
      <div
        className={`absolute flex items-center justify-center w-full h-full gap-2 px-2 transition-all duration-500 ease-in-out ${isConnectedAndOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <div className="relative flex-1 max-w-full sm:max-w-[600px]">
          <input
            type="text"
            placeholder={isDisabled ? 'Processing...' : 'Start Chatting...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`bg-sec_background rounded-full p-4 pr-16 flex text-textColor w-full border border-transparent focus:border-primaryDark focus:outline-none transition-all duration-200 ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            onKeyUp={(e) =>
              !isDisabled && e.key === 'Enter' && sendMessageToAI()
            }
            disabled={isDisabled}
          />
          <button
            onClick={sendMessageToAI}
            disabled={isDisabled || !inputText.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 w-12 h-12 bg-sec_background text-textColor flex items-center justify-center hover:bg-primaryDark hover:text-textColorContrast transition-colors ${isDisabled || !inputText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDisabled ? (
              <LuRefreshCw size={16} className="animate-spin" />
            ) : (
              <LuSend size={16} />
            )}
          </button>
        </div>

        {/* Push-to-Talk Button */}
        <button
          onClick={handlePushToTalk}
          disabled={isDisabled && !isRecording}
          className={`rounded-full flex justify-center items-center p-4 w-14 h-14 ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-primaryDark text-textColorContrast hover:bg-red-500 hover:text-white'
          } ${isDisabled && !isRecording ? 'opacity-70 cursor-not-allowed' : ''} transition-all duration-300`}
        >
          {isUploading ? (
            <LuRefreshCw size={20} className="animate-spin" />
          ) : isRecording ? (
            <div className="relative flex items-center justify-center">
              <LuCircleStop size={20} />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                {recordingTime}s {recordingTime >= 28 && '(max 30s)'}
              </span>
            </div>
          ) : (
            <LuAudioLines size={20} />
          )}
        </button>
      </div>

      {/* Error or loading State */}
      <div
        className={`absolute flex items-center justify-center w-full h-full transition-all duration-500 ease-in-out flex-col gap-4 ${isErrorState ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <button
          className="flex items-center gap-2 bg-primaryDark text-textColorContrast cursor-pointer py-4 px-6 rounded-full text-base hover:bg-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleReconnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <LuRefreshCw size={16} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LuRefreshCw size={16} />
              Reconnect Session
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SessionControls;
