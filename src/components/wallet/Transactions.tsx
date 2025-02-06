import { useWalletHandler } from '../../models/WalletHandler.ts';

export const Transactions = () => {
  /**
   * Global State
   */
  const { transactions } = useWalletHandler();

  return (
    <div className="text-textColor flex flex-col">
      {transactions.length === 0 ? (
        <p>No Transactions found.</p>
      ) : (
        <div className={'flex flex-col gap-y-2'}>
          <p className={'text-textColor'}>{JSON.stringify(transactions)}</p>
        </div>
      )}
    </div>
  );
};
