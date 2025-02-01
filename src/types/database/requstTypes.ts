import { ThemeType } from '../app';
import { AiEmotion, AiVoice } from './aiConfig';

export type RegisterUser = {
  privy_wallet_address: string;
  wallet_address: string;
  wallet_provider: string;
};

export type UserSettings = {
  theme?: ThemeType;
  voice_preference?: AiVoice;
  emotion_choice?: AiEmotion;
};

export type CreateRoom = {
  name: string;
  session_id: string;
};

export type RoomMessages = {
  limit?: number;
  offset?: number;
};

export type SendChatMessage = {
  message: string | JSON;
};
