import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '../SessionHandler.ts';
import {
  createChatItemFromTool,
  useChatMessageHandler,
} from '../ChatMessageHandler.ts';
import { SimpleMessageChatContent } from '../../types/chatItem.ts';
import { useAgentHandler } from '../AgentHandler.ts';
import { useWalletHandler } from '../WalletHandler.ts';
import { useCreditHandler } from '../CreditHandler.ts';
import { getAgentSwapper } from '../../tools';

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession, sendFunctionCallResponseMessage } =
    useSessionHandler();
  const { currentWallet } = useWalletHandler();
  const { addMessage } = useChatMessageHandler();
  const {} = useCreditHandler();

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
        console.log(eventData, null, 2);
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
            useChatMessageHandler.getState().currentChatItem === null ||
            eventData.response_id ===
              useChatMessageHandler.getState().currentChatItem?.content
                .response_id
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
                const tool =
                  output.name === 'getAgentSwapper'
                    ? getAgentSwapper
                    : useAgentHandler
                        .getState()
                        .currentActiveAgent?.tools.find(
                          (tool) => tool.abstraction.name === output.name,
                        );
                if (tool) {
                  const tool_result = await tool.implementation(
                    {
                      ...JSON.parse(output.arguments),
                      currentWallet: currentWallet,
                    },
                    eventData.response_id,
                  );
                  // calculate the cost of this function call and the input and output tokens used by it
                  // add the message to our local array and also our database history
                  if (tool_result.status === 'success')
                    if (tool_result.props?.type === 'agent_swap') {
                      // we have switched agents so we do not want to render the message
                      // we will just re prompt the AI with the original request
                      useChatMessageHandler.getState().setCurrentChatItem(null);
                      useSessionHandler
                        .getState()
                        .sendTextMessage(tool_result.props.original_request);
                      return;
                    } else {
                      addMessage(
                        createChatItemFromTool(tool, tool_result.props),
                      );
                      // send the response to OpenAI
                      sendFunctionCallResponseMessage(
                        tool_result.response,
                        output.call_id,
                      );
                    }
                  useChatMessageHandler.getState().setCurrentChatItem(null);
                } else {
                  // we do not have this tool and somehow the auto agent swapper was not called
                  // TODO: Handle this by prompting the user to manually switch agents
                  return;
                }
              }
            }
          }
        }
      };
    };
    handleEvents();
  }, [dataStream]);

  return <div>{children}</div>;
};
