import { FC } from 'react';
import { TransferChatContent } from '../../types/chatItem.ts';
import BaseMonoGridChatItem from './general/BaseMonoGridChatItem.tsx';

interface TransferChatItemProps {
  props: TransferChatContent;
}

export const TransferChatItem: FC<TransferChatItemProps> = ({ props }) => {
  return (
    <BaseMonoGridChatItem>
      <img src="/solscan.png" alt="solscan" className="h-10 w-10" />
      <span className="font-semibold text-lg">Transfer</span>
      <span>{props.status}</span>
      <a
        href={props.txn}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primaryDark hover:underline text-sm"
      >
        View details on Solscan ↗
      </a>
    </BaseMonoGridChatItem>
  );
};
