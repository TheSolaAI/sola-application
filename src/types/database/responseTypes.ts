import { ThemeType } from '../app';

export type RegisterUserResponse = {
  id: number;
  username: string;
  privy_wallet_address: string;
  wallet_address: string;
  wallet_Provider: string;
};

export type UserSettingsResponse = {
  id: number;
  user_id: number;
  theme: ThemeType;
  voice_preference: string;
  emotion_choice: string;
};

export type ChatRoom = {
  id: number;
  name: string;
  session_id: string;
  user: number;
};

export type ChatMessageResponse = {
  id: number;
  message: string;
  created_at: string;
};

export type ChatMessagesResponse = {
  count: number;
  next: string;
  previous: string;
  results: [ChatMessageResponse];
};

export type SendMessageResponse = {
  id: number;
  message: string;
  created_at: string;
};
