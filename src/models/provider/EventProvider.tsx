import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession, getResponse } = useSessionHandler();

  useEffect(() => {
    const handleEvents = async () => {
      if (dataStream === null) return;
      dataStream.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        // Is the session just created?
        if (eventData.type === 'session.created') {
          // update the session with our latest tools, voice and emotion
          updateSession();
          getResponse({
            message:
              'Introduce yourself as Sola, personal AI assistant for the Solana Block Chain and nothing else',
            status: 'success',
          });
        } else if (eventData.type === 'response.audio_transcript.delta') {
          // a part of the audio response transcript has been received
        }
        console.log(JSON.stringify(eventData, null, 2));
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
