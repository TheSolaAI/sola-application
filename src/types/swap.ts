import { VersionedTransaction } from "@solana/web3.js";

export type SwapParams = {
  input_mint: string;
  output_mint: string;
  public_key: string;
  amount: number;
};

export type SwapResponse = {
  transaction: VersionedTransaction;
};
