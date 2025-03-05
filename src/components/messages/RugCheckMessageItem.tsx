import { FC } from 'react';
import { RugCheckChatContent } from '../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';

interface RugCheckChatItemProps {
  props: RugCheckChatContent;
}

export const RugCheckChatItem: FC<RugCheckChatItemProps> = ({ props }) => {
  const issues = props.data?.message || 'Failed to load';
  const scoreColor =
    props.data.score >= 85
      ? 'text-dark-green-500'
      : props.data.score >= 70
        ? 'text-light-green-500'
        : issues.length >= 40
          ? 'text-orange-500'
          : 'text-red-500';

  return (
    <BaseGridChatItem col={1}>
      <div>
        <span className={`${scoreColor} font-semibold p-2`}>
          Risk Level: {props.data.score}
        </span>
        <span className={`font-semibold p-2`}>
          Risk Level: {props.data.message}
        </span>
      </div>
    </BaseGridChatItem>
  );
};
