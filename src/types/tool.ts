// src/types/tool.ts
import { z } from 'zod';
import { FC } from 'react';
import { ChatContentType } from './chatItem';

// Schema registry type
export type SchemaRegistry = {
  [K in keyof typeof ToolPropsTypeMap]: z.ZodTypeAny;
};

// Map prop types to content types
export const ToolPropsTypeMap = {
  token_data: 'TokenDataChatContent',
  top_holders: 'TopHoldersChatContent',
  bubble_map: 'BubbleMapChatContent',
  rug_check: 'RugCheckChatContent',
  token_address_result: 'TokenAddressResultChatContent',
  create_limit_order: 'LimitOrderChatContent',
  get_limit_order: 'ShowLimitOrdersChatContent',
  ai_projects_classification: 'AiProjectsChatContent',
  nft_collection_data: 'NFTCollectionChatContent',
  get_trending_nfts: 'GetTrendingNFTSChatContent',
  user_lulo_data: 'LuloChatContent',
  swap: 'SwapChatContent',
  get_lst_data: 'ShowLSTDataChatContent',
  market_data: 'MarketDataChatContent',
  transaction_message: 'TransactionChatContent',
  agent_swap: 'AgentSwapChatContent',
} as const;

export type ToolPropsType = keyof typeof ToolPropsTypeMap;

// Strong typed tool result
export type ToolResult<T extends ToolPropsType> = {
  status: 'success' | 'error';
  response: string;
  props?: Extract<ChatContentType, { type: T }>;
};

// Use this when creating your tools
export type RegisteredTool<T extends ToolPropsType> = {
  abstraction: {
    type: 'function';
    name: string;
    description: string;
    parameters: any;
  };
  cost?: number;
  implementation: (
    args: any,
    response_id: string
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: Extract<ChatContentType, { type: T }>;
  }>;
  representation?: {
    props_type: T;
    component: FC<{ props: Extract<ChatContentType, { type: T }> }>;
  };
};
