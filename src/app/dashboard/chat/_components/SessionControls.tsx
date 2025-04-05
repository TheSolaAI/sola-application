'use client';
import React, { useState } from 'react';
import { LuMic, LuMicOff, LuSend, LuRefreshCw } from 'react-icons/lu';
import { useSessionHandler } from '@/store/SessionHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { toast } from 'sonner';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';

export const SessionControls = () => {
  const { muted, setMuted, state, sendTextMessage } = useSessionHandler();
  const { addMessage } = useChatMessageHandler();
  const { establishConnection } = useSessionManager();
  const { setShowVerifyHoldersPopup, sessionStatus, showVerifyHoldersPopup } =
    useSessionManagerHandler();
  const [isConnecting, setIsConnecting] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleReconnect = async () => {
    setIsConnecting(true);
    try {
      const hasConnected = await establishConnection();
      if (!hasConnected) {
        console.log('triggered');
        setShowVerifyHoldersPopup(true);
        console.log(showVerifyHoldersPopup);
      }
    } catch (error) {
      toast.error('Failed to reconnect. Please try again.');
      console.error('Reconnection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessageToAI = async () => {
    if (!inputRef.current?.value) return;

    if (state === 'error' || state === 'idle') {
      toast.error('Connection lost. Please reconnect first.');
      return;
    }

    await sendTextMessage(inputRef.current.value);

    addMessage({
      id: 0,
      content: {
        type: 'user_audio_chat',
        response_id: 'Text-Input-0',
        sender: 'user',
        text: inputRef.current.value,
      },
      createdAt: new Date().toISOString(),
    });

    inputRef.current.value = '';
  };

  const isConnectedAndOpen = sessionStatus === 'connected';
  const isErrorState =
    sessionStatus === 'error' ||
    state === 'idle' ||
    state === 'error' ||
    sessionStatus === 'idle' ||
    sessionStatus === 'connecting';

  console.log(isConnectedAndOpen, isErrorState, sessionStatus);
  return (
    <div className="relative flex items-center justify-center w-full h-full mb-10">
      {/* Input Controls */}
      <div
        className={`absolute flex items-center justify-center w-full h-full gap-2 px-2 transition-all duration-500 ease-in-out ${isConnectedAndOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <div className="relative flex-1 max-w-full sm:max-w-[600px]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Start Chatting..."
            className="bg-sec_background rounded-full p-4 pr-16 flex text-textColor w-full border border-transparent focus:border-primaryDark focus:outline-none transition-all duration-200"
            onKeyUp={(e) => e.key === 'Enter' && sendMessageToAI()}
          />
          <button
            onClick={sendMessageToAI}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 w-12 h-12 bg-sec_background text-textColor flex items-center justify-center"
          >
            <LuSend height={16} />
          </button>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="rounded-full flex justify-center items-center p-4 w-14 h-14 bg-primaryDark text-textColorContrast"
        >
          {muted ? <LuMicOff height={16} /> : <LuMic height={16} />}
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
