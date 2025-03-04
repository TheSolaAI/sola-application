import { create } from 'zustand';
import { useChatRoomHandler } from './ChatRoomHandler.ts';
import { toast } from 'sonner';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import {
  ChatMessageResponseWrapper,
  ChatMessagesResponse,
} from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import {
  AiProjectsChatContent,
  BubbleMapChatContent,
  ChatContentType,
  ChatItem,
  GetTrendingNFTSChatContent,
  InProgressChatContent,
  LoaderMessageChatContent,
  LuloChatContent,
  MarketDataChatContent,
  NFTCollectionChatContent,
  RugCheckChatContent,
  ShowLimitOrdersChatContent,
  ShowLSTDataChatContent,
  SimpleMessageChatContent,
  SwapChatContent,
  TokenDataChatContent,
  TopHoldersChatContent,
  TransactionChatContent,
  UserAudioChatContent,
} from '../types/chatItem.ts';
import { Tool } from '../types/tool.ts';
import { generateUniqueId } from '../utils/randomID.ts';
import { MessageQueue, SerializedQueue } from '../utils/MessageQueue.ts';

interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat message handler

  messages: ChatItem<ChatContentType>[]; // stores an array of all the chat messages. Is managed entirely by this model
  messageQueueData: SerializedQueue<ChatItem<ChatContentType>>; // stores an array of messages that are yet to be sent to server.
  /**
   * The current message that is being generated. This currently only supports Simple Messages
   * // TODO: Add support for other loader message types.
   */
  currentChatItem: ChatItem<
    InProgressChatContent | LoaderMessageChatContent
  > | null;

  next: string | null; // the next url to fetch more messages. If set to null then no more messages are available

  /**
   * Initializes the chat message handler with the current chatRoom's messages.
   * This function is called whenever the current chat room is changed. Unlike other
   * handlers, this handler's lifecycle is managed by the chat room handler.
   */
  initChatMessageHandler: () => Promise<void>;

  /**
   * Gets the next set of messages from the server based on the next URL
   */
  getNextMessages: () => Promise<void>;

  /**
   * Adds a new message to the message array and updates the history on the server.
   * If there is no chatroom set by default then it creates a new chat room and adds the
   * message to that chat room.
   */
  addMessage: (message: ChatItem<ChatContentType>) => Promise<void>;

  /**
   * Sets a new current message when we get a response from the server
   * @param messageUpdater
   */
  setCurrentChatItem: (
    messageUpdater: ChatItem<
      LoaderMessageChatContent | InProgressChatContent
    > | null,
  ) => void;

  /**
   * Updates the current message text with the new delta
   */
  updateCurrentChatItem: (delta: string) => void;

  /**
   * Commits the current message to the message array and sends the result to
   * our database
   */
  commitCurrentChatItem: () => Promise<void>;

  // Helpers to work with the queue
  enqueueMessage: (message: ChatItem<ChatContentType>) => void;
  dequeueMessage: () => ChatItem<ChatContentType> | undefined;
  getQueueSize: () => number;
  clearQueue: () => void;
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  // Creating an empty queue to store the temporary messages that are formed during new chat creation.
  const emptyQueue = MessageQueue.createEmpty<ChatItem<ChatContentType>>();

  return {
    state: 'idle',
    next: null,
    messages: [],
    messageQueueData: emptyQueue,
    currentChatItem: null,

    // Helper methods to work with the message queue
    enqueueMessage: (message: ChatItem<ChatContentType>): void => {
      try {
        const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
          get().messageQueueData,
        );
        queue.enqueue(message);
        set({ messageQueueData: queue.serialize() });
      } catch (error) {
        console.error('Error enqueuing message:', error);
        // Create a new queue if there's an error
        const newQueue = new MessageQueue<ChatItem<ChatContentType>>();
        newQueue.enqueue(message);
        set({ messageQueueData: newQueue.serialize() });
      }
    },

    dequeueMessage: (): ChatItem<ChatContentType> | undefined => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData,
      );
      const message = queue.dequeue();
      set({ messageQueueData: queue.serialize() });
      return message;
    },

    getQueueSize: (): number => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData,
      );
      return queue.size();
    },

    clearQueue: (): void => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData,
      );
      queue.clear();
      set({ messageQueueData: queue.serialize() });
    },

    initChatMessageHandler: async () => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomID) {
        toast.success('New Chat Created');
        set({ messages: [], currentChatItem: null });
        return;
      }
      set({ state: 'loading', messages: [], currentChatItem: null });
      // fetch only the first 40 messages and we will fetch the rest as we scroll
      const response = await apiClient.get<ChatMessagesResponse>(
        API_URLS.CHAT_ROOMS + currentRoomID + '/messages/?limit=40',
        undefined,
        'auth',
      );
      if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
        set({ state: 'idle' });
        const messages: ChatItem<ChatContentType>[] = response.data.results
          .reduce(
            (
              acc: ChatItem<ChatContentType>[],
              message: ChatMessageResponseWrapper,
            ) => {
              const item = parseChatItemContent(message);
              if (item) {
                acc.push(item);
              }
              return acc;
            },
            [],
          )
          .reverse();
        set({ messages, state: 'idle', next: response.data.next });
      } else {
        set({ state: 'error' });
        toast.error('Failed to fetch messages');
      }
    },

    getNextMessages: async () => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomID) toast.error('No Chat Room Selected');
      if (!get().next) return;
      set({ state: 'loading' });
      const response = await apiClient.get<ChatMessagesResponse>(
        get().next!,
        undefined,
        'auth',
      );
      if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
        set({ state: 'idle' });
        const messages: ChatItem<ChatContentType>[] =
          response.data.results.reduce(
            (
              acc: ChatItem<ChatContentType>[],
              message: ChatMessageResponseWrapper,
            ) => {
              const item = parseChatItemContent(message);
              if (item) {
                acc.push(item);
              }
              return acc;
            },
            [],
          );
        set({
          messages: [...get().messages, ...messages],
          state: 'idle',
          next: response.data.next,
        });
      } else {
        set({ state: 'error' });
        toast.error('Failed to fetch messages');
      }
    },

    addMessage: async (chatItem: ChatItem<ChatContentType>) => {
      if (useChatRoomHandler.getState().isCreatingRoom) {
        // store the messages in the queue, since we have to wait for the new chat to get created.
        get().enqueueMessage(chatItem);
        return;
      }

      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;

      if (currentRoomID === undefined) {
        useChatRoomHandler.getState().setIsCreatingRoom(true);
        try {
          // no chat room has been selected so we create a new one with our default agent and navigate the user to that room
          const newRoom = await useChatRoomHandler.getState().createChatRoom({
            name: 'New Chat',
          });

          if (newRoom) {
            // we then add this message to the new room on our server
            const response = await apiClient.post(
              API_URLS.CHAT_ROOMS + newRoom.id + '/messages/',
              { message: JSON.stringify(chatItem.content) },
              'auth',
            );

            if (ApiClient.isApiError(response)) {
              toast.error('Failed to Save Message, Reload the Page');
            }
            // add the message to our local state
            set({ messages: [chatItem] });
          }
        } catch (error) {
          console.error('Error creating chat room:', error);
          toast.error('Failed to create chat room');
        } finally {
          useChatRoomHandler.getState().setIsCreatingRoom(false);
        }
      } else {
        const response = await apiClient.post(
          API_URLS.CHAT_ROOMS + currentRoomID + '/messages/',
          { message: JSON.stringify(chatItem.content) },
          'auth',
        );
        if (ApiClient.isApiError(response)) {
          toast.error('Failed to Save Message, Reload the Page');
        }
        set({ messages: [...get().messages, chatItem] });
      }

      try {
        // Process all queued messages and upload them to the server
        const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
          get().messageQueueData,
        );
        if (!queue.isEmpty()) {
          // Get messages before clearing
          const queueMessages = queue.toArray();

          // Clear the queue to prevent reprocessing
          get().clearQueue();

          // Process all messages in the queue
          for (const message of queueMessages) {
            console.log('Processing queued message:', message);
            try {
              const response = await apiClient.post(
                API_URLS.CHAT_ROOMS + currentRoomID + '/messages/',
                { message: JSON.stringify(message.content) },
                'auth',
              );
              if (ApiClient.isApiError(response)) {
                toast.error('Failed to save queued message');
              }
              set({ messages: [...get().messages, message] });
            } catch (error) {
              console.error('Error processing queued message:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error processing message queue:', error);
      }
    },

    setCurrentChatItem: (
      message: ChatItem<
        InProgressChatContent | LoaderMessageChatContent
      > | null,
    ) => {
      set({ currentChatItem: message });
    },

    updateCurrentChatItem: (delta: string) => {
      if (get().currentChatItem) {
        set({
          currentChatItem: {
            ...get().currentChatItem!,
            content: {
              ...get().currentChatItem!.content,
              text: get().currentChatItem!.content.text + delta,
            },
          },
        });
      } else {
        set({
          currentChatItem: {
            id: 0,
            createdAt: new Date().toISOString(),
            content: {
              type: 'in_progress_message',
              response_id: '',
              sender: 'user',
              text: delta,
            },
          },
        });
      }
    },

    commitCurrentChatItem: async () => {
      if (get().currentChatItem) {
        // add the message in our server
        // convert the in progress chat item to a simple message chat item
        const converted: ChatItem<SimpleMessageChatContent> = {
          id: get().currentChatItem!.id,
          content: {
            type: 'simple_message',
            response_id: get().currentChatItem!.content.response_id,
            sender: get().currentChatItem!.content.sender,
            text: get().currentChatItem!.content.text,
          },
          createdAt: get().currentChatItem!.createdAt,
        };
        await get().addMessage(converted);
        set({
          currentChatItem: null,
        });
      }
    },
  };
});

