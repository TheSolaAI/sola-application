import { create } from 'zustand';
import { MessageCard } from '../types/messageCard.ts';

interface ChatState {
  roomId: number | null;
  isSessionActive: boolean;
  dataChannel: RTCDataChannel | null;
  mediaRecorder: MediaRecorder | undefined;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  messageList: MessageCard[];
  setRoomId: (roomId: number) => void;
  setMessageList: (messages: MessageCard[]) => void;
  addMessage: (message: MessageCard) => void;
  getPeerConnection: () => RTCPeerConnection | null;
  setIsSessionActive: (isActive: boolean) => void;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  setMediaRecorder: (recorder: MediaRecorder | undefined) => void;
  setPeerConnection: (connection: RTCPeerConnection | null) => void;
  toggleMute: () => void;
  resetMute: () => void;
}

export const useChatState = create<ChatState>((set, get) => {
  return {
    roomId: null,
    isSessionActive: false,
    dataChannel: null,
    mediaRecorder: undefined,
    peerConnection: null,
    isMuted: false,
    messageList: [],
    vad: null,

    setRoomId: (roomId) => set({ roomId }),

    setMessageList: (messages) => set({ messageList: messages }),

    addMessage: (message) =>
      set((state) => ({ messageList: [...state.messageList, message] })),

    setIsSessionActive: (isActive) => set({ isSessionActive: isActive }),

    setDataChannel: (channel) => set({ dataChannel: channel }),

    setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),

    setPeerConnection: (connection) => set({ peerConnection: connection }),

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
  };
});
