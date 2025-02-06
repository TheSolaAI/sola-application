export interface UserSettingsResponse {
  id: number;
  user_id: number;
  theme: string;
  voice_preference: string;
  emotion_choice: string;
  credits_remaining: number;
  tiers: string;
}
