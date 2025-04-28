import { useEffect } from 'react';
import { Message, generateId } from 'ai';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useWalletHandler } from '@/store/WalletHandler';
import { useUserHandler } from '@/store/UserHandler';
import { VersionedTransaction } from '@solana/web3.js';

export function useChatMessages(
  roomId: string,
  audioController: ReturnType<typeof import('./useAudioPlayer').useAudioPlayer>,
  scrollController: ReturnType<
    typeof import('./useScrollBehavior').useScrollBehavior
  >
) {
  const { setLoadingMessage, messages: dbMessages } = useChatMessageHandler();

  // Set up useChat hook
  const { messages, setMessages, append, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: dbMessages,
    id: `chat-${roomId}`,
    body: {
      walletPublicKey: useWalletHandler.getState().currentWallet?.address,
      currentRoomID: roomId,
    },
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'sign_and_send_tx') {
        return await handleSignTransaction(toolCall.args);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Check for a pending message from localStorage on mount
  useEffect(() => {
    const pendingMessage = localStorage.getItem('pending_message');
    if (pendingMessage) {
      localStorage.removeItem('pending_message');
      processMessage(pendingMessage);
    }
  }, [roomId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isLoading && scrollController.isAutoScrollEnabled.current) {
      const messagesContainer = document.querySelector('.messages-container');
      const messagesEnd = document.querySelector('.messages-end');

      if (messagesEnd && messagesContainer) {
        scrollController.scrollToBottom(messagesEnd as HTMLElement);
      }
    }
  }, [messages, isLoading, scrollController]);

  // Message handling functions
  const processMessage = async (messageContent: string) => {
    audioController.handleUserInteraction();

    if (!useWalletHandler.getState().currentWallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    const currentMessage = {
      id: generateId(),
      content: messageContent,
      role: 'user',
      createdAt: new Date(),
    } as Message;

    const previousMessages = messages.slice(-5).map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      createdAt: new Date(),
    }));

    setLoadingMessage('Processing your request...');

    try {
      const toolsetResponse = await fetch('/api/get-required-toolsets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useUserHandler.getState().authToken}`,
        },
        body: JSON.stringify({
          walletPublicKey: useWalletHandler.getState().currentWallet?.address,
          message: currentMessage,
          previousMessages: previousMessages,
          currentRoomID: roomId,
        }),
      });

      if (toolsetResponse.status === 403) {
        toast.error(
          'Usage limit exceeded. Please upgrade your tier for more requests.',
          {
            description:
              "Based on your SOLA token holdings, you've reached your usage limit for this time period.",
            duration: 5000,
            action: {
              label: 'Learn More',
              onClick: () => window.open('https://docs.solaai.xyz/', '_blank'),
            },
          }
        );
        setLoadingMessage(null);
        return;
      }

      if (!toolsetResponse.ok) {
        throw new Error('Failed to determine required toolset');
      }

      const toolsetData = await toolsetResponse.json();

      if (toolsetData.selectedToolset.length === 0 || toolsetData.audioData) {
        handleAddUserMessage(currentMessage);
        handleAddAIResponse(toolsetData.fallbackResponse);

        if (toolsetData.audioData) {
          audioController.playAudio(toolsetData.audioData);
        }

        setLoadingMessage(null);
        return;
      }

      await handleSendMessage(messageContent, toolsetData.selectedToolset);
    } catch (error) {
      console.error('Error in message processing flow:', error);
      toast.error('Failed to process your request');
      setLoadingMessage(null);
    }
  };

  const handleSendMessage = async (text: string, toolsets: string[]) => {
    audioController.stopAudio();

    try {
      await append(
        {
          role: 'user',
          content: text,
        },
        { body: { requiredToolSets: toolsets } }
      );

      setLoadingMessage('Processing your request...');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setLoadingMessage(null);
    }
  };

  const handleAddAIResponse = (responseText: string) => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: generateId(),
          role: 'assistant',
          content: responseText,
          parts: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        },
      ]);

      setLoadingMessage(null);
    } catch (error) {
      console.error('Error adding AI response:', error);
      toast.error('Failed to process response');
      setLoadingMessage(null);
    }
  };

  const handleAddUserMessage = (userMessage: Message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: generateId(),
        role: 'user',
        content: userMessage.content,
        parts: [{ type: 'text', text: userMessage.content }],
      },
    ]);
  };

  // Transaction signing
  async function handleSignTransaction(args: any) {
    interface TransactionArgs {
      transactionHash: string;
    }
    try {
      const { transactionHash } = args as TransactionArgs;
      const currentWallet = useWalletHandler.getState().currentWallet;

      if (!currentWallet) {
        return {
          success: false,
          error: 'No wallet connected',
        };
      }

      const transactionBuffer = Buffer.from(transactionHash, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);
      const signedTransaction =
        await currentWallet.signTransaction(transaction);
      const rawTransaction = signedTransaction.serialize();

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

      if (!response.ok) {
        return {
          success: false,
          error: 'Transaction failed',
          message: responseData,
        };
      }

      return {
        success: true,
        message: responseData,
      };
    } catch (error) {
      return {
        success: false,
        error: `Transaction processing error: ${error || 'Unknown error'}`,
      };
    }
  }

  return {
    messages,
    isLoading,
    error,
    processMessage,
  };
}
