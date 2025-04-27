'use client';

import { create } from 'zustand';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { toast } from 'sonner';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import {
  ChatMessageResponseWrapper,
  ChatMessagesResponse,
} from '@/types/response';
import { API_URLS } from '@/config/api_urls';
import { Message } from 'ai';

interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error';
  messages: Message[];
  currentChatItem: Message | null;
  loadingMessage: string | null;
  showMessageSkeleton: boolean;
  next: string | null;

  initChatMessageHandler: () => Promise<void>;
  getNextMessages: () => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  getTopMessages: (count: number) => Array<Message>;

  setCurrentMessage: (message: Message | null) => void;
  updateCurrentMessage: (delta: string) => void;
  setLoadingMessage: (message: string | null) => void;
  setShowMessageSkeleton: (show: boolean) => void;
  commitCurrentChat: () => Promise<void>;
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  return {
    state: 'idle',
    next: null,
    messages: [],
    currentChatItem: null,
    loadingMessage: null,
    showMessageSkeleton: false,

    initChatMessageHandler: async () => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomID) {
        set({ messages: [], currentChatItem: null });
        return;
      }
      set({ state: 'loading', messages: [], currentChatItem: null });
      // fetch only the first 40 messages and we will fetch the rest as we scroll
      const response = await apiClient.get<ChatMessagesResponse>(
        API_URLS.CHAT_ROOMS + currentRoomID + '/messages/?limit=40',
        undefined,
        'auth'
      );
      if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
        set({ state: 'idle' });
        const messages: Message[] = response.data.results
          .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
            const item = parseChatItemContent(message);
            if (item) {
              acc.push(item);
            }
            return acc;
          }, [])
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
        'auth'
      );
      if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
        set({ state: 'idle' });
        const messages: Message[] = response.data.results
          .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
            const item = parseChatItemContent(message);
            if (item) {
              acc.push(item);
            }
            return acc;
          }, [])
          .reverse();
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

    addMessage: async (message: Message) => {
      const currentRoomID = useChatRoomHandler.getState().currentChatRoom?.id;

      if (currentRoomID === undefined) {
        useChatRoomHandler.getState().setIsCreatingRoom(true);
        try {
          const newRoom = await useChatRoomHandler.getState().createChatRoom({
            name: 'New Chat',
          });

          if (newRoom) {
            const response = await apiClient.post(
              API_URLS.CHAT_ROOMS + newRoom.id + '/messages/',
              { message: JSON.stringify(message) },
              'auth'
            );

            if (ApiClient.isApiError(response)) {
              toast.error('Failed to Save Message, Reload the Page');
            }
            set({ messages: [message] });
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
          { message: JSON.stringify(message) },
          'auth'
        );
        if (ApiClient.isApiError(response)) {
          toast.error('Failed to Save Message, Reload the Page');
        }
        set({ messages: [...get().messages, message] });
      }
    },

    getTopMessages: (count: number): Array<Message> => {
      return [...get().messages].reverse().slice(0, count);
    },

    setCurrentMessage: (message: Message | null) => {
      set({ currentChatItem: message });
    },

    setLoadingMessage: (message: string | null) => {
      set({ loadingMessage: message });
    },

    setShowMessageSkeleton: (show: boolean) => {
      set({ showMessageSkeleton: show });
    },

    updateCurrentMessage: (delta: string) => {
      if (get().currentChatItem) {
        const updatedMessage = {
          ...get().currentChatItem,
          content: get().currentChatItem!.content + delta,
          parts: [
            {
              type: 'text',
              text: get().currentChatItem!.content + delta,
            },
          ],
        } as Message;
        set({ currentChatItem: updatedMessage });
      }
    },

    commitCurrentChat: async () => {
      if (get().currentChatItem) {
        await get().addMessage(get().currentChatItem!);
        set({ currentChatItem: null });
      }
    },
  };
});

/**
 * Parses a ChatMessageResponseWrapper from the server to our local Message type
 * @param item The message wrapper from the API
 * @returns A valid Message object or null if parsing fails
 */
export const parseChatItemContent = (
  item: ChatMessageResponseWrapper
): Message | null => {
  try {
    // Parse the JSON string
    const parsedContent = JSON.parse(item.message);
    return parsedContent as Message;
  } catch (error) {
    console.error('Error parsing chat item content:', error);
    return null;
  }
};
