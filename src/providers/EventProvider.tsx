'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useWalletHandler } from '@/store/WalletHandler';
import { Message } from 'ai';
import { toast } from 'sonner';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { signingRequiredTools, TOOLSET_SLUGS } from '@/config/ai';
import { ToolCallResult } from '@/types/tool';
import { VersionedTransaction } from '@solana/web3.js';
import { useSessionHandler } from '@/store/SessionHandler';

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

export const EventProvider: FC<EventProviderProps> = ({ children }) => {
  /**
   * Global State
   */
  const { createChatRoom } = useChatRoomHandler();
  const { setLoadingMessage } = useChatMessageHandler();

  /**
   * Process a user message through the orchestration system
   * This replaces the old realtime model-based system
   */
  const processUserMessage = async (message: string): Promise<void> => {
    try {
      // Create a chat room if needed
      const currentChatRoom = useChatRoomHandler.getState().currentChatRoom;
      if (!currentChatRoom) {
        await createChatRoom({ name: 'New Chat' });
      }

      // Set loading state
      setLoadingMessage('Processing your request...');

      // Create a message object for the current request
      const currentMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date(),
      };

      // Add the message to the local state
      await useChatMessageHandler.getState().addMessage(currentMessage);

      // Get current wallet address
      const walletPublicKey =
        useWalletHandler.getState().currentWallet?.address;
      if (!walletPublicKey) {
        setLoadingMessage(null);
        toast.error('Please connect your wallet');
        return;
      }

      // Process with integrated GPT toolset selection and tool handling
      setLoadingMessage('Analyzing your request...');
      const response = await apiClient.post(
        '/api/chat',
        {
          walletPublicKey,
          message: currentMessage,
          currentRoomID: useChatRoomHandler.getState().currentChatRoom?.id,
        },
        'local'
      );

      if (!ApiClient.isApiResponse(response)) {
        setLoadingMessage(null);
        toast.error('Failed to process the request');
        return;
      }

      // Handle selected toolset (for informational purposes)
      const selectedToolset = response.data.selectedToolset;
      console.log(`Request processed using toolset: ${selectedToolset}`);

      // Handle the tool response
      const toolResults = response.data.toolResults;

      if (toolResults && toolResults.length > 0 && toolResults[0].result) {
        // Get the first tool result
        const toolResult = toolResults[0];

        // Check if this is a tool call that needs to be signed on the client side
        if (signingRequiredTools.includes(toolResult.toolName)) {
          // This is a tool call that needs to be signed on the client side
          setLoadingMessage('Preparing transaction...');
          const signedResult = await signAndSendTransaction({
            type: toolResult.type,
            response_id: toolResult.result.data.response_id,
            sender: toolResult.result.data.sender,
            timestamp: toolResult.result.data.timestamp,
            details: {
              ...toolResult.result.data.details,
            },
            transaction: toolResult.result.data.transaction,
          });

          if (signedResult.success) {
            toast.success(
              `Transaction sent successfully: ${signedResult.txid}`
            );
          } else {
            toast.error(signedResult.error);
          }
        }

        // Add the tools response to the chat
        await useChatMessageHandler.getState().addMessage({
          id: toolResult.toolCallId,
          role: 'assistant',
          content: JSON.stringify(toolResult.result) || '',
          createdAt: new Date(),
          parts: [
            {
              type: 'tool-invocation',
              toolInvocation: {
                state: 'result',
                result: toolResult.result,
                toolName: toolResult.toolName,
                toolCallId: toolResult.toolCallId,
                args: toolResult.args,
              },
            },
          ],
        } as Message);

        // Add a more user-friendly summary message
        await useChatMessageHandler.getState().addMessage({
          id: `summary_${Date.now()}`,
          role: 'assistant',
          content: `I've processed your request using the ${selectedToolset} toolset. Is there anything else you'd like to know?`,
          createdAt: new Date(),
        });
      } else {
        // If no tool results, add a fallback message
        await useChatMessageHandler.getState().addMessage({
          id: `fallback_${Date.now()}`,
          role: 'assistant',
          content:
            "I wasn't able to process your request with the available tools. Could you try rephrasing or be more specific?",
          createdAt: new Date(),
        });
      }

      // Clear loading state
      setLoadingMessage(null);
    } catch (error) {
      console.error('Error processing message:', error);
      setLoadingMessage(null);
      toast.error('Failed to process your request');
    }
  };

  // Expose the processUserMessage function to the global state
  useEffect(() => {
    // Register the message processor with the session handler
    const originalSendTextMessage =
      useSessionHandler.getState().sendTextMessage;
    useSessionHandler.getState().sendTextMessage = async (message: string) => {
      // Skip the original implementation and use our new processor
      await processUserMessage(message);
    };

    // Restore original function on cleanup
    return () => {
      useSessionHandler.getState().sendTextMessage = originalSendTextMessage;
    };
  }, []);

  return <>{children}</>;
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
    const response = await fetch('/api/wallet/sendTransaction', {
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
