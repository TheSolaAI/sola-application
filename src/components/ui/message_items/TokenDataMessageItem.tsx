import { FC } from 'react';
import {
  ChatItemProps,
  TokenDataChatContent,
} from '../../../types/chatItem.ts';
import BaseChatItem from './general/BaseChatItem.tsx';

export const TokenDataMessageItem: FC<ChatItemProps<TokenDataChatContent>> = ({
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
