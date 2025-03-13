'use client';

import { create } from 'zustand';
import { ChatRoom, ChatRoomPatch } from '@/types/chatRoom';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { ChatRoomResponse } from '@/types/response';
import { API_URLS } from '@/config/api_urls';
import { toast } from 'sonner';

interface ChatRoomHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat room handler
  isCreatingRoom: boolean;
  setIsCreatingRoom: (isCreatingRoom: boolean) => void;
  isNewRoomCreated: boolean;

  rooms: ChatRoom[]; // stores an array of all the chat rooms. Is managed entirely by this model
  /**
   * The Current and Previous Chat room selected by the user. READ ONLY
   */
  currentChatRoom: ChatRoom | null;
  previousChatRoom: ChatRoom | null;
  /**
   * A Boolean property on whether all the rooms have been loaded
   */
  allRoomsLoaded: boolean;

  setState: (state: 'idle' | 'loading' | 'error') => void; // sets the state of the chat room handler
  /**
   * Initialize the room handler by fetching all the chat rooms from the server
   * On load the currentChatRoom is set to null, and is only set when the user selects a chat room or creates a new one.
   */
  initRoomHandler: () => Promise<void>;
  setCurrentChatRoom: (room: ChatRoom | null) => Promise<void>; // sets the current chat room
  deleteChatRoom: (roomId: number) => Promise<void>; // delete a chat room only if its present locally
  updateChatRoom: (room: ChatRoomPatch) => Promise<void>; // update a chat room only if its present locally
  createChatRoom: (room: ChatRoom) => Promise<ChatRoom | null>; // create a new chat room using the room object
}

export const useChatRoomHandler = create<ChatRoomHandler>((set, get) => {
  return {
    state: 'idle',
    isCreatingRoom: false,
    setIsCreatingRoom: (isCreatingRoom: boolean) =>
      set({ isCreatingRoom: isCreatingRoom }),
    isNewRoomCreated: false,

    rooms: [],
    currentChatRoom: null,
    previousChatRoom: null,
    allRoomsLoaded: false,

    setState: (state: 'idle' | 'loading' | 'error'): void => set({ state }),

    setCurrentChatRoom: async (room: ChatRoom | null): Promise<void> => {
      console.log(room);
      set({
        previousChatRoom: get().currentChatRoom,
        currentChatRoom: room,
        isNewRoomCreated: false,
      });
    },

    initRoomHandler: async () => {
      // get all the chat rooms of this user
      set({ state: 'loading' });
      const response = await apiClient.get<ChatRoomResponse>(
        API_URLS.CHAT_ROOMS,
        undefined,
        'auth'
      );
      if (ApiClient.isApiResponse<ChatRoomResponse[]>(response)) {
        set({
          state: 'idle',
          allRoomsLoaded: true,
          rooms: response.data.map((room: ChatRoomResponse): ChatRoom => {
            return {
              id: room.id,
              name: room.name,
            };
          }),
        });
      } else {
        toast.error('Failed to fetch Rooms');
        set({ state: 'error' });
      }
    },

    deleteChatRoom: async (roomId: number): Promise<void> => {
      set({ state: 'loading' });
      if (!get().rooms.find((room: ChatRoom) => room.id === roomId)) {
        toast.error('Room not found');
        set({ state: 'error' });
        return;
      }
      const response = await apiClient.delete(
        API_URLS.CHAT_ROOMS + `${roomId}/`,
        'auth'
      );
      if (ApiClient.isApiResponse(response)) {
        set({
          rooms: get().rooms.filter((room: ChatRoom) => room.id !== roomId),
          state: 'idle',
        });
      } else {
        toast.error('Failed to delete room');
        set({ state: 'error' });
      }
    },

    updateChatRoom: async (room: ChatRoomPatch): Promise<void> => {
      set({ state: 'loading' });
      if (!get().rooms.find((r: ChatRoom) => r.id === room.id)) {
        toast.error('Room not found');
        set({ state: 'error' });
        return;
      }
      const response = await apiClient.patch<ChatRoomResponse>(
        API_URLS.CHAT_ROOMS + `${room.id}/`,
        room,
        'auth'
      );

      if (ApiClient.isApiResponse(response)) {
        set({
          rooms: get().rooms.map((r: ChatRoomPatch) =>
            r.id === room.id ? (room as ChatRoom) : (r as ChatRoom)
          ),
          state: 'idle',
        });
      } else {
        toast.error('Failed to update room');
        set({ state: 'error' });
      }
    },

    createChatRoom: async (room: ChatRoom): Promise<ChatRoom | null> => {
      set({ state: 'loading' });
      const response = await apiClient.post<ChatRoomResponse>(
        API_URLS.CHAT_ROOMS,
        { name: room.name, session_id: 123 },
        'auth'
      );

      if (ApiClient.isApiResponse<ChatRoomResponse>(response)) {
        const chatRoom = {
          id: response.data.id,
          name: response.data.name,
        };
        set({
          rooms: [chatRoom, ...get().rooms],
          state: 'idle',
          isNewRoomCreated: true,
          currentChatRoom: chatRoom,
        });

        return {
          id: response.data.id,
          name: response.data.name,
        };
      } else {
        toast.error('Failed to create room');
        set({ state: 'error', isCreatingRoom: false });
        return null;
      }
    },
  };
});
