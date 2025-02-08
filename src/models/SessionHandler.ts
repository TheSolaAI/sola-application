import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { OpenAIKeyGenResponse } from '../types/response.ts';
import { API_URLS } from '../config/api_urls.ts';
import { toast } from 'sonner';
import { AIEmotion, AIVoice, getPrimeDirective } from '../config/ai.ts';
import { useChatRoomHandler } from './ChatHandler.ts';
import { useAgentHandler } from './AgentHandler.ts';

interface SessionHandler {
  state: 'idle' | 'loading' | 'error'; // the state of the session handler

  peerConnection: RTCPeerConnection | null; // the peer connection for the webrtc session
  dataStream: RTCDataChannel | null; // the data stream for the webrtc session

  aiVoice: AIVoice; // the voice of the AI
  aiEmotion: AIEmotion; // Emotion of the AI

  /**
   * Starts the webrtc session with OpenAI real time api and initialize the loading of the available tools.
   * Returns the ephemeral token for the session.
   */
  initSessionHandler: () => Promise<string | null>;

  setPeerConnection: (peerConnection: RTCPeerConnection) => void; // sets the peer connection
  setDataStream: (dataStream: RTCDataChannel) => void; // sets the data stream

  setAiVoice: (aiVoice: AIVoice) => void; // sets the voice of the AI
  setAiEmotion: (aiEmotion: AIEmotion) => void; // sets the emotion of the AI

  updateSession: () => void; // Updates the session with the latest tools, voice and emotion
}

export const useSessionHandler = create<SessionHandler>((set, get) => {
  return {
    state: 'idle',
    peerConnection: null,
    dataStream: null,
    aiVoice: 'sage',
    aiEmotion: 'highly energetic and cheerfully enthusiastic',

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
        toast.error('Failed to Fetch Token');
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

    setAiVoice: (aiVoice: AIVoice): void => {
      set({ aiVoice });
    },

    setAiEmotion: (aiEmotion: AIEmotion): void => {
      set({ aiEmotion });
    },

    updateSession: (): void => {
      const tools = useChatRoomHandler.getState().currentChatRoom
        ? useAgentHandler
            .getState()
            .getToolsForAgent(
              useChatRoomHandler.getState().currentChatRoom!.agentId,
            )
        : undefined;

      const updateParams = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: getPrimeDirective(get().aiEmotion),
          voice: get().aiVoice.toLowerCase(),
          tools,
          tool_choice: 'auto',
          temperature: 0.6,
        },
      };
      // send the event across the data stream
      get().dataStream?.send(JSON.stringify(updateParams));
    },
  };
});
