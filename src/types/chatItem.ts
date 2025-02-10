export interface ChatItem<T extends BaseChatContent> {
  // Make ChatItem generic
  id: number;
  content: T; // Insert any of the ChatContent types here
  sender: 'user' | 'assistant' | 'system';
  createdAt: string;
}

export interface BaseChatContent {
  response_id: string;
  sender: 'user' | 'assistant' | 'system';
}

export type ChatContentType = SimpleMessageChatContent;

export interface SimpleMessageChatContent extends BaseChatContent {
  type: 'simple_message';
  text: string;
}
