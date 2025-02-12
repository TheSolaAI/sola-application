export interface ChatItem<T extends BaseChatContent> {
  // Make ChatItem generic
  id: number;
  content: T;
  createdAt: string;
}

export interface BaseChatContent {
  response_id: string;
  sender: 'user' | 'assistant' | 'system';
}

export type ChatContentType = SimpleMessageChatContent | TokenDataChatContent;

export interface SimpleMessageChatContent extends BaseChatContent {
  type: 'simple_message';
  text: string;
}

export interface TokenDataChatContent extends BaseChatContent {
  type: 'token_data';
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  image: string;
}

/**
 * This type is used on the UI side to ensure type safety when rendering a message item
 */
export interface ChatItemProps<T extends ChatContentType> {
  props: T;
}
