// src/types/tool.ts
import { z } from 'zod';
import { FC } from 'react';
import { ChatContentType } from './chatItem';

// Schema registry type
export type SchemaRegistry = {
  [K in keyof typeof ToolPropsTypeMap]: z.ZodTypeAny;
};

// Map prop types to content types (use your existing mapping)
export const ToolPropsTypeMap = {
  token_data: 'TokenDataChatContent',
  swap: 'SwapChatContent',
  get_lst_data: 'ShowLSTDataChatContent',
  market_data: 'MarketDataChatContent',
  transaction_message: 'TransactionChatContent',
  transfer_sol: 'TransactionChatContent',
  transfer_spl: 'TransactionChatContent',
  user_lulo_data: 'LuloChatContent',
  nft_collection_data: 'NFTCollectionChatContent',
  get_trending_nfts: 'GetTrendingNFTSChatContent',
  ai_projects_classification: 'AiProjectsChatContent',
  create_limit_order: 'LimitOrderChatContent',
  agent_swap: 'AgentSwapChatContent',
} as const;

export type ToolPropsType = keyof typeof ToolPropsTypeMap;

// Strong typed tool result
export type ToolResult<T extends ToolPropsType> = {
  status: 'success' | 'error';
  response: string;
  props?: Extract<ChatContentType, { type: T }>;
};

// Enhanced Tool interface with schema
export interface EnhancedTool<T extends ToolPropsType, S extends z.ZodTypeAny> {
  name: string;
  description: string;
  schema: S;
  propsType: T;
  cost?: number;
  implementation: (
    args: z.infer<S>,
    response_id: string
  ) => Promise<ToolResult<T>>;
  representation?: {
    props_type: T;
    component: FC<{ props: Extract<ChatContentType, { type: T }> }>;
  };
}

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
