import { FC } from 'react';
import { SimpleMessageChatContent } from '../../types/chatItem.ts';
import BaseChatItem from './general/BaseChatItem.tsx';
import MarkDownRenderer from './general/MarkDownRenderer.tsx';

interface SimpleMessageChatItemProps {
  props: SimpleMessageChatContent;
}

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
  props,
}) => {
  return (
    <BaseChatItem>
      <div className="text-textColor">
        <MarkDownRenderer content={props.text} />
      </div>
    </BaseChatItem>
  );
};
