import { FC } from 'react';
import BaseChatItem from './general/BaseChatItem.tsx';
import MarkDownRenderer from './general/MarkDownRenderer.tsx';
import { InProgressChatContent } from '../../types/chatItem.ts';

interface InProgressMessageChatItemProps {
  props: InProgressChatContent;
}

export const InProgressMessageChatItem: FC<InProgressMessageChatItemProps> = ({
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
