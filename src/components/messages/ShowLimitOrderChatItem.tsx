'use client';

import { FC } from 'react';
import { ShowLimitOrdersChatContent } from '@/types/chatItem';
import BaseGridChatItem from '@/components/messages/general/BaseGridChatItem';
import { tokenList } from '@/config/tokenMapping';
import { cancelLimitOrderHandler } from '@/lib/solana/limitOrderTx';
import { useWalletHandler } from '@/store/WalletHandler';
import { BorderGlowButton } from '@/app/dashboard/_components/dashboards/BorderGlowButton';

interface ShowLimitOrdersChatItemProps {
  props: ShowLimitOrdersChatContent;
}

export const ShowLimitOrdersChatItem: FC<ShowLimitOrdersChatItemProps> = ({
  props,
}) => {
  const wallet = useWalletHandler.getState().currentWallet;
  return (
    <BaseGridChatItem col={3}>
      {props.data.orders.map((order, lIndex) => {
        const inputToken = Object.values(tokenList).find(
          (v) => v.MINT === order.input_mint
        );
        const outputToken = Object.values(tokenList).find(
          (v) => v.MINT === order.output_mint
        );

        return (
          <div
            key={lIndex}
            className="bg-sec_background rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-base">
                Order ID:{' '}
                <span className="font-mono">
                  {order.order_id.slice(0, 4)}...
                  {order.order_id.slice(-5)}
                </span>
              </h3>
              <p className="text-xs font-medium text-secText">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-opacity-20 bg-primary p-2 rounded-md">
                <p className="font-medium mb-1">Input</p>
                <p className="font-mono">
                  {(
                    parseFloat(order.input_amount) /
                    Math.pow(10, inputToken?.DECIMALS || 0)
                  ).toFixed(inputToken?.DECIMALS || 0)}
                </p>
                <p className="text-secText mt-1">
                  <span className="opacity-70">Mint: </span>
                  {order.input_mint.slice(0, 3)}...
                  {order.input_mint.slice(-3)}
                </p>
              </div>

              <div className="bg-opacity-20 bg-primary p-2 rounded-md">
                <p className="font-medium mb-1">Output</p>
                <p className="font-mono">
                  {(
                    parseFloat(order.output_amount) /
                    Math.pow(10, outputToken?.DECIMALS || 0)
                  ).toFixed(outputToken?.DECIMALS || 0)}
                </p>
                <p className="text-secText mt-1">
                  <span className="opacity-70">Mint: </span>
                  {order.output_mint.slice(0, 3)}...
                  {order.output_mint.slice(-3)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <span
                className="w-full"
                onClick={() => {
                  cancelLimitOrderHandler({
                    order_id: [order.order_id],
                    public_key: wallet,
                  });
                }}
              >
                <BorderGlowButton text="Cancel Order" />
              </span>
            </div>
          </div>
        );
      })}
    </BaseGridChatItem>
  );
};
