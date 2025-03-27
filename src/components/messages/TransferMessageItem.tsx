'use client';

import { FC, useEffect, useState } from 'react';
import { TransactionChatContent } from '@/types/chatItem';
import Image from 'next/image';

interface TransferChatItemProps {
  props: TransactionChatContent;
}

export const TransferChatItem: FC<TransferChatItemProps> = ({ props }) => {
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed'>(
    props.data.status || 'pending'
  );
  const [lastChecked, setLastChecked] = useState<string>(
    new Date().toISOString()
  );
  const [isPolling, setIsPolling] = useState<boolean>(true);

  // Extract transaction ID from link
  const txid =
    props.data.txid ||
    (props.data.link?.includes('/tx/')
      ? props.data.link.split('/tx/').pop()
      : props.data.link);

  useEffect(() => {
    if (!txid || txStatus === 'success' || txStatus === 'failed') {
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
        const response = await fetch('/api/wallet/getTransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature: txid,
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
    };
  }, [txid, txStatus, isPolling]);

  // Format time in a readable way
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Get appropriate status indicator elements
  const getStatusIndicator = () => {
    switch (txStatus) {
      case 'pending':
        return (
          <div className="flex items-center space-x-1.5">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-primary">Pending</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-1.5">
            <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-500">Success</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1.5">
            <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L7 7M1 7L7 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-red-500">Failed</span>
          </div>
        );
    }
  };

  return (
    <div className="flex my-3 justify-start max-w-[100%] md:max-w-[80%]">
      <div className="w-full overflow-hidden rounded-xl border border-border shadow-sm bg-sec_background">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-surface/20">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <Image
                src="/solscan.png"
                alt="Solscan"
                width={20}
                height={20}
                className="rounded-sm"
              />
            </div>
            <span className="font-semibold text-base text-textColor">
              {props.data.title || 'Token Transfer'}
            </span>
          </div>
          {getStatusIndicator()}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Transaction details */}
          <div className="space-y-3">
            {props.data.amount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-secText">Amount</span>
                <span className="font-medium text-textColor">
                  {props.data.amount} {props.data.tokenSymbol || 'SOL'}
                </span>
              </div>
            )}

            {props.data.recipient && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-secText">Recipient</span>
                <span className="font-mono text-xs text-textColor truncate max-w-[200px]">
                  {props.data.recipient}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-secText">Status</span>
              <span className="text-xs text-secText">
                {txStatus === 'success'
                  ? `Confirmed at ${formatTime(lastChecked)}`
                  : txStatus === 'pending'
                    ? `Processing since ${formatTime(props.data.timestamp || new Date().toISOString())}`
                    : `Failed at ${formatTime(lastChecked)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface/10 border-t border-border">
          <a
            href={props.data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            View on Solscan
            <svg
              className="w-3.5 h-3.5 ml-1.5"
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
      </div>
    </div>
  );
};
