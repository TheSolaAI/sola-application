import { AIVoice } from '@/config/ai';
import { Theme } from '@/store/ThemeManager';
import { UserTierStatus } from './tier';

export interface UserSettingsResponse {
  id: number;
  user_id: number;
  name: string;
  profile_pic: {
    color: string;
    initials: string;
  };
  theme: string;
  voice_preference: AIVoice;
  emotion_choice: string;
  credits_remaining: number;
  tiers: string;
  custom_themes: Theme[];
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

export interface TransactionResponse {
  status: string;
  txid: string;
  message: string;
}

export interface ToolSetChooserResponse {
  selectedToolset: string[];
  fallbackResponse: string;
  audioData: string;
  needsToolset: boolean;
  usageLimit: UserTierStatus;
}
