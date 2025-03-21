import { ConnectedSolanaWallet } from '@privy-io/react-auth';

export type SwapParams = {
  input_mint: string;
  output_mint: string;
  public_key: string;
  amount: number;
  swap_mode: string;
  priority_fee_needed: boolean;
};

export type SwapResponse = {
  transaction: string;
  priorityFee: number;
  outAmount: number;
};

export type LimitOrderParams = {
  token_mint_a: string;
  token_mint_b: string;
  public_key: string;
  amount: number;
  limit_price: number;
  action: 'BUY' | 'SELL';
};

export type LimitOrderResponse = {
  order_id: string;
  tx: string;
};

export type ShowLimitOrderResponse = {
  orders: ShowLimitOrder[];
};

export interface ShowLimitOrder {
  created_at: string;
  input_amount: string;
  input_mint: string;
  order_id: string;
  output_amount: string;
  output_mint: string;
}

export type ShowLimitOrderParams = {
  public_key: string;
};

export type CancelLimitOrderParams = {
  order_id: string[];
  public_key: ConnectedSolanaWallet | null;
};

export type CancelLimitOrderResponse = {
  transaction: string[];
};
