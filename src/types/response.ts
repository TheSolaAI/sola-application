export interface userSettingsResponse {
  id: number;
  user_id: number;
  theme: string;
  voice_preference: string;
  emotion_choice: string;
  credits_remaining: number;
  tiers: string;
}

export interface ChatRoomResponse {
  id: number;
  name: string;
  session_id: string;
  agent_id: number;
  user: number;
}
