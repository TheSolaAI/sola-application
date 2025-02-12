import { create } from 'zustand';
import { ChatRoom, ChatRoomPatch } from '../types/chatRoom.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { ChatRoomResponse } from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import { toast } from 'sonner';
import { useChatMessageHandler } from './ChatMessageHandler.ts';

interface ChatRoomHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat room handler
  rooms: ChatRoom[]; // stores an array of all the chat rooms. Is managed entirely by this model
  /**
   * The Current Chat room selected by the user. READ ONLY
   */
  currentChatRoom: ChatRoom | null;

  /**
   * A Boolean property on whether or not all the rooms have been loaded
   */
  allRoomsLoaded: boolean;

  setState: (state: 'idle' | 'loading' | 'error') => void; // sets the state of the chat room handler
  /**
   * Initialize the room handler by fetching all the chat rooms from the server
   * On load the currentChatRoom is set to null, and is only set when the user selects a chat room or creates a new one.
   */
  initRoomHandler: () => Promise<void>;
  setCurrentChatRoom: (room: ChatRoom) => void; // sets the current chat room
  deleteChatRoom: (roomId: number) => Promise<void>; // delete a chat room only if its present locally
  updateChatRoom: (room: ChatRoomPatch) => Promise<void>; // update a chat room only if its present locally
  createChatRoom: (room: ChatRoom) => Promise<ChatRoom | null>; // create a new chat room using the room object
}

export const useChatRoomHandler = create<ChatRoomHandler>((set, get) => {
  return {
    state: 'idle',
    rooms: [],
    currentChatRoom: null,
    allRoomsLoaded: false,

    setState: (state: 'idle' | 'loading' | 'error'): void => set({ state }),

    setCurrentChatRoom: (room: ChatRoom): void => {
      set({ currentChatRoom: room });
      // now fetch that chat room's messages
      useChatMessageHandler.getState().initChatMessageHandler();
    },

    initRoomHandler: async () => {
      // get all the chat rooms of this user
      set({ state: 'loading' });
      const response = await apiClient.get<ChatRoomResponse>(
        API_URLS.CHAT_ROOMS,
        undefined,
        'auth',
      );
      if (ApiClient.isApiResponse<ChatRoomResponse[]>(response)) {
        set({
          state: 'idle',
          allRoomsLoaded: true,
          rooms: response.data.map((room: ChatRoomResponse): ChatRoom => {
            return {
              id: room.id,
              agentId: room.agent_id,
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
        'auth',
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

    updateChatRoom: async (room: ChatRoom): Promise<void> => {
      set({ state: 'loading' });
      if (!get().rooms.find((r: ChatRoom) => r.id === room.id)) {
        toast.error('Room not found');
        set({ state: 'error' });
        return;
      }
      const response = await apiClient.patch<ChatRoomResponse>(
        API_URLS.CHAT_ROOMS + `${room.id}/`,
        room,
        'auth',
      );

      if (ApiClient.isApiResponse(response)) {
        set({
          rooms: get().rooms.map((r: ChatRoom) =>
            r.id === room.id ? room : r,
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
        { name: room.name, agent_id: room.agentId, session_id: 123 },
        'auth',
      );

      if (ApiClient.isApiResponse<ChatRoomResponse>(response)) {
        set({
          rooms: [
            {
              id: response.data.id,
              name: response.data.name,
              agentId: response.data.agent_id,
            },
            ...get().rooms,
          ],
          state: 'idle',
        });
        return {
          id: response.data.id,
          name: response.data.name,
          agentId: response.data.agent_id,
        };
      } else {
        toast.error('Failed to create room');
        set({ state: 'error' });
        return null;
      }
    },
  };
});
