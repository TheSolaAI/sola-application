import { create } from 'zustand';
import { ChatRoom } from '../types/chatRoom.ts';

interface ChatRoomHandler {
  /**
   * Initialize the room handler by fetching all the chat rooms from the server
   * On load the currentChatRoom is set to null, and is only set when the user selects a chat room or creates a new one.
   */
  initRoomHandler: () => Promise<void>;

  rooms: ChatRoom[]; // stores an array of all the chat rooms. Is managed entirely by this model

  /**
   * The Current Chat room selected by the user. DO NOT MODIFY THIS VARIABLE DIRECTLY.
   * Use the setCurrentChatRoom method to change the current chat room.
   */
  currentChatRoom: ChatRoom | null;
  setCurrentChatRoom: (room: ChatRoom) => void; // sets the current chat room
}

export const useChatRoomHandler = create<ChatRoomHandler>((set, get) => {
  return {
    initRoomHandler: async () => {},
  };
});
