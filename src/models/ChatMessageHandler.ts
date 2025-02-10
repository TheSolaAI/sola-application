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
  ChatContentType,
  ChatItem,
  SimpleMessageChatContent,
} from '../types/chatItem.ts';

interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat message handler

  messages: ChatItem<ChatContentType>[]; // stores an array of all the chat messages. Is managed entirely by this model

  currentMessage: ChatItem<ChatContentType> | null; // the current message that is being generated

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
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  return {
    state: 'idle',
    next: null,
    messages: [],
    currentMessage: null,

    initChatMessageHandler: async () => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomID) toast.error('No Chat Room Selected');
      set({ state: 'loading' });
      // fetch only the first 40 messages and we will fetch the rest as we scroll
      const response = await apiClient.get<ChatMessagesResponse>(
        API_URLS.CHAT_ROOMS + currentRoomID + '/messages/?limit=40',
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
        const newRoom = await useChatRoomHandler
          .getState()
          .createChatRoom({ name: 'New Chat Room', agentId: 1, id: 0 });
        if (newRoom) {
          useChatRoomHandler.getState().setCurrentChatRoom(newRoom);
        }
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
  }
};

function createChatItem<T extends ChatContentType>(
  wrapper: ChatMessageResponseWrapper,
  parsedMessage: T,
): ChatItem<T> {
  return {
    id: wrapper.id,
    content: parsedMessage,
    sender: parsedMessage.sender,
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
