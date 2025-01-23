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
