import { ThemeType } from "../app";

export type RegisterUserResponse = {
  id: number;
  privy_wallet_id: string;
  wallet_id: string;
  wallet_Provider: string;
};

export type UserSettingsResponse = {
  theme: ThemeType;
  voice_preference: string;
  emotion_choices: string;
};
