import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Mic, Send, MicOff } from 'react-feather';
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
      <div className="flex gap-2 items-center bg-bodydark1 py-4 px-6 rounded-full text-base text-graydark">
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
    <div className="flex items-center justify-center w-full h-full gap-4">
      {sendTextMessage && (
        <>
          <input
            type="text"
            placeholder="Send a text message..."
            className="border border-[#E7E7E7] bg-graydark rounded-2xl p-4 min-w-full flex text-bodydark1 dark:bg-bodydark2 dark:border-none"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          <Button
            onClick={handleSendClientEvent}
            className="rounded-3xl p-4 w-16 h-16 bg-body text-graydark"
          >
            <Send height={16} />
          </Button>
        </>
      )}
      <Button
        onClick={toggleMute}
        className="rounded-3xl p-4 w-20 h-16 bg-body text-graydark"
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
  <div className="flex gap-4 h-full rounded-md">
    {isSessionActive ? (
      <SessionActive sendTextMessage={sendTextMessage} />
    ) : (
      <SessionStopped />
    )}
  </div>
);
