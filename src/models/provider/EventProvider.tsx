import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';
import {
  createChatItemFromTool,
  useChatMessageHandler,
} from '../ChatMessageHandler.ts';
import { SimpleMessageChatContent } from '../../types/chatItem.ts';
import { useAgentHandler } from '../AgentHandler.ts';
import { useChatRoomHandler } from '../ChatRoomHandler.ts';
<<<<<<< HEAD
import { Tool } from '../../types/tool.ts';
import { useWalletHandler } from '../WalletHandler.ts';
=======
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession, sendMessage } = useSessionHandler();
  const { getToolsForAgent } = useAgentHandler();
  const { currentChatRoom } = useChatRoomHandler();
<<<<<<< HEAD
  const { currentWallet } = useWalletHandler();
=======
  const { addMessage } = useChatMessageHandler();
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda

  /**
   * The direct api access is used in all these classes to prevent asynchronous
   * calls to the api. This is because the api calls are not dependent on the
   * state of the component and are only dependent on the data stream. This also
   * prevents re-renders
   */
  useEffect(() => {
    const handleEvents = async () => {
      if (dataStream === null) return;
      dataStream.onmessage = async (event) => {
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
        } else if (eventData.type === 'response.done') {
          // handle the function calls
          if (eventData.response.output) {
            for (const output of eventData.response.output) {
              // check if the output is a function call. If it is a message call then ignore
              if (output.type === 'function_call') {
                // Check the tools this agent has access to
                const tool = getToolsForAgent(currentChatRoom!.agentId).find(
                  (tool) => tool.abstraction.name === output.name,
                );
                if (tool) {
                  // call the tool handling function and add its output chat item to the chat
<<<<<<< HEAD
                  const response = await tool.implementation({
                    ...JSON.parse(output.arguments),
                    wallet: currentWallet,
                  });
                  
                  // send the response back to OpenAI
                  sendMessage(response);
=======
                  const tool_result = await tool.implementation(
                    JSON.parse(output.arguments),
                    eventData.response_id,
                  );
                  // add the message to our local array and also our database history
                  addMessage(createChatItemFromTool(tool, tool_result.props));
                  // send the response to OpenAI
                  sendMessage(tool_result.response);
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda
                } else {
                  // this agent does not support this tool. This is a fail-safe as mostly openAI will not send out
                  // a function call as it was not provided the context even
                  return;
                }
              }
            }
          }
        }
<<<<<<< HEAD
=======
        // console.log(JSON.stringify(eventData, null, 2));
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