/**
 * Parses the content of a chat item from a JSON string to the appropriate ChatContent type
 * @param item The chat item to parse
 */
const parseChatItemContent = (item: ChatMessageResponseWrapper) => {
  const parsedContent = JSON.parse(item.message);
  console.log(parsedContent);
  if (isSimpleMessageChatContent(parsedContent)) {
    return createChatItem<SimpleMessageChatContent>(item, parsedContent);
  } else if (isUserAudioChatContent(parsedContent)) {
    return createChatItem<UserAudioChatContent>(item, parsedContent);
  } else if (isTokenDataChatContent(parsedContent)) {
    return createChatItem<TokenDataChatContent>(item, parsedContent);
  } else if (isBubblemapChatContent(parsedContent)) {
    return createChatItem<BubbleMapChatContent>(item, parsedContent);
  } else if (isSwapChatContent(parsedContent)) {
    return createChatItem<SwapChatContent>(item, parsedContent);
  } else if (isLstChatContent(parsedContent)) {
    return createChatItem<ShowLSTDataChatContent>(item, parsedContent);
  } else if (isRugCheckChatContent(parsedContent)) {
    return createChatItem<RugCheckChatContent>(item, parsedContent);
  } else if (isMarketDataChatContent(parsedContent)) {
    return createChatItem<MarketDataChatContent>(item, parsedContent);
  } else if (isTopHoldersChatContent(parsedContent)) {
    return createChatItem<TopHoldersChatContent>(item, parsedContent);
  } else if (isUserLuloChatContent(parsedContent)) {
    return createChatItem<LuloChatContent>(item, parsedContent);
  } else if (isTransactionDataChatContent(parsedContent)) {
    return createChatItem<TransactionChatContent>(item, parsedContent);
  } else if (isTransferSolChatContent(parsedContent)) {
    return createChatItem<TransactionChatContent>(item, parsedContent);
  } else if (isTransferSplChatContent(parsedContent)) {
    return createChatItem<TransactionChatContent>(item, parsedContent);
  } else if (isNFTCollectionChatContent(parsedContent)) {
    return createChatItem<NFTCollectionChatContent>(item, parsedContent);
  } else if (isTrendingNFTSChatContent(parsedContent)) {
    return createChatItem<GetTrendingNFTSChatContent>(item, parsedContent);
  } else if (isAiProjectClassificationChatContent(parsedContent)) {
    return createChatItem<AiProjectsChatContent>(item, parsedContent);
  }
};

