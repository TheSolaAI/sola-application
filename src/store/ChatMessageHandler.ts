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
import {
  ChatContentType,
  ChatItem,
  InProgressChatContent,
  LoaderMessageChatContent,
  SimpleMessageChatContent,
} from '@/types/chatItem';
import { MessageQueue, SerializedQueue } from '@/lib/MessageQueue';
import { Message } from 'ai';

//TODO: Remove Current Chat items
interface ChatMessageHandler {
  state: 'idle' | 'loading' | 'error';
  messages: Message[];
  messageQueueData: SerializedQueue<ChatItem<ChatContentType>>;
  currentChatItem: ChatItem<
    InProgressChatContent | LoaderMessageChatContent
  > | null;
  next: string | null;

  initChatMessageHandler: () => Promise<void>;
  getNextMessages: () => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  getTopMessagesInVercelSDKFormat: (count: number) => Array<Message>;

  setCurrentChatItem: (
    messageUpdater: ChatItem<
      LoaderMessageChatContent | InProgressChatContent
    > | null
  ) => void;
  updateCurrentChatItem: (delta: string) => void;
  commitCurrentChatItem: () => Promise<void>;

  enqueueMessage: (message: ChatItem<ChatContentType>) => void;
  dequeueMessage: () => ChatItem<ChatContentType> | undefined;
  getQueueSize: () => number;
  clearQueue: () => void;
}

export const useChatMessageHandler = create<ChatMessageHandler>((set, get) => {
  const emptyQueue = MessageQueue.createEmpty<ChatItem<ChatContentType>>();

  return {
    state: 'idle',
    next: null,
    messages: [],
    messageQueueData: emptyQueue,
    currentChatItem: null,

    enqueueMessage: (message: ChatItem<ChatContentType>): void => {
      try {
        const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
          get().messageQueueData
        );
        queue.enqueue(message);
        set({ messageQueueData: queue.serialize() });
      } catch (error) {
        console.error('Error enqueuing message:', error);
        const newQueue = new MessageQueue<ChatItem<ChatContentType>>();
        newQueue.enqueue(message);
        set({ messageQueueData: newQueue.serialize() });
      }
    },

    dequeueMessage: (): ChatItem<ChatContentType> | undefined => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData
      );
      const message = queue.dequeue();
      set({ messageQueueData: queue.serialize() });
      return message;
    },

    getQueueSize: (): number => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData
      );
      return queue.size();
    },

    clearQueue: (): void => {
      const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
        get().messageQueueData
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

    addMessage: async (chatItem: Message) => {
      if (useChatRoomHandler.getState().isCreatingRoom) {
        // get().enqueueMessage(chatItem);
        return;
      }

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
              { message: JSON.stringify(chatItem.content) },
              'auth'
            );

            if (ApiClient.isApiError(response)) {
              toast.error('Failed to Save Message, Reload the Page');
            }
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
          'auth'
        );
        if (ApiClient.isApiError(response)) {
          toast.error('Failed to Save Message, Reload the Page');
        }
        set({ messages: [...get().messages, chatItem] });
      }

      // try {
      //   const queue = MessageQueue.fromSerialized<ChatItem<ChatContentType>>(
      //     get().messageQueueData
      //   );
      //   if (!queue.isEmpty()) {
      //     const queueMessages = queue.toArray();
      //     get().clearQueue();
      //
      //     for (const message of queueMessages) {
      //       console.log('Processing queued message:', message);
      //       try {
      //         const response = await apiClient.post(
      //           API_URLS.CHAT_ROOMS +
      //             useChatRoomHandler.getState().currentChatRoom?.id +
      //             '/messages/',
      //           { message: JSON.stringify(message.content) },
      //           'auth'
      //         );
      //         if (ApiClient.isApiError(response)) {
      //           toast.error('Failed to save queued message');
      //         }
      //         set({ messages: [...get().messages, message] });
      //       } catch (error) {
      //         console.error('Error processing queued message:', error);
      //       }
      //     }
      //   }
      // } catch (error) {
      //   console.error('Error processing message queue:', error);
      // }
    },

    getTopMessagesInVercelSDKFormat: (count: number): Array<Message> => {
      return [...get().messages].reverse().slice(0, count);
    },

    setCurrentChatItem: (
      message: ChatItem<InProgressChatContent | LoaderMessageChatContent> | null
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
        // await get().addMessage(converted);
        set({
          currentChatItem: null,
        });
      }
    },
  };
});

/**
 * Parses and validates a ChatMessageResponseWrapper into a Vercel AI SDK Message
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
