'use client';
import { create } from 'zustand';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { OpenAIKeyGenResponse } from '@/types/response';
import { API_URLS } from '@/config/api_urls';
import { toast } from 'sonner';
import { AIVoice } from '@/config/ai';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useUserHandler } from '@/store/UserHandler';
import { getToolSetSelectorPrimeDirective } from '@/config/ai';
import { getRequiredToolset } from '@/tools/toolsetChooser';

interface SessionHandler {
  state: 'idle' | 'loading' | 'open' | 'error'; // the state of the session handler

  peerConnection: RTCPeerConnection | null; // the peer connection for the webrtc session
  dataStream: RTCDataChannel | null; // the data stream for the webrtc session
  mediaStream: MediaStream | null; // the media stream for the webrtc session

  aiVoice: AIVoice; // the voice of the AI
  aiEmotion: string; // Emotion of the AI

  muted: boolean; // the mute state of the user

  /**
   * State to track if the user is speaking or not
   */
  isUserSpeaking: boolean;
  setIsUserSpeaking: (isUserSpeaking: boolean) => void;

  /**
   * Starts the webrtc session with OpenAI real time api and initialize the loading of the available tools.
   * Returns the ephemeral token for the session.
   */
  initSessionHandler: () => Promise<string | null>;

  setPeerConnection: (peerConnection: RTCPeerConnection | null) => void; // sets the peer connection
  setDataStream: (dataStream: RTCDataChannel | null) => void; // sets the data stream
  setMediaStream: (mediaStream: MediaStream | null) => void; // sets the media stream

  setAiVoice: (aiVoice: AIVoice) => void; // sets the voice of the AI
  setAiEmotion: (aiEmotion: string) => void; // sets the emotion of the AI

  updateSession: (
    update_type: 'all' | 'tools' | 'voice' | 'emotion' | 'name'
  ) => void; // Updates the session with the latest tools, voice and emotion

  /**
   * Sets the mute state of the user. This means the user's audio will not be collected. However the
   * user can still hear the AI and the webRTC session is still active.
   * @param muted
   */
  setMuted: (muted: boolean) => void;

  /**
   * Use this function to send an user typed message to the AI
   */
  sendTextMessage: (message: string) => Promise<void>;

  /**
   * Use this function to send an system generated message to the AI
   */
  sendTextMessageAsSystem: (message: string) => Promise<void>;

  /**
   * Use this function to send a response to a function call
   * @param message
   * @param call_id
   */
  sendFunctionCallResponseMessage: (message: string, call_id: string) => void;
}

export const useSessionHandler = create<SessionHandler>((set, get) => {
  return {
    state: 'open',
    peerConnection: null,
    dataStream: null,
    aiVoice: 'sage',
    aiEmotion: 'highly energetic and cheerfully enthusiastic',
    muted: true,
    isUserSpeaking: false,
    mediaStream: null,

    setIsUserSpeaking: (isUserSpeaking: boolean) => {
      set({ isUserSpeaking: isUserSpeaking });
    },

    initSessionHandler: async (): Promise<string | null> => {
      set({ state: 'loading' });
      // get our ephemeral token
      const response = await apiClient.get<OpenAIKeyGenResponse>(
        API_URLS.SESSION,
        undefined,
        'data'
      );
      if (ApiClient.isApiResponse<OpenAIKeyGenResponse>(response)) {
        return response.data.client_secret.value;
      } else {
        // if the response is not successful, show a toast
        toast.error('Failed to Fetch Token');
        set({ state: 'error' });
        return null;
      }
    },

    setDataStream: (dataStream: RTCDataChannel | null): void => {
      set({ dataStream });
    },

    setPeerConnection: (peerConnection: RTCPeerConnection | null): void => {
      set({ peerConnection });
    },

    setMediaStream: (mediaStream: MediaStream | null): void => {
      set({ mediaStream });
    },

    setAiVoice: (aiVoice: AIVoice): void => {
      set({ aiVoice });
    },

    setAiEmotion: (aiEmotion: string): void => {
      set({ aiEmotion });
    },

    setMuted: (muted: boolean): void => {
      set({ muted });
    },

    updateSession: async (
      update_type: 'all' | 'tools' | 'voice' | 'emotion' | 'name'
    ): Promise<void> => {
      const updateParams = {
        type: 'session.update',
        session: {},
      };

      if (update_type === 'all') {
        updateParams.session = {
          modalities: ['text', 'audio'],
          instructions: getToolSetSelectorPrimeDirective(
            get().aiEmotion,
            useUserHandler.getState().name
          ),
          voice: get().aiVoice.toLowerCase(),
          input_audio_transcription: {
            model: 'whisper-1',
          },
          tools: [getRequiredToolset],
          tool_choice: 'auto',
          temperature: 0.6,
        };
      } else if (update_type === 'voice') {
        updateParams.session = {
          voice: get().aiVoice.toLowerCase(),
        };
      } else if (update_type === 'emotion') {
        updateParams.session = {
          instructions: getToolSetSelectorPrimeDirective(
            get().aiEmotion,
            useUserHandler.getState().name
          ),
        };
      } else if (update_type === 'name') {
        updateParams.session = {
          instructions: getToolSetSelectorPrimeDirective(
            get().aiEmotion,
            useUserHandler.getState().name
          ),
        };
      }

      // send the event across the data stream
      get().dataStream?.send(JSON.stringify(updateParams));
    },

    sendTextMessage: async (message: string): Promise<void> => {
      const currentRoomId = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomId) {
        const newRoom = await useChatRoomHandler.getState().createChatRoom({
          name: message.substring(0, 20),
        });
        if (newRoom) {
          await useChatRoomHandler.getState().setCurrentChatRoom(newRoom);
        }
      }
      if (get().dataStream && get().dataStream?.readyState === 'open') {
        const textMessage = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: message,
              },
            ],
          },
        };
        get().dataStream?.send(JSON.stringify(textMessage));
        get().dataStream?.send(JSON.stringify({ type: 'response.create' }));
      } else {
        toast.error('Failed to send message. Reload the page');
      }
    },

    sendTextMessageAsSystem: async (message: string): Promise<void> => {
      const currentRoomId = useChatRoomHandler.getState().currentChatRoom?.id;
      if (!currentRoomId) {
        // We have not selected a chat room so first create one
        const newRoom = await useChatRoomHandler.getState().createChatRoom({
          name: message.substring(0, 20),
        });
        if (newRoom) {
          await useChatRoomHandler.getState().setCurrentChatRoom(newRoom);
        }
      }
      if (get().dataStream && get().dataStream?.readyState === 'open') {
        const textMessage = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: message,
              },
            ],
          },
        };
        get().dataStream?.send(JSON.stringify(textMessage));
        get().dataStream?.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['text'],
            },
          })
        );
      } else {
        toast.error('Failed to send message. Reload the page');
      }
    },

    sendFunctionCallResponseMessage: (
      message: string,
      call_id: string
    ): void => {
      if (get().dataStream && get().dataStream?.readyState === 'open') {
        const textMessage = {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: call_id,
            output: JSON.stringify({ response: message }),
          },
        };
        get().dataStream?.send(JSON.stringify(textMessage));
        get().dataStream?.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['text'],
            },
          })
        );
      } else {
        toast.error('Failed to send message. Reload the page');
      }
    },
  };
});
