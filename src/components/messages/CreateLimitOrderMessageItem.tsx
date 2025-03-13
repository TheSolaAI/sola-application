'use client';

import { FC, useEffect, useState } from 'react';
import { LimitOrderChatContent } from '@/types/chatItem';

interface LimitOrderChatItemProps {
  props: LimitOrderChatContent;
}

export const CreateLimitOrderChatItem: FC<LimitOrderChatItemProps> = ({
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

  const getStatusInfo = () => {
    switch (txStatus) {
      case 'pending':
        return {
          label: '',
          color: '',
          bgColor: '',
          isLoading: true,
        };
      case 'success':
        return {
          label: 'Success',
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          icon: '✅',
          isLoading: false,
        };
      case 'failed':
        return {
          label: 'Failed',
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          icon: '❌',
          isLoading: false,
        };
    }
  };

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
  );

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Invalid time';
    }
  };

  const statusInfo = getStatusInfo();

  // Get token names without $ if they exist
  const inputToken = props.data.input_mint.startsWith('$')
    ? props.data.input_mint.substring(1)
    : props.data.input_mint.substring(0, 6) + '...';

  const outputToken = props.data.output_mint.startsWith('$')
    ? props.data.output_mint.substring(1)
    : props.data.output_mint.substring(0, 6) + '...';

  return (
    <div className="flex flex-col p-4 rounded-lg bg-sec_background text-secText w-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <img
            src="/solscan.png"
            alt="solscan"
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-medium text-lg text-primaryDark">
            Limit Order
          </span>
        </div>

        <div className="px-3 py-1 rounded-full flex items-center">
          {statusInfo.isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <span className="mr-1">{statusInfo.icon}</span>
              <span
                className={`text-sm font-medium ${
                  txStatus === 'success'
                    ? 'text-green-500'
                    : txStatus === 'failed'
                      ? 'text-red-500'
                      : 'text-bodydark2'
                }`}
              >
                {statusInfo.label}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="flex flex-col">
          <span className="text-bodydark2 text-sm">From</span>
          <span className="font-medium text-secText">
            {props.data.amount} {inputToken}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-bodydark2 text-sm">To</span>
          <span className="font-medium text-secText">{outputToken}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-bodydark2 text-sm">at</span>
          <span className="font-medium text-secText">
            {props.data.limit_price}$
          </span>
        </div>
      </div>

      <div className="text-xs text-bodydark2 mb-2">
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
        className="text-primaryDark hover:opacity-80 transition text-sm flex items-center"
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
};
