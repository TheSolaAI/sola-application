import { MessageCard } from '../../types/messageCard';

export const messageCard = (message: string): MessageCard => {
  return {
    type: 'message',
    message: message,
  };
};

export const transactionCard = (signature : string): MessageCard => {
    return {
        type: 'transaction',
        card: {
          title: 'Transaction',
          status: 'Pending',
          link: `https://solscan.io/tx/${signature}`,
        },
      }
}