import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession } = useSessionHandler();

  useEffect(() => {
    const handleEvents = async () => {
      if (dataStream === null) return;
      dataStream.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        // Is the session just created?
        if (eventData.type === 'session.created') {
          // update the session with our latest tools, voice and emotion
          updateSession();
        }
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