function createChatItem<T extends ChatContentType>(
  wrapper: ChatMessageResponseWrapper,
  parsedMessage: T,
): ChatItem<T> {
  return {
    id: wrapper.id,
    content: parsedMessage,
    createdAt: wrapper.created_at,
  };
}

/**
 * Type Guards for the Chat Item content
 */
function isSimpleMessageChatContent(
  content: any,
): content is SimpleMessageChatContent {
  return content.type === 'simple_message';
}
function isUserAudioChatContent(content: any): content is UserAudioChatContent {
  return content.type === 'user_audio_chat';
}
function isTokenDataChatContent(content: any): content is TokenDataChatContent {
  return content.type === 'token_data';
}
function isBubblemapChatContent(content: any): content is BubbleMapChatContent {
  return content.type === 'bubble_map';
}
function isSwapChatContent(content: any): content is SwapChatContent {
  return content.type === 'swap';
}
function isLstChatContent(content: any): content is ShowLSTDataChatContent {
  return content.type === 'get_lst_data';
}
function isRugCheckChatContent(content: any): content is RugCheckChatContent {
  return content.type === 'rug_check';
}
function isMarketDataChatContent(
  content: any,
): content is MarketDataChatContent {
  return content.type === 'market_data';
}
function isTopHoldersChatContent(
  content: any,
): content is TopHoldersChatContent {
  return content.type === 'top_holders';
}
function isUserLuloChatContent(content: any): content is LuloChatContent {
  return content.type === 'user_lulo_data';
}
function isTransactionDataChatContent(
  content: any,
): content is TransactionChatContent {
  return content.type === 'transaction_message';
}
function isTransferSolChatContent(
  content: any,
): content is TransactionChatContent {
  return content.type === 'transfer_sol';
}
function isTransferSplChatContent(
  content: any,
): content is TransactionChatContent {
  return content.type === 'transfer_spl';
}

