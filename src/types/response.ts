import { AIEmotion, AIVoice } from '../config/ai.ts';

export interface UserSettingsResponse {
  id: number;
  user_id: number;
  theme: string;
  voice_preference: AIVoice;
  emotion_choice: AIEmotion;
  credits_remaining: number;
  tiers: string;
}

export interface ChatRoomResponse {
  id: number;
  name: string;
  agent_id: number;
  user: number;
}

export interface ChatMessagesResponse {
  count: number;
  next: string;
  previous: string;
  results: ChatMessageResponseWrapper[];
}

export interface ChatMessageResponseWrapper {
  id: number;
  message: string; // this is JSON string of our ChatContent
  created_at: string;
}

export interface OpenAIKeyGenResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
}

export interface TokenDataResponse {
  image: string;
  metadata: {
    name: string;
    symbol: string;
    address: string;
  };
  price: number;
  marketcap: number;
  volume: number;
  price_change_24: number;
}
