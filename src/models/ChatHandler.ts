import { create } from 'zustand';
import { ChatRoom } from '../types/chatRoom.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { ChatRoomResponse } from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import { toast } from 'sonner';

interface ChatRoomHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the chat room handler
  rooms: ChatRoom[]; // stores an array of all the chat rooms. Is managed entirely by this model
  /**
   * The Current Chat room selected by the user. READ ONLY
   */
  currentChatRoom: ChatRoom | null;

  setState: (state: 'idle' | 'loading' | 'error') => void; // sets the state of the chat room handler
  /**
   * Initialize the room handler by fetching all the chat rooms from the server
   * On load the currentChatRoom is set to null, and is only set when the user selects a chat room or creates a new one.
   */
  initRoomHandler: () => Promise<void>;
  setCurrentChatRoom: (room: ChatRoom) => void; // sets the current chat room
}

export const useChatRoomHandler = create<ChatRoomHandler>((set, get) => {
  return {
    state: 'idle',
    rooms: [],

    setState: (state: 'idle' | 'loading' | 'error'): void => set({ state }),

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
          rooms: response.data.map((room: ChatRoomResponse): ChatRoom => {
            return {
              id: room.id,
              agentId: room.agent_id,
              name: room.name,
              icon: 'https://avatar.iran.liara.run/username?username=Scott+Wilson',
              // TODO: Change this when the backend supports chatRoom images
            };
          }),
        });
      } else {
        toast.error('Failed to fetch Rooms');
        set({ state: 'error' });
      }
    },
  };
});
