import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, RefreshCw } from 'lucide-react';
import { useSessionHandler } from '../models/SessionHandler.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const LOADING_QUOTES = [
  'Connecting SOLA...',
  'Waking Up your Assistant...',
  'Summoning SOLA AI...',
  'Charging brain cells...',
] as const;

export const SessionControls = () => {
  /**
   * Global States
   */
  const { muted, setMuted, state, sendTextMessage } = useSessionHandler();
  const { addMessage } = useChatMessageHandler();

  /**
   * Local States
   */
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(
    Math.floor(Math.random() * LOADING_QUOTES.length),
  );
  const [currentQuote, setCurrentQuote] = useState(
    LOADING_QUOTES[loadingQuoteIndex],
  );

  /**
   * Refs
   */
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cycle through loading quotes
  useEffect(() => {
    if (state === 'loading') {
      const interval = setInterval(() => {
        setLoadingQuoteIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % LOADING_QUOTES.length;
          setCurrentQuote(LOADING_QUOTES[newIndex]);
          return newIndex;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [state]);

  const sendMessageToAI = () => {
    if (inputRef.current?.value === '') return;
    // if (credits <= 0) {
    //   toast.warning('Refuel your credits to keep going!');
    //   return;
    // }

    addMessage({
      id: 0,
      content: {
        type: 'user_audio_chat',
        response_id: 'Text-Input-0',
        sender: 'user',
        text: inputRef.current?.value || '',
      },
      createdAt: new Date().toISOString(),
    });
    sendTextMessage(inputRef.current?.value || '');
    inputRef.current!.value = '';
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full mb-10">
      {/* Loading Pill */}
      <div
        className={`
          absolute flex items-center justify-center w-full h-full
          transition-all duration-500 ease-in-out
          ${state === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center gap-2 bg-sec_background py-4 px-6 rounded-full text-base text-textColor">
          {currentQuote}
        </div>
      </div>

      {/* Input Controls */}
      <div
        className={`
          absolute flex items-center justify-center w-full h-full gap-2 px-2
          transition-all duration-500 ease-in-out
          ${state === 'open' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="relative flex-1 max-w-full sm:max-w-[600px]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Start Chatting..."
            className="
              bg-sec_background rounded-full p-4 pr-16
              flex text-textColor w-full
              border border-transparent focus:border-primaryDark
              focus:outline-none transition-all duration-200
            "
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                sendMessageToAI();
              }
            }}
          />
          <button
            onClick={() => {
              sendMessageToAI();
            }}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              rounded-full p-3 w-12 h-12 bg-sec_background text-textColor
              flex items-center justify-center
            "
          >
            <Send height={16} />
          </button>
        </div>
        <button
          onClick={() => {
            // if (credits <= 0 && muted) {
            //   toast.warning('Refuel your credits to keep going!');
            //   return;
            // }
            setMuted(!muted);
          }}
          className="
            rounded-full flex justify-center items-center
            p-4 w-14 h-14 bg-primaryDark text-textColorContrast
          "
        >
          {muted ? <MicOff height={16} /> : <Mic height={16} />}
        </button>
      </div>

      {/* Reconnect Button */}
      <div
        className={`
          absolute flex items-center justify-center w-full h-full
          transition-all duration-500 ease-in-out
          ${state === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <button
          className="
            flex items-center gap-2 bg-primaryDark text-textColorContrast
            py-4 px-6 rounded-full text-base
            hover:bg-primary transition-colors duration-200
          "
        >
          <RefreshCw size={16} />
          Reconnect Session
        </button>
      </div>
    </div>
  );
};
