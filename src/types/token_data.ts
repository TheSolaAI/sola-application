export type TokenGate = {
  status: string;
  data: TokenAmount;
  message: string;
};

interface TokenAmount {
  amount: number;
  tier: number;
}
