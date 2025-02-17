import { LSTData, RugCheck } from './data_types';
import { ShowLimitOrderResponse, SwapParams } from './jupiter';
import {
  BubblemapCard,
  MarketDataCard,
  TopHolder,
  TokenCard,
  TransactionCard,
  NFTCollectionCard,
  LuloCard,
  TrendingNFTCard,
  NFTCard,
} from './messageCard';
import { GoatIndexTokenData } from './goatIndex.ts';

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

export type ChatContentType =
  | SimpleMessageChatContent
  | UserAudioChatContent
  | TransactionChatContent
  | TokenDataChatContent
  | NFTCollectionChatContent
  | LuloChatContent
  | ShowLimitOrdersChatContent
  | SwapChatContent
  | MarketDataChatContent
  | BubbleMapChatContent
  | ShowLSTDataChatContent
  | RugCheckChatContent
  | TopHoldersChatContent
  | GetTrendingNFTSChatContent
  | AiProjectsChatContent;

export interface SimpleMessageChatContent extends BaseChatContent {
  type: 'simple_message';
  text: string;
}

export interface UserAudioChatContent extends BaseChatContent {
  type: 'user_audio_chat';
  text: string;
}

export interface TransactionChatContent extends BaseChatContent {
  type: 'transaction_message' | 'transfer_sol' | 'transfer_spl';
  data: TransactionCard;
}

export interface TokenDataChatContent extends BaseChatContent {
  type: 'token_data';
  data: TokenCard;
}

export interface NFTCollectionChatContent extends BaseChatContent {
  type: 'nft_collection_data';
  data: NFTCollectionCard;
}

export interface LuloChatContent extends BaseChatContent {
  type: 'user_lulo_data';
  data: LuloCard;
}

export interface ShowLimitOrdersChatContent extends BaseChatContent {
  type: 'get_limit_order';
  data: ShowLimitOrderResponse;
}

export interface ShowLSTDataChatContent extends BaseChatContent {
  type: 'get_lst_data';
  data: LSTData[];
}

export interface RugCheckChatContent extends BaseChatContent {
  type: 'rug_check';
  data: RugCheck;
}

export interface TopHoldersChatContent extends BaseChatContent {
  type: 'top_holders';
  data: TopHolder[];
}

export interface SwapChatContent extends BaseChatContent {
  type: 'swap';
  data: SwapParams;
  txn: string;
}

export interface BubbleMapChatContent extends BaseChatContent {
  type: 'bubble_map';
  data: BubblemapCard;
}

export interface MarketDataChatContent extends BaseChatContent {
  type: 'market_data';
  data: MarketDataCard;
}
export interface GetTrendingNFTSChatContent extends BaseChatContent {
  type: 'get_trending_nfts';
  data: TrendingNFTCard[];
}

export interface NFTPriceChatContent extends BaseChatContent {
  type: 'nft_price';
  data: NFTCard;
}

export interface AiProjectsChatContent extends BaseChatContent {
  type: 'ai_projects';
  category: string;
  tokensByMindShare?: GoatIndexTokenData[];
}
/**
 * This type is used on the UI side to ensure type safety when rendering a message item
 */
export interface ChatItemProps<T extends ChatContentType> {
  props: T;
}
