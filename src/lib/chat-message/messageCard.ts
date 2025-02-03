import { ShowLimitOrder } from '../../types/jupiter';
import { MessageCard, ShowLimitOrderCard } from '../../types/messageCard';

export const messageCard = (message: string): MessageCard => {
  return {
    type: 'message',
    message: message,
  };
};

export const aiTranscriptCard = (message: string): MessageCard => {
  return {
    type: 'aiTranscription',
    message: message,
  };
};

export const transactionCard = (signature: string): MessageCard => {
  return {
    type: 'transaction',
    card: {
      title: 'Transaction',
      status: 'Pending',
      link: `https://solscan.io/tx/${signature}`,
    },
  };
};

export const showLimitOrderCard = (orders: ShowLimitOrder[]): MessageCard => {
  let card: ShowLimitOrderCard = {
    orders: orders,
  };
  return {
    type: 'limitOrder',
    card: card,
  };
};
