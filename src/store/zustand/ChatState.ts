import { create, StateCreator } from 'zustand';

interface ChatState {
  isSessionActive: boolean;
  dataChannel: RTCDataChannel | null;
  mediaRecorder: MediaRecorder | undefined;
  peerConnection: RTCPeerConnection | null;
  isMuted: boolean;
  isBlinksVisible: boolean;
  blinkName: string;
  getPeerConnection: () => RTCPeerConnection | null;
  setIsBlinks: (isActive: boolean) => void;
  setBlinkName: (name: string) => void;
  setIsSessionActive: (isActive: boolean) => void;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  setMediaRecorder: (recorder: MediaRecorder | undefined) => void;
  setPeerConnection: (connection: RTCPeerConnection | null) => void;
  toggleMute: () => void;
  resetMute: () => void;
}
// impl multi blinks for coinflip/

const chatStateCreator: StateCreator<ChatState> = (set, get) => ({
  isSessionActive: false,
  dataChannel: null,
  mediaRecorder: undefined,
  peerConnection: null,
  isMuted: false,
  isBlinksVisible: false,
  blinkName: '',
  setIsSessionActive: (isActive: boolean) => set({ isSessionActive: isActive }),
  setBlinkName: (name: string) => set({ blinkName: name }),
  setIsBlinks: (isActive: boolean) => set({ isBlinksVisible: isActive }),
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
