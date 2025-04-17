export interface TokenBalance {
  balance: number;
  mint: string;
  usdValue: number;
}

export interface DepositTransaction {
  protocol: string;
  totalDeposit: number;
  transaction: string;
}

export interface WithdrawTransaction {
  protocol: string;
  transaction: string;
}

export type AssetsParams = {
  owner: string;
};

export type AssetsResponse = {
  depositValue: number;
  interestEarned: number;
  tokenBalance: TokenBalance[];
  totalValue: number;
};

export type DepositParams = {
  owner: string;
  depositAmount: number;
  mintAddress: string;
};

export type DepositResponse = {
  transactions: DepositTransaction[][];
};

export type WithdrawParams = {
  owner: string;
  mintAddress: string;
  withdrawAmount: number;
  withdrawAll: boolean;
};

export type WithdrawResponse = {
  transactions: WithdrawTransaction[][];
};

export type LuloTransaction = {
  transaction: string;
  status: 'pending' | 'completed' | 'failed';
};
