import { VersionedTransaction } from '@solana/web3.js';

export type SwapParams = {
  input_mint: string;
  output_mint: string;
  public_key: string;
  amount: number;
  swap_mode: string;
};

export type SwapResponse = {
  transaction: string;
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
  order: string;
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
