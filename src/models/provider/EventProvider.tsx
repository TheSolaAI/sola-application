import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';
import { useChatMessageHandler } from '../ChatMessageHandler.ts';
import { SimpleMessageChatContent } from '../../types/chatItem.ts';

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession } = useSessionHandler();

  /**
   * The direct api access is used in all these classes to prevent asynchronous
   * calls to the api. This is because the api calls are not dependent on the
   * state of the component and are only dependent on the data stream. This also
   * prevents re-renders
   */
  useEffect(() => {
    const handleEvents = async () => {
      if (dataStream === null) return;
      dataStream.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        if (eventData.type === 'session.created') {
          // update the session with our latest tools, voice and emotion
          updateSession();
        } else if (eventData.type === 'response.audio_transcript.delta') {
          // a part of the audio response transcript has been received
          if (useChatMessageHandler.getState().currentChatItem !== null) {
            // We are still receiving delta events for the current message so we keep appending to it
            useChatMessageHandler
              .getState()
              .updateCurrentChatItem(eventData.delta);
          } else {
            // this is a new message so create a new one
            useChatMessageHandler.getState().setCurrentChatItem({
              content: {
                type: 'simple_message',
                response_id: eventData.response_id,
                text: eventData.delta,
              } as SimpleMessageChatContent,
              id: eventData.response_id,
              createdAt: new Date().toISOString(),
            });
          }
        } else if (eventData.type === 'response.audio_transcript.done') {
          // check if the current message matches with this response
          if (
            eventData.response_id ===
            useChatMessageHandler.getState().currentChatItem?.id
          ) {
            // this is the final event for the current message so we commit it
            useChatMessageHandler.getState().commitCurrentChatItem();
          }
        }
        console.log(JSON.stringify(eventData, null, 2));
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
