import { FC } from 'react';
import { SimpleMessageChatContent } from '../../../types/chatItem.ts';
import BaseChatItem from './general/BaseChatItem.tsx';

interface SimpleMessageChatItemProps {
  props: SimpleMessageChatContent;
}

/**
 * Helper function to clean up formatting but preserve list and paragraph structure
 */
const normalizeText = (text: string) => {
  return text
    .replace(/\s*-\s*/g, '\n- ') // Ensure each '-' starts on a new line
    .replace(/\s*\n\s*/g, '\n') // Clean up excessive spaces around newlines
    .replace(/\n{2,}/g, '\n\n') // Ensure a single blank line for paragraph breaks
    .trim();
};

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
  props,
}) => {
  console.log(props.text);
  return (
    <BaseChatItem>
      <p className="text-sm text-textColor whitespace-pre-wrap">
        {normalizeText(props.text)}
      </p>
    </BaseChatItem>
  );
};
