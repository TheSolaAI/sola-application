export type RegisterUser = {
  email: string;
  id: string;
  connect_wallet: string;
  wallet_Provider: string;
};

export type UserSettings = {
  user_id: string;
  theme: string;
  voice_preference: string;
  emotion_choices: string;
};
