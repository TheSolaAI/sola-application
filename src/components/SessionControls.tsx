import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Mic, Send, MicOff, XCircle } from 'react-feather';
import useChatState from '../store/zustand/ChatState';
import { Button } from '@headlessui/react';

interface SessionStoppedProps {
  startSession: () => void;
}

const SessionStopped: React.FC<SessionStoppedProps> = ({ startSession }) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleStartSession = () => {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className="flex gap-2 items-center bg-bodydark1 py-4 px-6 rounded-full text-base text-graydark"
      >
        <Mic height={16} />{' '}
        {isActivating ? 'Connecting...' : 'Start Conversation'}
      </Button>
    </div>
  );
};

interface SessionActiveProps {
  stopSession: () => void;
  sendTextMessage: (message: string) => void;
}

const SessionActive: React.FC<SessionActiveProps> = ({
  stopSession,
  sendTextMessage,
}) => {
  const [message, setMessage] = useState('');
  const { isMuted, toggleMute } = useChatState();

  const handleSendClientEvent = () => {
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
      <Button
        onClick={toggleMute}
        className="rounded-3xl p-4 w-20 h-16 bg-body text-graydark"
      >
        {isMuted ? <MicOff height={16} /> : <Mic height={16} />}
      </Button>

      <Button
        onClick={stopSession}
        className="rounded-3xl p-4 w-16 h-16 bg-body text-graydark"
      >
        <XCircle height={16} />
      </Button>
    </div>
  );
};

interface SessionControlsProps {
  startSession: () => void;
  stopSession: () => void;
  sendTextMessage: (message: string) => void;
  isSessionActive: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  startSession,
  stopSession,
  sendTextMessage,
  isSessionActive,
}) => (
  <div className="flex gap-4 h-full rounded-md">
    {isSessionActive ? (
      <SessionActive
        stopSession={stopSession}
        sendTextMessage={sendTextMessage}
      />
    ) : (
      <SessionStopped startSession={startSession} />
    )}
  </div>
);

export default SessionControls;
