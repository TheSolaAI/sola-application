'use client';

import { FC } from 'react';
import { TransactionChatContent } from '@/types/chatItem';
import BaseMonoGridChatItem from '@/components/messages/general/BaseMonoGridChatItem';
import Image from 'next/image';

interface TransferChatItemProps {
  props: TransactionChatContent;
}

export const TransferChatItem: FC<TransferChatItemProps> = ({ props }) => {
  return (
    <BaseMonoGridChatItem>
      <Image height={40} width={40} src="/solscan.png" alt="solscan" />
      <span className="font-semibold text-lg">Transfer</span>
      <span>{props.data.status}</span>
      <a
        href={props.data.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primaryDark hover:underline text-sm"
      >
        View details on Solscan ↗
      </a>
    </BaseMonoGridChatItem>
  );
};
