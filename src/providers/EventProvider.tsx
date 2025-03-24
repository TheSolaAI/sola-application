'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useCreditHandler } from '@/store/CreditHandler';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { toolsHandlerPrompt } from '@/lib/ai/agentsConfig';
import { useWalletHandler } from '@/store/WalletHandler';
import { Message } from 'ai';
import { TOOL_NAMES } from '@/lib/constants';
import { useUserHandler } from '@/store/UserHandler';

interface EventProviderProps {
  children: ReactNode;
}

export type ToolName = (typeof TOOL_NAMES)[number];
export interface RealtimeOutputArgsTyped {
  required_tools: ToolName;
  original_request: string;
}

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { dataStream, updateSession, sendFunctionCallResponseMessage } =
    useSessionHandler();
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
            createChatRoom({ name: 'New Chat' });
          }
        } else if (eventData.type === 'input_audio_buffer.speech_stopped') {
          useSessionHandler.getState().setIsUserSpeaking(false);
        } else if (
          eventData.type ===
          'conversation.item.input_audio_transcription.completed'
        ) {
        } else if (
          eventData.type === 'response.audio_transcript.delta' ||
          eventData.type === 'response.text.delta'
        ) {
          // a part of the audio response transcript has been received
          if (useChatMessageHandler.getState().currentChatItem !== null) {
            // We are still receiving delta events for the current message so we keep appending to it
            useChatMessageHandler
              .getState()
              .updateCurrentMessage(eventData.delta);
          } else {
            // this is a new message so create a new one
            useChatMessageHandler.getState().setCurrentMessage({
              id: eventData.response_id,
              role: 'assistant',
              parts: [{ type: 'text', text: eventData.delta }],
              content: eventData.delta,
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
              useChatMessageHandler.getState().currentChatItem?.id
          ) {
            // this is the final event for the current message so we commit it
            useChatMessageHandler.getState().commitCurrentChat();
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
                  const args = JSON.parse(
                    output.arguments
                  ) as RealtimeOutputArgsTyped;
                  console.log('Tool call args: ', args);

                  const userWallet = useWalletHandler.getState().currentWallet;
                  const userPublicKey = userWallet?.address || '';

                  // Get context from previous messages (top 8-10)
                  const previousMessages = useChatMessageHandler
                    .getState()
                    .getTopMessages(8);

                  // Create a message object for the current request
                  const currentMessage: Message = {
                    id: `msg_${Date.now()}`,
                    role: 'user',
                    content: args.original_request,
                    createdAt: new Date(),
                  };

                  // Combine previous messages with the current message for context
                  const messages =
                    previousMessages.length > 0
                      ? [...previousMessages, currentMessage]
                      : [currentMessage]; // Handle case with no previous messages

                  // Get user emotion and name for prompt personalization
                  const aiEmotion = useSessionHandler.getState().aiEmotion;
                  const userName = useUserHandler.getState().name || 'User';

                  // Add the current user message to the chat history
                  await useChatMessageHandler
                    .getState()
                    .addMessage(currentMessage);

                  // Call our API endpoint
                  const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      aiPrompt: toolsHandlerPrompt,
                      userPublicKey,
                      requiredTools: [args.required_tools],
                      message: messages,
                    }),
                  });

                  if (!response.ok) {
                    sendFunctionCallResponseMessage(
                      'Request processing unsuccessful',
                      output.call_id
                    );
                  } else {
                    sendFunctionCallResponseMessage(
                      'Request processed successfully',
                      output.call_id
                    );
                  }

                  // Clear any current chat item
                  useChatMessageHandler.getState().setCurrentMessage(null);
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
