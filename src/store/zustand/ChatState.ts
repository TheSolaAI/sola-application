import { create, StateCreator } from 'zustand';
import { MessageCard } from '../../types/messageCard';

interface ChatState {
  roomId: number | null;
  isSessionActive: boolean;
  dataChannel: RTCDataChannel | null;
  mediaRecorder: MediaRecorder | undefined;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  messageList: MessageCard[];
  setRoomId: (roomId: number) => void;
  setMessageList: (message: MessageCard[]) => void;
  addMessage: (message: MessageCard) => void;
  getPeerConnection: () => RTCPeerConnection | null;
  setIsSessionActive: (isActive: boolean) => void;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  setMediaRecorder: (recorder: MediaRecorder | undefined) => void;
  setPeerConnection: (connection: RTCPeerConnection | null) => void;
  toggleMute: () => void;
  resetMute: () => void;
}

const chatStateCreator: StateCreator<ChatState> = (set, get) => ({
  roomId: null,
  isSessionActive: false,
  dataChannel: null,
  mediaRecorder: undefined,
  peerConnection: null,
  isMuted: false,
  messageList: [],
  setRoomId: (roomId) => set({ roomId: roomId }),
  setMessageList: (messages) => set({ messageList: messages }),
  addMessage: (message) =>
    set((state) => ({ messageList: [...state.messageList, message] })),
  setIsSessionActive: (isActive: boolean) => set({ isSessionActive: isActive }),
  setDataChannel: (channel: RTCDataChannel | null) =>
    set({ dataChannel: channel }),
  setMediaRecorder: (recorder: MediaRecorder | undefined) =>
    set({ mediaRecorder: recorder }),
  setPeerConnection: (connection: RTCPeerConnection | null) =>
    set({ peerConnection: connection }),
  getPeerConnection: () => get().peerConnection,
  toggleMute: () =>
    set((state) => {
      const pc = state.peerConnection;
      if (pc) {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === 'audio') {
            sender.track.enabled = state.isMuted;
          }
        });
      }
      return { isMuted: !state.isMuted };
    }),
  resetMute: () =>
    set((state) => {
      const pc = state.peerConnection;
      if (pc) {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === 'audio') {
            sender.track.enabled = true;
          }
        });
      }
      return { isMuted: false };
    }),
});

export const useChatState = create<ChatState>(chatStateCreator);

export default useChatState;
