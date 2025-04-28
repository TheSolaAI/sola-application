'use client';
import React, { useState, useRef } from 'react';
import {
  LuAudioLines,
  LuSend,
  LuRefreshCw,
  LuCircleStop,
} from 'react-icons/lu';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useUserHandler } from '@/store/UserHandler';

interface SessionControlsProps {
  // Function to process a message (text, speech, etc)
  onSendMessage: (message: string) => Promise<void>;
  // Flag to indicate if the chat is currently processing
  isProcessing: boolean;
  // Function to notify parent about user interactions
  onUserInteraction: () => void;
  // Flag indicating if audio is currently playing
  isAudioPlaying: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  onSendMessage,
  isProcessing,
  onUserInteraction,
}) => {
  const { state } = useSessionHandler();
  const { createChatRoom, currentChatRoom } = useChatRoomHandler();
  const { setLoadingMessage } = useChatMessageHandler();
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Reference to track if we're currently processing a recording
  const isProcessingRecording = useRef(false);

  const { isRecording, recordingTime, startRecording, stopRecording } =
    useAudioRecorder();

  const sendMessageToAI = async () => {
    if (!inputText.trim()) return;

    if (state === 'error' || state === 'idle') {
      toast.error('Connection lost. Please reconnect first.');
      return;
    }

    // Stop any audio playing
    onUserInteraction();

    setIsUploading(true);
    try {
      await onSendMessage(inputText);

      // Clear input
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
    setIsUploading(false);
  };

  // Start recording when button is pressed
  const handleAudioButtonPress = async () => {
    if (isProcessingRecording.current || isUploading) return;

    // Stop any playing audio
    onUserInteraction();

    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Could not access microphone');
    }
  };

  // Stop recording when button is released
  const handleAudioButtonRelease = async () => {
    if (!isRecording || isProcessingRecording.current) return;

    isProcessingRecording.current = true;
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
        // toast.success('Audio transcribed successfully!');

        // Process the message using parent function
        await onSendMessage(transcribedText);
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
      isProcessingRecording.current = false;
    }
  };

  // Disable controls during any processing state
  const isDisabled = isUploading || isProcessing;

  return (
    <div className="relative flex items-center justify-center w-full h-full mb-10">
      {/* Input Controls */}
      <div
        className={`absolute flex items-center justify-center w-full h-full gap-2 px-2 transition-all duration-500 ease-in-out opacity-100 translate-y-0`}
      >
        {/* Input Field with Pulse Effect */}
        <div className="relative flex-1 max-w-full sm:max-w-[600px]">
          <input
            type="text"
            placeholder={isDisabled ? 'Processing...' : 'Start Chatting...'}
            value={inputText}
            onChange={(e) => {
              // Stop audio if user starts typing
              onUserInteraction();
              setInputText(e.target.value);
            }}
            onFocus={() => {
              onUserInteraction();
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            className={`bg-sec_background rounded-full p-4 pr-16 flex text-textColor w-full border shadow-xl  ${isFocused ? 'border-primaryDark' : 'border-transparent'} focus:border-primaryDark focus:outline-none transition-all duration-200 relative z-10 ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            onKeyUp={(e) =>
              !isDisabled && e.key === 'Enter' && sendMessageToAI()
            }
            disabled={isDisabled}
          />
          <button
            onClick={sendMessageToAI}
            disabled={isDisabled || !inputText.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 w-12 h-12 bg-sec_background text-textColor flex items-center justify-center hover:bg-primaryDark hover:text-textColorContrast transition-colors z-10 ${isDisabled || !inputText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDisabled ? (
              <LuRefreshCw size={16} className="animate-spin" />
            ) : (
              <LuSend size={16} />
            )}
          </button>
        </div>

        {/* Audio Button */}
        <div className="relative">
          <button
            onMouseDown={handleAudioButtonPress}
            onMouseUp={handleAudioButtonRelease}
            onMouseLeave={handleAudioButtonRelease}
            onTouchStart={handleAudioButtonPress}
            onTouchEnd={handleAudioButtonRelease}
            disabled={isDisabled && !isRecording}
            className={`rounded-full flex justify-center items-center p-4 w-14 h-14 relative z-10 touch-none select-none ${
              isRecording
                ? 'bg-red-500 text-white'
                : 'bg-primaryDark text-textColorContrast hover:bg-red-500 hover:text-white'
            } ${isDisabled && !isRecording ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300`}
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
              <div className="relative">
                <LuAudioLines size={20} />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primaryDark text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Hold to talk
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionControls;
