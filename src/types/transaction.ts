import { TransactionResponse } from './response';

export interface TransactionRenderResult {
  transactionDetails: TransactionResponse;
  inputArgs: Record<string, any>;
}
