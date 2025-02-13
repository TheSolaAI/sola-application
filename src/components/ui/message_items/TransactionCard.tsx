/**
 * This component renders a chat item displaying transaction-related information.
 * It is designed to show the transaction title, status, and a link to view
 * details on Solscan.
 *
 * Props:
 * - `props.title` (string): The title of the transaction message.
 * - `props.status` (string): The status of the transaction (e.g., "Success", "Pending").
 * - `props.link` (string): A URL linking to the transaction details on Solscan.
 *
 * Dependencies:
 * - `ChatItemProps<TransactionDataChatContent>`: Type definition for chat item props.
 * - `BaseMonoGridChatItem`: A wrapper component for consistent chat item styling.
 *
 * Usage:
 * ```tsx
 * <TokenDataMessageItem
 *   props={{
 *     title: "Transaction Confirmed",
 *     status: "Success",
 *     link: "https://solscan.io/tx/..."
 *   }}
 * />
 * ```
 */

import { FC } from 'react';
import {
  ChatItemProps,
  TransactionDataChatContent,
} from '../../../types/chatItem.ts';
import BaseMonoGridChatItem from './general/BaseMonoGridChatItem.tsx';

export const TokenDataMessageItem: FC<
  ChatItemProps<TransactionDataChatContent>
> = ({ props }) => {
  return (
    <div>
      <BaseMonoGridChatItem>
        <img src="/solscan.png" alt="solscan" className="h-10 w-10" />
        <span className="font-semibold text-lg">{props.title}</span>
        <span>{props.status}</span>
        <a
          href={props.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primaryDark hover:underline text-sm"
        >
          View details on Solscan ↗
        </a>
      </BaseMonoGridChatItem>
    </div>
  );
};
