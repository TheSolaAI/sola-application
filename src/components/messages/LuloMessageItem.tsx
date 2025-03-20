/**
 * This component displays Lulo-related data, including deposit value,
 * interest earned, total value, and token balances. It also provides links to
 * view tokens on Dexscreener.
 *
 * Dependencies:
 * - `LuloChatContent`: Type definition for Lulo chat content.
 * - `BaseMonoGridChatItem`: A wrapper for displaying deposit and interest data.
 * - `BaseGridChatItem`: A wrapper for listing token balances in a grid format.
 *
 * Usage:
 * ```tsx
 * <LuloChatItem
 *   props={{
 *     data: {
 *       depositValue: 1000.25,
 *       interestEarned: 50.75,
 *       totalValue: 1051.00,
 *       tokenBalance: [
 *         { balance: 20.5, mint: "TOKEN_MINT", usdValue: 45.3 },
 *         { balance: 15.8, mint: "ANOTHER_TOKEN", usdValue: 30.2 }
 *       ]
 *     }
 *   }}
 * />
 * ```
 */
'use client';

import { FC } from 'react';
import { LuloChatContent } from '@/types/chatItem';
import BaseGridChatItem from '@/components/messages/general/BaseGridChatItem';
import BaseMonoGridChatItem from '@/components/messages/general/BaseMonoGridChatItem';
import Image from 'next/image';

interface LuloChatItemProps {
  props: LuloChatContent;
}

export const LuloChatItem: FC<LuloChatItemProps> = ({ props }) => {
  const tokenBalance = props.data.tokenBalance;
  return (
    <>
      <BaseMonoGridChatItem>
        <Image
          height={60}
          width={60}
          src="/lulo.png"
          alt="luloimage"
          className="rounded-lg"
        />
        <p className="text-base font-medium">
          Deposit Value : {props.data.depositValue.toFixed(2)}
        </p>
        <p className="text-sm">
          Interest Earned : {props.data.interestEarned.toFixed(2)}
        </p>
        <p className="text-sm">
          Total Value : {props.data.totalValue.toFixed(2)}
        </p>
      </BaseMonoGridChatItem>
      <BaseGridChatItem col={3}>
        {tokenBalance.map((token, tokenIndex) => (
          <a
            key={tokenIndex}
            href={`https://dexscreener.com/solana/${token.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full overflow-hidden block rounded-xl bg-sec_background p-3"
          >
            <div className="flex items-center gap-3">
              <Image
                height={40}
                width={40}
                src={token.mint ? `/${token.mint}.png` : '/placeholder.png'}
                alt="Token"
                className="rounded-lg"
              />
              <div>
                <h3 className="truncate text-sm font-medium">
                  Balance : {token.balance.toFixed(2) || 'Unknown'}
                </h3>
                <p className={`mt-1 text-xs font-medium`}>
                  Mint : {token.mint.substring(0, 3)}...
                  {token.mint.slice(-3)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Value : {token.usdValue}
            </p>
          </a>
        ))}
      </BaseGridChatItem>
    </>
  );
};
