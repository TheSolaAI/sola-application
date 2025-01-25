import { MessageCard } from '../../types/messageCard';

export const agentMessage = (message: string): MessageCard => {
  return {
    type: 'agent',
    message: message,
  };
};
