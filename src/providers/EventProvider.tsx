'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useCreditHandler } from '@/store/CreditHandler';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useWalletHandler } from '@/store/WalletHandler';
import { Message } from 'ai';
import { toast } from 'sonner';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { signingRequiredTools, TOOLSET_SLUGS } from '@/config/ai';
import { ToolCallResult } from '@/types/tool';
import { VersionedTransaction } from '@solana/web3.js';

interface EventProviderProps {
  children: ReactNode;
}

interface TransactionDetails {
  transaction: string; // base64 encoded transaction
  details: {
    amount: number;
    input_mint: string;
    output_mint: string;
    limit_price?: number;
    action?: 'BUY' | 'SELL';
    priority_fee_needed: boolean;
    [key: string]: any;
  };
  type: string;
  response_id: string;
  sender: string;
  timestamp: string;
}

interface SendTransactionResult {
  success: boolean;
  txid?: string;
  error?: string;
  transactionDetails?: TransactionDetails;
}

export interface RealtimeOutputArgsTyped {
  toolset: typeof TOOLSET_SLUGS;
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
        // console.log(eventData);
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
          useChatMessageHandler
            .getState()
            .addMessage({
              id: eventData.event_id,
              content: eventData.transcript,
              role: 'data',
            })
            .catch(() => toast.error('failed to add message'));
        } else if (
          eventData.type === 'response.audio_transcript.delta' ||
          eventData.type === 'response.text.delta'
        ) {
          useChatMessageHandler.getState().setShowMessageSkeleton(true);
        } else if (
          eventData.type === 'response.audio_transcript.done' ||
          eventData.type === 'response.text.done'
        ) {
          useChatMessageHandler.getState().setShowMessageSkeleton(false);
          useChatMessageHandler.getState().addMessage(eventData.text);
        } else if (eventData.type === 'response.done') {
          useChatMessageHandler.getState().setShowMessageSkeleton(false);
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
              if (
                output.type === 'function_call' &&
                output.name === 'getRequiredToolset'
              ) {
                try {
                  useChatMessageHandler
                    .getState()
                    .setLoadingMessage('Processing Your Query');
                  const args = JSON.parse(
                    output.arguments
                  ) as RealtimeOutputArgsTyped;
                  const walletPublicKey =
                    useWalletHandler.getState().currentWallet?.address;
                  if (!walletPublicKey) {
                    toast.error('Please connect your wallet');
                    return;
                  }
                  // Create a message object for the current request
                  const currentMessage: Message = {
                    id: `msg_${Date.now()}`,
                    role: 'user',
                    content: args.original_request,
                    createdAt: new Date(),
                  };

                  // process the tool handling on the server
                  const response = await apiClient.post(
                    '/api/chat',
                    {
                      walletPublicKey,
                      requiredToolSet: args.toolset,
                      message: currentMessage,
                      currentRoomID:
                        useChatRoomHandler.getState().currentChatRoom?.id,
                    },
                    'local'
                  );

                  if (ApiClient.isApiResponse<ToolCallResult[]>(response)) {
                  } else {
                    useChatMessageHandler.getState().setLoadingMessage(null);
                    toast.error('Failed to process the request');
                    sendFunctionCallResponseMessage(
                      'Request processing unsuccessful',
                      output.call_id
                    );
                    return;
                  }
                  // TODO: Handle the response from the server
                  // check if this is a tool call that needs to be signed on the client side
                  if (
                    signingRequiredTools.find(
                      (tool) => tool === response.data[0].toolName
                    )
                  ) {
                    // this is a tool call that needs to be signed on the client side
                    const signedResult = await signAndSendTransaction({
                      type: response.data[0].type,
                      response_id: response.data[0].result.data.response_id,
                      sender: response.data[0].result.data.sender,
                      timestamp: response.data[0].result.data.timestamp,
                      details: {
                        ...response.data[0].result.data.details,
                      },
                      transaction: response.data[0].result.data.transaction,
                    });
                    if (signedResult.success) {
                      toast.success(
                        `Transaction sent successfully: ${signedResult.txid}`
                      );
                      sendFunctionCallResponseMessage(
                        `Transaction sent successfully: ${signedResult.txid}`,
                        output.call_id
                      );
                    } else {
                      toast.error(signedResult.error);
                      sendFunctionCallResponseMessage(
                        `Error occurred: ${signedResult.error}`,
                        output.call_id
                      );
                    }
                  }
                  useChatMessageHandler.getState().setLoadingMessage(null);
                  useChatMessageHandler.getState().addMessage(currentMessage);
                  // add the tools response also to the chat
                  useChatMessageHandler.getState().addMessage({
                    id: response.data[0].toolCallId,
                    role: 'assistant',
                    content: JSON.stringify(response.data[0].result),
                    createdAt: new Date(),
                    parts: [
                      {
                        type: 'tool-invocation',
                        toolInvocation: {
                          state: 'result',
                          result: response.data[0].result,
                          toolName: response.data[0].toolName,
                          toolCallId: response.data[0].toolCallId,
                          args: response.data[0].args,
                        },
                      },
                    ],
                  } as Message);
                  sendFunctionCallResponseMessage(
                    'Provide a small summary of the following output: ' +
                      JSON.stringify(response.data[0].result),
                    output.call_id
                  );

                  console.log(
                    'response from server,',
                    response.data[0].result,
                    response.data[0].toolName,
                    response.data[0].toolCallId,
                    response.data[0].args
                  );
                  // Clear any current chat item
                  useChatMessageHandler.getState().setCurrentMessage(null);
                } catch (error) {
                  useChatMessageHandler.getState().setLoadingMessage(null);
                  console.error(error);
                  toast.error('Failed to process the request');
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

export async function signAndSendTransaction(
  transactionDetails: TransactionDetails
): Promise<SendTransactionResult> {
  try {
    // Get the current wallet from the zustand store
    const currentWallet = useWalletHandler.getState().currentWallet;

    if (!currentWallet) {
      return {
        success: false,
        error: 'No wallet connected',
        transactionDetails,
      };
    }

    // Decode the base64 transaction
    const transactionBuffer = Buffer.from(
      transactionDetails.transaction,
      'base64'
    );
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Sign the transaction with the wallet
    const signedTransaction = await currentWallet.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();

    // Send the signed transaction to your backend API
    const response = await fetch('/api/send-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serializedTransaction: Buffer.from(rawTransaction).toString('base64'),
        options: {
          skipPreflight: true,
          maxRetries: 10,
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.status === 'error') {
      useChatMessageHandler.getState().setLoadingMessage(null);
      throw new Error(responseData.message || 'Failed to send transaction');
    }

    return {
      success: true,
      txid: responseData.txid,
      transactionDetails,
    };
  } catch (error) {
    console.error('Error signing and sending transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      transactionDetails,
    };
  }
}
