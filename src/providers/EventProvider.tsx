'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';
import {
  createChatItemFromTool,
  useChatMessageHandler,
} from '@/store/ChatMessageHandler';
import { useCreditHandler } from '@/store/CreditHandler';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { getToolByName } from '@/lib/registry/toolRegistry';
import { executeToolCall } from '@/lib/executeTools';

interface EventProviderProps {
  children: ReactNode;
}

const handleSendMessage = async (message: string) => {
  if (!message) return;
  // wait 500ms before sending message to ensue the session is updated properly
  await new Promise((resolve) => setTimeout(resolve, 500));
  useSessionHandler.getState().sendTextMessage(message);
};

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession, sendFunctionCallResponseMessage } =
    useSessionHandler();
  const { addMessage } = useChatMessageHandler();
  const { createChatRoom, state } = useChatRoomHandler();
  const { calculateCreditUsage } = useCreditHandler();

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
        // console.log(eventData, null, 2);
        if (eventData.type === 'session.created') {
          // update the session with our latest tools, voice and emotion
          updateSession('all');
          // set that the session is now open to receive messages
          useSessionHandler.getState().state = 'open';
        } else if (
          eventData.type === 'error' &&
          eventData.error.type === 'session_expired'
        ) {
          // our session has expired so we set the state of the session to idle
          useSessionHandler.getState().state = 'idle';
        } else if (eventData.type === 'input_audio_buffer.speech_started') {
          useSessionHandler.getState().setIsUserSpeaking(true);
          if (
            !useChatRoomHandler.getState().currentChatRoom &&
            state === 'idle'
          ) {
            console.log(useChatRoomHandler.getState().currentChatRoom);
            createChatRoom({ name: 'New Chat' });
          }
        } else if (eventData.type === 'input_audio_buffer.speech_stopped') {
          useSessionHandler.getState().setIsUserSpeaking(false);
        } else if (
          eventData.type ===
          'conversation.item.input_audio_transcription.completed'
        ) {
          useChatMessageHandler.getState().addMessage({
            id: eventData.response_id,
            content: {
              type: 'user_audio_chat',
              response_id: eventData.event_id,
              sender: 'assistant',
              text: eventData.transcript,
            },
            createdAt: new Date().toISOString(),
          });
        } else if (
          eventData.type === 'response.audio_transcript.delta' ||
          eventData.type === 'response.text.delta'
        ) {
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
                type: 'in_progress_message',
                response_id: eventData.response_id,
                text: eventData.delta,
                sender: 'assistant',
              },
              id: eventData.response_id,
              createdAt: new Date().toISOString(),
            });
          }
        } else if (
          eventData.type === 'response.audio_transcript.done' ||
          eventData.type === 'response.text.done'
        ) {
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
          // handle credit calculation
          if (eventData.response.usage) {
            let cachedTokens,
              textInputTokens,
              audioInputTokens,
              outputTextTokens,
              outputAudioTokens = 0;
            if (eventData.response.usage.input_token_details) {
              cachedTokens =
                eventData.response.usage.input_token_details.cached_tokens;
              textInputTokens =
                eventData.response.usage.input_token_details.text_tokens;
              audioInputTokens =
                eventData.response.usage.input_token_details.audio_tokens;
            }
            if (eventData.response.usage.output_token_details) {
              outputTextTokens =
                eventData.response.usage.output_token_details.text_tokens;
              outputAudioTokens =
                eventData.response.usage.output_token_details.audio_tokens;
            }

            calculateCreditUsage(
              textInputTokens,
              audioInputTokens,
              cachedTokens,
              outputTextTokens,
              outputAudioTokens
            );
          }

          // handle the function calls
          if (eventData.response.output) {
            for (const output of eventData.response.output) {
              // check if the output is a function call. If it is a message call then ignore
              if (output.type === 'function_call') {
                console.log(output);
                // Check the tools this agent has access to
                const toolName = output.name;

                try {
                  // Parse the arguments as JSON
                  const args = JSON.parse(output.arguments);
                  console.log('Tool call args: ', args);
                  // Execute the tool with schema validation
                  const result = await executeToolCall(
                    toolName,
                    args,
                    eventData.response_id
                  );

                  if (result.status === 'success' && result.props) {
                    // Create a chat item from the tool result
                    const tool = getToolByName(toolName);

                    if (toolName === 'getAgentChanger') {
                      sendFunctionCallResponseMessage(
                        result.response,
                        output.call_id
                      );
                      useChatMessageHandler.getState().setCurrentChatItem(null);
                      await handleSendMessage(result.response);
                    } else if (tool && tool.name !== 'getAgentChanger') {
                      addMessage(createChatItemFromTool(tool, result.props));

                      // Send response back to OpenAI
                      sendFunctionCallResponseMessage(
                        result.response,
                        output.call_id
                      );
                    }
                  } else {
                    // Handle error case
                    sendFunctionCallResponseMessage(
                      result.response || 'An error occurred',
                      output.call_id
                    );
                  }

                  // Clear any current chat item
                  useChatMessageHandler.getState().setCurrentChatItem(null);
                } catch (error) {
                  console.error(`Error with function call ${toolName}:`, error);
                  sendFunctionCallResponseMessage(
                    `Error occurred: ${error}`,
                    output.call_id
                  );
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
