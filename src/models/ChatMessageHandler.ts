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
  BubbleMapChatContent,
  ChatContentType,
  ChatItem,
  LuloChatContent,
  MarketDataChatContent,
  RugCheckChatContent,
  ShowLimitOrdersChatContent,
  ShowLSTDataChatContent,
  SimpleMessageChatContent,
  SwapChatContent,
  TokenDataChatContent,
  TopHoldersChatContent,
  TransactionChatContent,
} from '../types/chatItem.ts';
import { Tool } from '../types/tool.ts';
import { generateUniqueId } from '../utils/randomID.ts';

interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat message handler

  messages: ChatItem<ChatContentType>[]; // stores an array of all the chat messages. Is managed entirely by this model

  /**
   * The current message that is being generated. This currently only supports Simple Messages
   * // TODO: Add support for other loader messsage types.
   */
  currentChatItem: ChatItem<SimpleMessageChatContent> | null;

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
    messageUpdater: ChatItem<SimpleMessageChatContent> | null,
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
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  return {
    state: 'idle',
    next: null,
    messages: [],
    currentChatItem: null,

    initChatMessageHandler: async () => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomID) toast.error('No Chat Room Selected');
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
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (currentRoomID === undefined) {
        // no chat room has been selected so we create a new one with our default agent and navigate the user to that room
        const newRoom = await useChatRoomHandler.getState().createChatRoom({
          name: 'New Chat',
          agentId: useChatRoomHandler.getState().newRoomId,
        });
        if (newRoom) {
          useChatRoomHandler.getState().setCurrentChatRoom(newRoom);
          // we then add this message to the new room on our server
          const response = apiClient.post(
            API_URLS.CHAT_ROOMS + newRoom.id + '/messages/',
            { message: JSON.stringify(chatItem.content) },
            'auth',
          );
          if (ApiClient.isApiError(response)) {
            toast.error('Failed to Save Message, Reload the Page');
          }
          // add the message to our local state
          set({ messages: [...get().messages, chatItem] });
        }
      } else {
        // this means a chat room has already been selected so we just add the message to that room
        const response = await apiClient.post(
          API_URLS.CHAT_ROOMS + currentRoomID + '/messages/',
          { message: JSON.stringify(chatItem.content) },
          'auth',
        );
        if (ApiClient.isApiError(response)) {
          toast.error('Failed to Save Message, Reload the Page');
        }
        // add the message to our local state
        set({ messages: [...get().messages, chatItem] });
      }
    },

    setCurrentChatItem: (
      message: ChatItem<SimpleMessageChatContent> | null,
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
              type: 'simple_message',
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
        await get().addMessage(get().currentChatItem!);
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
  if (isSimpleMessageChatContent(parsedContent)) {
    return createChatItem<SimpleMessageChatContent>(item, parsedContent);
  } else if (isTokenDataChatContent(parsedContent)) {
    return createChatItem<TokenDataChatContent>(item, parsedContent);
  } else if (isBubblemapChatContent(parsedContent)) {
    return createChatItem<BubbleMapChatContent>(item, parsedContent);
  } else if (isSwapChatContent(parsedContent)) {
    return createChatItem<SwapChatContent>(item, parsedContent);
  } else if (isLstChatContent(parsedContent)) {
    return createChatItem<ShowLSTDataChatContent>(item, parsedContent);
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
function isTokenDataChatContent(content: any): content is TokenDataChatContent {
  return content.type === 'token_data';
}
function isBubblemapChatContent(content: any): content is BubbleMapChatContent {
  return content.type === 'bubble_map';
}
function isSwapChatContent(content: any): content is SwapChatContent {
  return content.type === 'swap';
}
function isLstChatContent(content): content is ShowLSTDataChatContent {
  return content.type === 'get_lst_data';
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
    case 'top_holders': {
      message = {
        id: generateUniqueId(),
        content: data as TopHoldersChatContent,
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
    default: {
      throw new Error('Unsupported props_type');
    }
  }
}
