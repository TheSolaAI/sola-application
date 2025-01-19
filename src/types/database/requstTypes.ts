import { ThemeType } from "../app";
import { AIEMOTION, AIVOICE } from "./aiConfig";

export type RegisterUser = {
  privy_wallet_id: string;
  wallet_id: string;
  wallet_provider: string;
};

export type UserSettings = {
  theme?: ThemeType;
  voice_preference?: AIVOICE;
  emotion_choices?: AIEMOTION;
};
