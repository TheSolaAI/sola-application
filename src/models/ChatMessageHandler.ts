import { create } from 'zustand';
import { useChatRoomHandler } from './ChatHandler.ts';
import { toast } from 'sonner';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import {
  ChatMessageResponseWrapper,
  ChatMessagesResponse,
} from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import { ChatMessage } from '../types/chatMessage.ts';

interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat message handler

  messages: ChatMessage[]; // stores an array of all the chat messages. Is managed entirely by this model

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
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  return {
    state: 'idle',
    next: null,

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
        const messages: ChatMessage[] = response.data.results.map(
          (message: ChatMessageResponseWrapper): ChatMessage => {
            return {
              id: message.id,
              content: message.message.content,
              sender: message.message.sender,
              createdAt: message.created_at,
            };
          },
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
        const messages: ChatMessage[] = response.data.results.map(
          (message: ChatMessageResponseWrapper): ChatMessage => {
            return {
              id: message.id,
              content: message.message.content,
              sender: message.message.sender,
              createdAt: message.created_at,
            };
          },
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
  };
});
