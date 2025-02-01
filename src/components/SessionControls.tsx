import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Mic, Send, MicOff } from 'lucide-react';
import useChatState from '../models/ChatState.ts';
import { Button } from '@headlessui/react';

const quotes = [
  'Connecting SOLA...',
  'Waking Up your Assistant...',
  'Summoning SOLA AI...',
  'Charging brain cells...',
];

export const SessionStopped = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex gap-2 items-center bg-sec_background py-4 px-6 rounded-full text-base text-textColor">
        {quotes[Math.floor(Math.random() * quotes.length)]}
      </div>
    </div>
  );
};

interface SessionActiveProps {
  sendTextMessage?: (message: string) => void;
}

export const SessionActive: React.FC<SessionActiveProps> = ({
  sendTextMessage,
}) => {
  const [message, setMessage] = useState('');
  const isMuted = useChatState((state) => state.isMuted);
  const toggleMute = useChatState((state) => state.toggleMute);

  const handleSendClientEvent = () => {
    if (!sendTextMessage)
      return console.error('Sending Text Message is not defined.');
    if (message.trim()) {
      sendTextMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendClientEvent();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="flex items-center justify-center h-full w-full gap-2 px-2">
      {sendTextMessage && (
        <div className="relative flex-1 max-w-full md:max-w-[600px]">
          <input
            type="text"
            placeholder="Send a text message..."
            className=" bg-sec_background rounded-full p-4 pr-16 flex text-textColor w-full sm:w-[300px] md:w-[600px]"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          <Button
            onClick={handleSendClientEvent}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 w-12 h-12 bg-sec_background text-textColor flex items-center justify-center"
          >
            <Send height={16} />
          </Button>
        </div>
      )}
      <Button
        onClick={toggleMute}
        className="rounded-full flex justify-center items-center p-4 w-14 h-14 bg-primaryDark text-textColorContrast"
      >
        {isMuted ? <MicOff height={16} /> : <Mic height={16} />}
      </Button>
    </div>
  );
};

interface SessionControlsProps {
  sendTextMessage: (message: string) => void;
  isSessionActive: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  sendTextMessage,
  isSessionActive,
}) => (
  <div className="flex gap-4 h-full w-full justify-center">
    {isSessionActive ? (
      <SessionActive sendTextMessage={sendTextMessage} />
    ) : (
      <SessionStopped />
    )}
  </div>
);
