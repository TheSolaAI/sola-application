import { create } from 'zustand';
import {
  ChatMessagesResponse,
  ChatRoom,
} from '../types/database/responseTypes.ts';
import { MessageCard } from '../types/messageCard.ts';

interface RoomState {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  currentRoomChat: ChatMessagesResponse | null;
  messageList: MessageCard[];
  isCreatingRoom: boolean;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoomId: (currentRoomId: string | null) => void;
  appendRoom: (room: ChatRoom) => void;
  removeRoom: (room: string) => void;
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) => void;
  setMessageList: (
    update: (messageList: MessageCard[]) => MessageCard[],
  ) => void;
  setIsCreatingRoom: (isCreatingRoom: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoomId: null,
  currentRoomChat: null,
  messageList: [],
  isCreatingRoom: false,
  setRooms: (rooms: ChatRoom[]) => set({ rooms }),
  setCurrentRoomId: (currentRoomId: string | null) => set({ currentRoomId }),
  appendRoom: (room: ChatRoom) =>
    set((state) => ({ rooms: [room, ...state.rooms] })),
  removeRoom: (room: string) =>
    set((state) => ({ rooms: state.rooms.filter((r) => r.id !== room) })),
  setCurrentRoomChat: (currentRoomChat: ChatMessagesResponse) =>
    set({ currentRoomChat }),
  setMessageList: (update) =>
    set((state) => ({ messageList: update(state.messageList) })),
  setIsCreatingRoom: (isCreatingRoom: boolean) => set({ isCreatingRoom }),
}));
