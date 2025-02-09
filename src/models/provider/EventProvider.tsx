import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';
import { toast } from 'sonner';

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
          toast.success('Session created');
          updateSession();
          toast.success('Session updated');
          getResponse({
            message:
              'Introduce yourself as Sola, personal AI assistant for the Solana Block Chain',
            status: 'success',
          });
        }
        console.log(JSON.stringify(eventData, null, 2));
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
