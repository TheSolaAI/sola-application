import { create } from 'zustand';
import {
  ChatMessagesResponse,
  ChatRoom,
} from '../../types/database/responseTypes';

interface RoomState {
  rooms: ChatRoom[];
  currentRoomChat: ChatMessagesResponse | null;
  setRooms: (rooms: ChatRoom[]) => void;
  appendRoom: (room: ChatRoom) => void;
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  currentRoomChat: null,
  setRooms: (rooms: ChatRoom[]) => set({ rooms }),
  appendRoom: (room: ChatRoom) =>
    set((state) => ({ rooms: [...state.rooms, room] })),
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) =>
    set({ currentRoomChat }),
}));
