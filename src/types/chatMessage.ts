export interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'agent' | 'system';
  createdAt: string;
}
