import { create, StateCreator } from 'zustand';

interface ChatState {
  isSessionActive: boolean;
  dataChannel: RTCDataChannel | null;
  mediaRecorder: MediaRecorder | undefined;
  peerConnection: RTCPeerConnection | null;
  getPeerConnection: () => RTCPeerConnection | null;
  setIsSessionActive: (isActive: boolean) => void;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  setMediaRecorder: (recorder: MediaRecorder | undefined) => void;
  setPeerConnection: (connection: RTCPeerConnection | null) => void;
}

const chatStateCreator: StateCreator<ChatState> = (set, get) => ({
  isSessionActive: false,
  dataChannel: null,
  mediaRecorder: undefined,
  peerConnection: null,
  setIsSessionActive: (isActive: boolean) => set({ isSessionActive: isActive }),
  setDataChannel: (channel) => set({ dataChannel: channel }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
  setPeerConnection: (connection) => set({ peerConnection: connection }),
  getPeerConnection: () => get().peerConnection,
});

export const useChatState = create<ChatState>(chatStateCreator);

export default useChatState;
