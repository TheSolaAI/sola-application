import { VersionedTransaction } from "@solana/web3.js";

export type SwapParams = {
  input_mint: string;
  output_mint: string;
  public_key: string;
  amount: number;
  swap_mode: string;
};

export type SwapResponse = {
  transaction: VersionedTransaction;
};

export type LimitOrderParams = {
  token_mint_a: string;  
  token_mint_b: string;  
  public_key: string;    
  amount: number;        
  limit_price: number;   
  action: "BUY" | "SELL";  
}

export type LimitOrderResponse = {
  order: string;
  tx: string;
};