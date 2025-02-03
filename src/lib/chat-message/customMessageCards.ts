import { MessageCard } from '../../types/messageCard';

export const customMessageCards = (type: any, card: any): MessageCard => {
  return {
    type: type,
    card: card,
  };
};
