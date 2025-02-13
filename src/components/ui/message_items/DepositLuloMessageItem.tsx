import { FC } from 'react';
import {
  ChatItemProps,
  DepositLuloChatContent
} from '../../../types/chatItem.ts';
import BaseChatItem from './general/BaseChatItem.tsx';

export const DepositLuloMessageItem: FC<ChatItemProps<DepositLuloChatContent>> = ({
  props,
}) => {
  // TODO: Implement this component properly
  return (
    <div>
      <BaseChatItem>
        <p className="text-sm text-textColor">{JSON.stringify(props)}</p>
      </BaseChatItem>
    </div>
  );
};
