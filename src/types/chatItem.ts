import { LSTData} from "./data_types";
import { LimitOrderResponse, ShowLimitOrderResponse, SwapParams, SwapResponse } from "./jupiter";
import { AssetsResponse, DepositResponse, LuloTransaction, WithdrawResponse } from "./lulo";
import { BubblemapCard, MarketDataCard, RugCheckCard, TopHolder } from "./messageCard";


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

export type ChatContentType = SimpleMessageChatContent
  | TokenDataChatContent
  | DepositLuloChatContent
  | WithdrawLuloChatContent
  | UserAssetsLuloChatContent
  | CreateLimitOrderChatContent
  | ShowLimitOrdersChatContent
  | SwapChatContent
  | MarketDataChatContent
  | BubbleMapChatContent
  | ShowLSTDataChatContent
  | RugCheckChatContent
  | TopHoldersChatContent
  | TransferChatContent


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

export interface DepositLuloChatContent extends BaseChatContent{
  type: 'deposit_lulo'
  data:LuloTransaction
}
export interface WithdrawLuloChatContent extends BaseChatContent{
  type: 'withdraw_lulo';
  data:LuloTransaction
}
export interface UserAssetsLuloChatContent extends BaseChatContent {
  type: 'user_assets_lulo';
  data: AssetsResponse;
}

export interface CreateLimitOrderChatContent extends BaseChatContent {
  type: 'create_limit_order';
  data: LimitOrderResponse
}

export interface ShowLimitOrdersChatContent extends BaseChatContent {
  type: 'get_limit_order';
  data: ShowLimitOrderResponse
}

export interface ShowLSTDataChatContent extends BaseChatContent {
  type: 'get_lst_data';
  data: LSTData[]
}

export interface NFTPriceChatContent extends BaseChatContent {
  type: 'nft_price';
}

export interface RugCheckChatContent extends BaseChatContent {
  type: 'rug_check';
  data:RugCheckCard
}
export interface TopHoldersChatContent extends BaseChatContent {
  type: 'top_holders';
  data: TopHolder[]
}
export interface SwapChatContent extends BaseChatContent {
  type: 'swap';
  data: SwapParams
  txn: string
}
export interface TransferChatContent extends BaseChatContent {
  type: 'transfer';
  from: string;
  to: string;
  amount: number;
  token: string;
  status: string;
  txn: string;
}
export interface BubbleMapChatContent extends BaseChatContent {
  type: 'bubble_map';
  data: BubblemapCard
}

export interface MarketDataChatContent extends BaseChatContent {
  type: 'market_data';
  data: MarketDataCard
}



/**
 * This type is used on the UI side to ensure type safety when rendering a message item
 */
export interface ChatItemProps<T extends ChatContentType> {
  props: T;
}
