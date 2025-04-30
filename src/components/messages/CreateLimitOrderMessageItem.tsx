'use client';

import { FC, useEffect, useState } from 'react';
import { LimitOrderChatContent } from '@/types/chatItem';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { LuArrowRightLeft } from 'react-icons/lu';

interface LimitOrderChatItemProps {
  props: LimitOrderChatContent;
}

export const CreateLimitOrderMessageItem: FC<LimitOrderChatItemProps> = ({
  props,
}) => {
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed'>(
    props.status || 'pending'
  );
  const [lastChecked, setLastChecked] = useState<string>(
    new Date().toISOString()
  );
  const [isPolling, setIsPolling] = useState<boolean>(true);

  useEffect(() => {
    if (!props.txn || txStatus === 'success' || txStatus === 'failed') {
      setIsPolling(false);
      return;
    }

    let timeoutId: number;
    let attempts = 0;
    const maxAttempts = 30;
    const interval = 2000;

    const checkStatus = async () => {
      try {
        if (attempts >= maxAttempts) {
          setTxStatus('failed');
          setLastChecked(new Date().toISOString());
          setIsPolling(false);
          return;
        }

        attempts++;

        // Use the API endpoint instead of direct connection
        const response = await fetch('/api/get-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature: props.txn,
            options: {
              maxSupportedTransactionVersion: 0,
              commitment: 'confirmed',
            },
          }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          if (data.transaction) {
            if (data.error) {
              setTxStatus('failed');
              setLastChecked(new Date().toISOString());
              setIsPolling(false);
              return;
            }

            setTxStatus('success');
            setLastChecked(new Date().toISOString());
            setIsPolling(false);
            return;
          }

          // Transaction not found yet, continue polling
          setLastChecked(new Date().toISOString());
          timeoutId = window.setTimeout(checkStatus, interval);
        } else {
          // API error
          console.error('API Error:', data.message);
          setLastChecked(new Date().toISOString());
          timeoutId = window.setTimeout(checkStatus, interval);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setLastChecked(new Date().toISOString());
        timeoutId = window.setTimeout(checkStatus, interval);
      }
    };

    if (isPolling) {
      timeoutId = window.setTimeout(checkStatus, 0);
    }

    return () => {
      window.clearTimeout(timeoutId);
      setIsPolling(false);
    };
  }, [props.txn, txStatus, isPolling]);

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Invalid time';
    }
  };

  // Get token names without $ if they exist
  const inputToken = props.data.input_mint.startsWith('$')
    ? props.data.input_mint.substring(1)
    : props.data.input_mint.substring(0, 6) + '...';

  const outputToken = props.data.output_mint.startsWith('$')
    ? props.data.output_mint.substring(1)
    : props.data.output_mint.substring(0, 6) + '...';

  const statusIcon = (
    <LuArrowRightLeft
      className={
        txStatus === 'success'
          ? 'text-green-500'
          : txStatus === 'failed'
            ? 'text-red-500'
            : 'text-primary animate-spin'
      }
      size={24}
    />
  );

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-xs text-secText">
        {txStatus === 'success'
          ? `Success at ${formatTime(lastChecked)}`
          : txStatus === 'pending'
            ? `Submitted at ${formatTime(props.timestamp || new Date().toISOString())}`
            : `Last checked at ${formatTime(lastChecked)}`}
      </div>
      <a
        href={`https://solscan.io/tx/${props.txn}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 transition text-sm flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        View on Solscan
        <svg
          className="w-3 h-3 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          ></path>
        </svg>
      </a>
    </div>
  );

  return (
    <BaseStatusMessageItem
      title="Limit Order"
      status={
        txStatus === 'success'
          ? 'success'
          : txStatus === 'failed'
            ? 'error'
            : 'pending'
      }
      statusText={txStatus.charAt(0).toUpperCase() + txStatus.slice(1)}
      icon={statusIcon}
      footer={footer}
    >
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="flex flex-col">
          <span className="text-secText text-sm">From</span>
          <span className="font-medium text-textColor">
            {props.data.amount} {inputToken}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-secText text-sm">To</span>
          <span className="font-medium text-textColor">{outputToken}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-secText text-sm">at</span>
          <span className="font-medium text-textColor">
            {props.data.limit_price}$
          </span>
        </div>
      </div>
    </BaseStatusMessageItem>
  );
};
