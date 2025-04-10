export type PfBuyParams = {
  output_mint: string;
  public_key: string;
  amount: number;
  slippage: number;
};

export type PfSellParams = {
  input_mint: string;
  public_key: string;
  amount: number;
  slippage: number;
};

export type PfBuyResponse = {
  transaction: string;
  outAmount: number;
};
export type PfSellResponse = {
  transaction: string;
  outAmount: number;
};
