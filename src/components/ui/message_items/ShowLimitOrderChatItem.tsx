import { FC } from 'react';
import { ShowLimitOrdersChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';
import { tokenList } from '../../../config/tokens/tokenMapping.ts';

interface ShowLimitOrdersChatItemProps {
  props: ShowLimitOrdersChatContent;
}

export const ShowLimitOrdersChatItem: FC<ShowLimitOrdersChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridChatItem col={3}>
      {props.data.orders.map((order, lIndex) => {
        const inputToken = Object.values(tokenList).find(
          (v) => v.MINT === order.input_mint,
        );
        const outputToken = Object.values(tokenList).find(
          (v) => v.MINT === order.output_mint,
        );

        return (
          <div key={lIndex} className="bg-sec_background rounded-lg p-4">
            <h3 className="font-medium">
              Order ID: {order.order_id.slice(0, 4)}...
              {order.order_id.slice(-5)}
            </h3>
            <p className="mt-1 text-xs font-medium">
              Created: {new Date(order.created_at).toLocaleString()}
            </p>

            <div className="mt-2 text-xs text-secText">
              <p>
                Input:{' '}
                {(
                  parseFloat(order.input_amount) /
                  Math.pow(10, inputToken?.DECIMALS || 0)
                ).toFixed(inputToken?.DECIMALS || 0)}
              </p>
              <p>
                Mint: {order.input_mint.slice(0, 3)}...
                {order.input_mint.slice(-3)}
              </p>

              <p>
                Output:{' '}
                {(
                  parseFloat(order.output_amount) /
                  Math.pow(10, outputToken?.DECIMALS || 0)
                ).toFixed(outputToken?.DECIMALS || 0)}
              </p>
              <p>
                Mint: {order.output_mint.slice(0, 3)}...
                {order.output_mint.slice(-3)}
              </p>
            </div>
          </div>
        );
      })}
    </BaseGridChatItem>
  );
};
