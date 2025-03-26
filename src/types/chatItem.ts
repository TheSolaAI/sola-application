import { LSTData, RugCheck } from './data_types';
import { ShowLimitOrderResponse } from './jupiter';
import {
  BubblemapCard,
  LuloCard,
  MarketDataCard,
  NFTCard,
  NFTCollectionCard,
  TokenCard,
  TopHolder,
  TransactionCard,
  TrendingNFTCard,
} from './messageCard';
import { AIProjectRankingResult, GoatIndexTokenData } from './goatIndex';

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
  | AgentSwapChatContent
  | SimpleMessageChatContent
  | LoaderMessageChatContent
  | InProgressChatContent
  | UserAudioChatContent
  | TransactionChatContent
  | TokenDataChatContent
  | TokenAddressResultChatContent
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
  | AiProjectsChatContent
  | LimitOrderChatContent;

export interface SimpleMessageChatContent extends BaseChatContent {
  type: 'simple_message';
  text: string;
}

export interface UserAudioChatContent extends BaseChatContent {
  type: 'user_audio_chat';
  text: string;
}

/**
 * Note: This chat content is not stored in the database and is only used in the chat
 */
export interface AgentSwapChatContent extends BaseChatContent {
  type: 'agent_swap';
  original_request: string;
}

/**
 * Note: This chat content is not stored in the database and is only used in the chat
 */
export interface LoaderMessageChatContent extends BaseChatContent {
  type: 'loader_message';
  text: string;
}

/**
 * Note: This chat content is not stored in the database and is only used in the chat
 */
export interface InProgressChatContent extends BaseChatContent {
  type: 'in_progress_message';
  text: string;
}

export interface TransactionChatContent extends BaseChatContent {
  type: 'transaction_message';
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

export interface TokenAddressResultChatContent extends BaseChatContent {
  type: 'token_address_result';
  symbol: string;
  tokenAddress: string;
  success: boolean;
  source?: string;
  errorMessage?: string;
}

export interface SwapChatContent extends BaseChatContent {
  type: 'swap';
  data: {
    swap_mode: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
    amount: number;
    output_amount: number;
    input_mint: string;
    output_mint: string;
    public_key: string;
    priority_fee_needed: boolean;
  };
  txn: string;
  status: 'pending' | 'failed' | 'success';
  timestamp: string;
  lastChecked?: string;
}

export interface LimitOrderChatContent extends BaseChatContent {
  type: 'create_limit_order';
  data: {
    amount: number;
    input_mint: string;
    output_mint: string;
    limit_price: number;
    action: 'BUY' | 'SELL';
    priority_fee_needed: boolean;
  };
  txn: string;
  status: 'pending' | 'failed' | 'success';
  timestamp: string;
  lastChecked?: string;
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
  type: 'ai_projects_classification';
  category: string;
  tokensByMindShare?: GoatIndexTokenData[];
  projectsByRanking?: AIProjectRankingResult[];
}
/**
 * This type is used on the UI side to ensure type safety when rendering a message item
 */
export interface ChatItemProps<T extends ChatContentType> {
  props: T;
}
