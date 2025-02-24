import React, { useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { useSessionHandler } from '../models/SessionHandler.ts';
import { useLayoutContext } from '../layout/LayoutProvider.tsx';

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
  const { vadInstance } = useLayoutContext();

  /**
   * Local States
   */
  const [loadingQuote] = useState(
    LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)],
  );

  /**
   * Refs
   */
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sendMessageToAI = () => {
    if (inputRef.current?.value === '') return;
    sendTextMessage(inputRef.current?.value || '');
    inputRef.current!.value = '';
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Loading Pill */}
      <div
        className={`
          absolute flex items-center justify-center w-full h-full
          transition-all duration-500 ease-in-out
          ${state === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <div className="flex items-center gap-2 bg-sec_background py-4 px-6 rounded-full text-base text-textColor">
          {loadingQuote}
        </div>
      </div>

      {/* Controls */}
      <div
        className={`
          flex items-center justify-center w-full h-full gap-2 px-2
          transition-all duration-500 ease-in-out
          ${state === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
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
            setMuted(!muted);
            if (muted) {
              vadInstance.start();
            } else {
              vadInstance.pause();
            }
          }}
          className="
            rounded-full flex justify-center items-center
            p-4 w-14 h-14 bg-primaryDark text-textColorContrast
          "
        >
          {muted ? <MicOff height={16} /> : <Mic height={16} />}
        </button>
      </div>
    </div>
  );
};
