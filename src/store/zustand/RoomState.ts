import { create } from 'zustand';
import {
  ChatMessagesResponse,
  ChatRoom,
} from '../../types/database/responseTypes';
import { MessageCard } from '../../types/messageCard';

interface RoomState {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  currentRoomChat: ChatMessagesResponse | null;
  messageList: MessageCard[];
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoomId: (currentRoomId: string | null) => void;
  appendRoom: (room: ChatRoom) => void;
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) => void;
  setMessageList: (update: (messageList: MessageCard[]) => MessageCard[]) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoomId: null,
  currentRoomChat: null,
  messageList: [],
  setRooms: (rooms: ChatRoom[]) => set({ rooms }),
  setCurrentRoomId: (currentRoomId: string | null) => set({ currentRoomId }),
  appendRoom: (room: ChatRoom) =>
    set((state) => ({ rooms: [...state.rooms, room] })),
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) =>
    set({ currentRoomChat }),
  setMessageList: (update) =>
    set((state) => ({ messageList: update(state.messageList) })),
}));
