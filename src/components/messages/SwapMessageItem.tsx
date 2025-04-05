'use client';

import { FC, useEffect, useState } from 'react';
import { SwapChatContent } from '@/types/chatItem';
import Image from 'next/image';

interface SwapChatItemProps {
  props: SwapChatContent;
}

export const SwapChatItem: FC<SwapChatItemProps> = ({ props }) => {
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed'>(
    props.status || 'pending'
  );
  const [lastChecked, setLastChecked] = useState<string>(
    new Date().toISOString()
  );
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

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
          setErrorDetails('Transaction timed out after multiple attempts');
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
              setErrorDetails(data.error || 'Transaction failed');
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
          // Don't fail immediately on API error, retry
          setLastChecked(new Date().toISOString());
          timeoutId = window.setTimeout(checkStatus, interval);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        // Don't fail immediately on network error, retry
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
  }, [props.txn, txStatus, isPolling]);

  const getStatusInfo = () => {
    switch (txStatus) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
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
      console.log(e);
      return 'Invalid time';
    }
  };

  const statusInfo = getStatusInfo();

  // Format token names for better display
  const getTokenDisplay = (mintAddress: string) => {
    if (mintAddress.startsWith('$')) {
      return mintAddress.substring(1); // Remove $ prefix for symbols
    }
    // For addresses, show abbreviated version
    return mintAddress.length > 12
      ? `${mintAddress.substring(0, 6)}...${mintAddress.substring(mintAddress.length - 4)}`
      : mintAddress;
  };

  // Get token names without $ if they exist
  const inputToken = getTokenDisplay(props.data.input_mint);
  const outputToken = getTokenDisplay(props.data.output_mint);

  return (
    <div className="flex my-1 justify-start max-w-[100%] md:max-w-[80%]">
      <div className="flex flex-col p-4 rounded-lg bg-sec_background text-secText w-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/solscan.png"
              alt="solscan"
              className="rounded-lg"
              height={32}
              width={32}
            />
            <span className="font-medium text-lg text-primaryDark">
              Token Swap
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full flex items-center ${
              txStatus === 'success'
                ? 'bg-green-100'
                : txStatus === 'failed'
                  ? 'bg-red-100'
                  : 'bg-yellow-50'
            }`}
          >
            {statusInfo.isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner />
                <span className="ml-2 text-sm font-medium text-yellow-600">
                  {statusInfo.label}
                </span>
              </div>
            ) : (
              <>
                <span className="mr-1">{statusInfo.icon}</span>
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">From</span>
            <span className="font-medium text-secText">
              {props.data.amount} {inputToken}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">To</span>
            <span className="font-medium text-secText">
              {props.data.output_amount} {outputToken}
            </span>
          </div>
        </div>

        {txStatus === 'failed' && errorDetails && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
            {errorDetails}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-2">
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
    </div>
  );
};