function isNFTCollectionChatContent(
  content: any,
): content is NFTCollectionChatContent {
  return content.type === 'nft_collection_data';
}
function isTrendingNFTSChatContent(
  content: any,
): content is GetTrendingNFTSChatContent {
  return content.type === 'get_trending_nfts';
}
function isAiProjectClassificationChatContent(
  content: any,
): content is AiProjectsChatContent {
  return content.type === 'ai_projects_classification';
}

export function createChatItemFromTool(
  tool: Tool,
  data: any,
): ChatItem<ChatContentType> {
  let message: ChatItem<ChatContentType>;

  switch (tool.representation?.props_type) {
    case 'token_data': {
      message = {
        id: generateUniqueId(),
        content: data as TokenDataChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'bubble_map': {
      message = {
        id: generateUniqueId(),
        content: data as BubbleMapChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'swap': {
      message = {
        id: generateUniqueId(),
        content: data as SwapChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'get_lst_data': {
      message = {
        id: generateUniqueId(),
        content: data as ShowLSTDataChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'rug_check': {
      message = {
        id: generateUniqueId(),
        content: data as RugCheckChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'market_data': {
      message = {
        id: generateUniqueId(),
        content: data as MarketDataChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'show_limit_orders': {
      message = {
        id: generateUniqueId(),
        content: data as ShowLimitOrdersChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'transaction_message': {
      message = {
        id: generateUniqueId(),
        content: data as TransactionChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }

    case 'transfer_sol': {
      message = {
        id: generateUniqueId(),
        content: data as TransactionChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'transfer_spl': {
      message = {
        id: generateUniqueId(),
        content: data as TransactionChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'withdraw_lulo': {
      message = {
        id: generateUniqueId(),
        content: data as LuloChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'user_assets_lulo': {
      message = {
        id: generateUniqueId(),
        content: data as TransactionChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'nft_collection_data': {
      message = {
        id: generateUniqueId(),
        content: data as NFTCollectionChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'get_trending_nfts': {
      message = {
        id: generateUniqueId(),
        content: data as GetTrendingNFTSChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    case 'ai_projects_classification': {
      message = {
        id: generateUniqueId(),
        content: data as AiProjectsChatContent,
        createdAt: new Date().toISOString(),
      };
      return message;
    }
    default: {
      throw new Error('Unsupported props_type');
    }
  }
}
