import { FC } from 'react';
import { SwapChatContent } from '../../../types/chatItem.ts';
import BaseMonoGridChatItem from './general/BaseMonoGridChatItem.tsx';

interface SwapChatItemProps {
  props: SwapChatContent;
}

export const SwapChatItem: FC<SwapChatItemProps> = ({ props }) => {
  return (
    <BaseMonoGridChatItem>
      <img src="/solscan.png" alt="solscan" className="h-10 w-10" />
      <span className="font-semibold text-lg">Swap</span>
      <span>Amount: {props.data.amount}</span>
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
