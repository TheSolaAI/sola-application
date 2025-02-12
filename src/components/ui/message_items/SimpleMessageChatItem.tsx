import { FC } from 'react';
import { SimpleMessageChatContent } from '../../../types/chatItem.ts';
import BaseChatItem from './general/BaseChatItem.tsx';


interface SimpleMessageChatItemProps {
  props: SimpleMessageChatContent;
}

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
  props,
}) => {
  return (
    <BaseChatItem>
      <p className="text-sm text-textColor">{props.text}</p>
    </BaseChatItem>
  );
};
