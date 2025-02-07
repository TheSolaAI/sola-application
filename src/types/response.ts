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
  message: {
    content: string;
    sender: 'user' | 'agent' | 'system';
  };
  created_at: string;
}
