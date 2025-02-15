import { FC } from 'react';
import {
  BaseChatContent,
  TokenDataChatContent,
  LuloChatContent,
  ShowLSTDataChatContent,
  ShowLimitOrdersChatContent,
  BubbleMapChatContent,
  RugCheckChatContent,
  TopHoldersChatContent,
  SwapChatContent,
  MarketDataChatContent,
  TransactionChatContent,
  GetTrendingNFTSChatContent,
} from './chatItem.ts';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';

export interface BaseTool {
  implementation: (
    args: any,
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: BaseChatContent;
  }>;
  abstraction: {
    type: `function`;
    name: string;
    description: string;
    parameters: any;
  };
}
export interface TokenDataTool extends BaseTool {
  implementation: (
    args: { token_address: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TokenDataChatContent;
  }>;
  representation?: {
    props_type: 'token_data';
    component: FC<{ props: TokenDataChatContent }>;
  };
}

export interface DepositLuloTool extends BaseTool {
  implementation: (
    args: {
      amount: number;
      token: 'USDT' | 'USDS' | 'USDC';
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TransactionChatContent;
  }>;
  representation?: {
    props_type: 'transaction_message';
    component: FC<{ props: TransactionChatContent }>;
  };
}

export interface WithdrawLuloTool extends BaseTool {
  implementation: (
    args: {
      amount: number;
      token: 'USDT' | 'USDS' | 'USDC';
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TransactionChatContent;
  }>;
  representation?: {
    props_type: 'withdraw_lulo';
    component: FC<{ props: TransactionChatContent }>;
  };
}

export interface UserAssetsLuloTool extends BaseTool {
  implementation: (
    args: { currentWallet: ConnectedSolanaWallet | null },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: LuloChatContent;
  }>;
  representation?: {
    props_type: 'user_assets_lulo';
    component: FC<{ props: LuloChatContent }>;
  };
}

export interface CreateLimitOrderTool extends BaseTool {
  implementation: (
    args: {
      token: 'SOL' | 'SOLA' | 'USDC' | 'BONK' | 'USDT' | 'JUP' | 'WIF';
      amount: number;
      limitPrice: number;
      action: 'BUY' | 'SELL';
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TransactionChatContent;
  }>;
  representation?: {
    props_type: 'transaction_message';
    component: FC<{ props: TransactionChatContent }>;
  };
}

export interface GetLSTDataTool extends BaseTool {
  implementation: (
    args: { currentWallet: ConnectedSolanaWallet | null },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: ShowLSTDataChatContent;
  }>;
  representation?: {
    props_type: 'get_lst_data';
    component: FC<{ props: ShowLSTDataChatContent }>;
  };
}

export interface ShowLimitOrdersTool extends BaseTool {
  implementation: (
    args: { currentWallet: ConnectedSolanaWallet | null },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: ShowLimitOrdersChatContent;
  }>;
  representation?: {
    props_type: 'show_limit_orders';
    component: FC<{ props: ShowLimitOrdersChatContent }>;
  };
}

export interface RugCheckTool extends BaseTool {
  implementation: (
    args: { token: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: RugCheckChatContent;
  }>;
  representation?: {
    props_type: 'rug_check';
    component: FC<{ props: RugCheckChatContent }>;
  };
}

export interface TopHoldersTool extends BaseTool {
  implementation: (
    args: { tokenInput: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TopHoldersChatContent;
  }>;
  representation?: {
    props_type: 'top_holders';
    component: FC<{ props: TopHoldersChatContent }>;
  };
}

export interface BubbleMapTool extends BaseTool {
  implementation: (
    args: { token: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: BubbleMapChatContent;
  }>;
  representation?: {
    props_type: 'bubble_map';
    component: FC<{ props: BubbleMapChatContent }>;
  };
}

export interface SwapTool extends BaseTool {
  implementation: (
    args: {
      swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
      quantity: number;
      tokenA: 'SOL' | 'SOLA' | 'USDC' | 'JUP' | 'USDT' | 'BONK';
      tokenB: 'SOL' | 'SOLA' | 'USDC' | 'JUP' | 'USDT' | 'BONK';
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: SwapChatContent;
  }>;
  representation?: {
    props_type: 'swap';
    component: FC<{ props: SwapChatContent }>;
  };
}

export interface MarketDataTool extends BaseTool {
  implementation: (
    args: { token: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: MarketDataChatContent;
  }>;
  representation?: {
    props_type: 'market_data';
    component: FC<{ props: MarketDataChatContent }>;
  };
}

export interface TransferSolTool extends BaseTool {
  implementation: (
    args: {
      recipientAddress: string;
      amount: number;
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TransactionChatContent;
  }>;
  representation?: {
    props_type: 'transfer_sol';
    component: FC<{ props: TransactionChatContent }>;
  };
}

export interface TransferSPLTool extends BaseTool {
  implementation: (
    args: {
      recipientAddress: string;
      amount: number;
      token: string;
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TransactionChatContent ;
  }>;
  representation?: {
    props_type: 'transfer_spl';
    component: FC<{ props: TransactionChatContent  }>;
  };
}

export interface GetTrendingNFTSTool extends BaseTool {
  implementation: (
    args: {
      currentWallet: ConnectedSolanaWallet | null;
    },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: GetTrendingNFTSChatContent
  }>;
  representation?: {
    props_type: 'get_trending_nfts';
    component: FC<{ props: GetTrendingNFTSChatContent }>;
  };
}

export type Tool =
  | TokenDataTool
  | DepositLuloTool
  | WithdrawLuloTool
  | UserAssetsLuloTool
  | CreateLimitOrderTool
  | GetLSTDataTool
  | ShowLimitOrdersTool
  | RugCheckTool
  | TopHoldersTool
  | BubbleMapTool
  | SwapTool
  | MarketDataTool
  | TransferSolTool
  | TransferSPLTool
  | GetTrendingNFTSTool;
