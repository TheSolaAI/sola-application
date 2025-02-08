import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { OpenAIKeyGenResponse } from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import { toast } from 'sonner';

interface SessionHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the session handler

  peerConnection: RTCPeerConnection | null; // the peer connection for the webrtc session
  dataStream: RTCDataChannel | null; // the data stream for the webrtc session

  /**
   * Starts the webrtc session with OpenAI real time api and initialize the loading of the available tools.
   * Returns the ephemeral token for the session.
   */
  initSessionHandler: () => Promise<string | null>;

  setPeerConnection: (peerConnection: RTCPeerConnection) => void; // sets the peer connection
  setDataStream: (dataStream: RTCDataChannel) => void; // sets the data stream
}

export const useSessionHandler = create<SessionHandler>((set) => {
  return {
    state: 'idle',
    peerConnection: null,
    dataStream: null,

    initSessionHandler: async (): Promise<string | null> => {
      set({ state: 'loading' });
      // get our ephemeral token
      const response = await apiClient.get<OpenAIKeyGenResponse>(
        API_URLS.SESSION,
        undefined,
        'data',
      );
      if (ApiClient.isApiResponse<OpenAIKeyGenResponse>(response)) {
        const ephermeralToken = response.data.client_secret.value;
        set({ state: 'idle' });
        return ephermeralToken;
      } else {
        // if the response is not successful, show a toast
        toast.error('Failed to Start Session');
        set({ state: 'error' });
        return null;
      }
    },

    setDataStream: (dataStream: RTCDataChannel): void => {
      set({ dataStream });
    },

    setPeerConnection: (peerConnection: RTCPeerConnection): void => {
      set({ peerConnection });
    },
  };
});
