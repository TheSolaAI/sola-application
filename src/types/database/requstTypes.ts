import { ThemeType } from "../app";

export type RegisterUser = {
  privy_wallet_id: string;
  wallet_id: string;
  wallet_provider: string;
};

export type UserSettings = {
  theme?: ThemeType;
  voice_preference?: string;
  emotion_choices?: string;
};
