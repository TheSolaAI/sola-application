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
import { generateId } from 'ai';

export const SessionControls = () => {
  const { state } = useSessionHandler();
  const { establishConnection } = useSessionManager();
  const { setShowVerifyHoldersPopup, sessionStatus } =
    useSessionManagerHandler();
  const { createChatRoom, currentChatRoom } = useChatRoomHandler();
  const { setLoadingMessage, addMessage } = useChatMessageHandler();
  const { currentWallet } = useWalletHandler();

  const [isConnecting, setIsConnecting] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const callChatAPI = async (messageContent: string, messageId: string) => {
    if (!currentWallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Create message object for current message
    const currentMessage = {
      id: messageId,
      content: messageContent,
      role: 'user',
      createdAt: new Date(),
    };

    // Get previous messages (e.g., last 5 messages)
    const previousMessages = useChatMessageHandler.getState().getTopMessages(5);

    setIsProcessing(true);
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
        // TODO: Handle the direct response case
        // For now, just display as a regular message
        setLoadingMessage(null);

        // Add the AI response to UI with the fallback response
        await addMessage({
          id: generateId(),
          content: toolsetData.fallbackResponse,
          role: 'assistant',
        });

        setIsProcessing(false);
        return;
      }

      // Step 2: Call the chat API with the selected toolset
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserHandler.getState().authToken}`,
        },
        body: JSON.stringify({
          walletPublicKey: currentWallet.address,
          selectedToolset: toolsetData.selectedToolset,
          message: currentMessage,
          previousMessages: previousMessages,
          currentRoomID: currentChatRoom?.id,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to process request with AI');
      }

      // Response processing is handled by EventProvider
      console.log(
        'Chat API call successful with toolset:',
        toolsetData.selectedToolset
      );
    } catch (error) {
      console.error('Error in chat flow:', error);
      toast.error('Failed to process your request');

      // Add error message to the UI
      await addMessage({
        id: generateId(),
        content:
          "I'm sorry, I couldn't process your request. Please try again.",
        role: 'assistant',
      });
    } finally {
      setLoadingMessage(null);
      setIsProcessing(false);
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

    const id = generateId();

    // Add the message to UI
    await addMessage({ id: id, content: inputText, role: 'user' });

    // Call the API directly and don't process the response here
    await callChatAPI(inputText, id);

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

        // Clear speech processing message
        setLoadingMessage(null);

        // Process the transcribed text
        const transcribedText = data.text.trim() as string;
        if (transcribedText) {
          toast.success('Audio transcribed successfully!');

          const id = generateId();

          // Add the message to UI
          await addMessage({ id: id, content: transcribedText, role: 'user' });

          // Call the API directly
          await callChatAPI(transcribedText, id);
        } else {
          toast.warning('No speech detected');
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

  // Disable controls during processing
  const isDisabled = isUploading || isProcessing;

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
            {isProcessing ? (
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
