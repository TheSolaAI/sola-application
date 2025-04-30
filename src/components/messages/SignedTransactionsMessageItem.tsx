'use client';

import { FC, useState, useEffect } from 'react';
import {
  LuCheck,
  LuX,
  LuLoader,
  LuExternalLink,
  LuRefreshCw,
  LuCopy,
} from 'react-icons/lu';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import { toast } from 'sonner';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';

export interface TransactionRenderResult {
  transactionDetails: TransactionResponse;
  inputArgs: Record<string, any>;
}

export interface TransactionResponse {
  status: string;
  txid: string;
  message: string;
}

interface SignedTransactionsMessageItemProps {
  props: TransactionRenderResult;
}

export const SignedTransactionsMessageItem: FC<
  SignedTransactionsMessageItemProps
> = ({ props }) => {
  const [transactionStatus, setTransactionStatus] = useState<
    'pending' | 'success' | 'error'
  >(
    props.transactionDetails.status === 'success'
      ? 'success'
      : props.transactionDetails.status === 'error'
        ? 'error'
        : 'pending'
  );
  const [pollingCount, setPollingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactionInfo, setTransactionInfo] = useState<any>(null);
  const [activeArgIndex, setActiveArgIndex] = useState(-1);

  const checkTransaction = async () => {
    if (pollingCount >= 10 || transactionStatus !== 'pending') return;

    setLoading(true);
    try {
      const response = await fetch('/api/getTransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: props.transactionDetails.txid,
          options: {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
          },
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTransactionInfo(data.transaction);
        if (!data.error) {
          setTransactionStatus('success');
        } else if (data.error) {
          setTransactionStatus('error');
        }
      }
    } catch (error) {
      console.error('Error checking transaction:', error);
    } finally {
      setLoading(false);
      setPollingCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // Initial loading effect
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-check transaction status
    if (transactionStatus === 'pending') {
      const interval = setInterval(() => {
        if (pollingCount < 10) {
          checkTransaction();
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [transactionStatus, pollingCount]);

  useEffect(() => {
    // Auto-rotate focus through argument items
    if (
      !loading &&
      props.inputArgs &&
      Object.keys(props.inputArgs).length > 0
    ) {
      const interval = setInterval(() => {
        setActiveArgIndex(
          (prev) => (prev + 1) % Object.keys(props.inputArgs).length
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading, props.inputArgs]);

  // Format transaction arguments for display
  const formatArgs = (args: Record<string, any>) => {
    return Object.entries(args).map(([key, value]) => {
      // Handle different value types
      let formattedValue = value;
      let displayValue = value;

      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value, null, 2);
        displayValue = Array.isArray(value)
          ? `Array[${value.length}]`
          : '{...}';
      } else if (typeof value === 'string' && value.length > 30) {
        displayValue = `${value.substring(0, 15)}...${value.substring(
          value.length - 5
        )}`;
      }

      return { key, value: formattedValue, displayValue };
    });
  };

  const formattedArgs = formatArgs(props.inputArgs);

  // Copy transaction ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const statusIcon =
    transactionStatus === 'success' ? (
      <LuCheck className="text-green-500" size={24} />
    ) : transactionStatus === 'error' ? (
      <LuX className="text-red-500" size={24} />
    ) : (
      <LuLoader className="text-primary animate-spin" size={24} />
    );

  const statusText =
    transactionStatus === 'pending' && pollingCount > 0 ? (
      <span className="flex items-center gap-1">
        <LuRefreshCw className="animate-spin" size={10} />
        Checking {pollingCount}/10
      </span>
    ) : (
      transactionStatus.charAt(0).toUpperCase() + transactionStatus.slice(1)
    );

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-xs text-secText">
        {transactionStatus === 'pending'
          ? 'Transaction is being processed on the Solana blockchain'
          : transactionStatus === 'success'
            ? 'Transaction successfully confirmed on the Solana blockchain'
            : 'Transaction failed on the Solana blockchain'}
      </div>
      <div className="flex items-center gap-2">
        {transactionStatus === 'success' && (
          <div className="flex items-center text-green-500 text-xs">
            <LuCheck size={12} className="mr-1" /> Verified
          </div>
        )}
        <a
          href={`https://solscan.io/tx/${props.transactionDetails.txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition text-sm flex items-center"
        >
          Explorer
          <LuExternalLink className="ml-1" size={14} />
        </a>
      </div>
    </div>
  );

  return (
    <BaseStatusMessageItem
      title={`Transaction ${
        transactionStatus === 'success'
          ? 'Confirmed'
          : transactionStatus === 'error'
            ? 'Failed'
            : 'Pending'
      }`}
      status={
        transactionStatus === 'error'
          ? 'error'
          : transactionStatus === 'success'
            ? 'success'
            : 'pending'
      }
      statusText={statusText}
      icon={statusIcon}
      footer={footer}
    >
      <MaskedRevealLoader isLoading={loading}>
        {/* Transaction ID and Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1 md:col-span-2 bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg group">
            <p className="text-secText text-sm">Transaction ID</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-textColor font-mono text-sm truncate">
                {props.transactionDetails.txid}
              </p>
              <button
                onClick={() => copyToClipboard(props.transactionDetails.txid)}
                className="p-1 rounded-full hover:bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy to clipboard"
              >
                <LuCopy className="text-secText" size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <a
                href={`https://solscan.io/tx/${props.transactionDetails.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 transition flex items-center gap-1"
              >
                View on Solscan <LuExternalLink size={10} />
              </a>
              {transactionStatus === 'pending' && (
                <button
                  onClick={() => checkTransaction()}
                  disabled={loading}
                  className="text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded text-primary transition-colors ml-2"
                >
                  <LuRefreshCw
                    className={loading ? 'animate-spin' : ''}
                    size={10}
                  />
                  Refresh Status
                </button>
              )}
            </div>
          </div>

          <div
            className={`bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg ${
              transactionStatus === 'success'
                ? 'bg-green-500/5 border border-green-500/20'
                : transactionStatus === 'error'
                  ? 'bg-red-500/5 border border-red-500/20'
                  : 'bg-yellow-500/5 border border-yellow-500/20'
            }`}
          >
            <p className="text-secText text-sm">Status</p>
            <p
              className={`text-xl font-bold ${
                transactionStatus === 'success'
                  ? 'text-green-500'
                  : transactionStatus === 'error'
                    ? 'text-red-500'
                    : 'text-yellow-500'
              }`}
            >
              {transactionStatus === 'success'
                ? 'Confirmed'
                : transactionStatus === 'error'
                  ? 'Failed'
                  : 'Pending'}
            </p>
            {props.transactionDetails.message && (
              <p
                className="text-xs mt-2 text-secText truncate"
                title={props.transactionDetails.message}
              >
                {props.transactionDetails.message}
              </p>
            )}
          </div>
        </div>

        {/* Transaction Details (if available) */}
        {transactionInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {transactionInfo.blockTime && (
              <div className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
                <p className="text-secText text-sm">Block Time</p>
                <p className="text-textColor text-lg font-bold">
                  {new Date(transactionInfo.blockTime * 1000).toLocaleString()}
                </p>
              </div>
            )}
            {transactionInfo.slot && (
              <div className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
                <p className="text-secText text-sm">Slot</p>
                <p className="text-textColor text-lg font-bold">
                  {transactionInfo.slot.toLocaleString()}
                </p>
              </div>
            )}
            <div className="bg-background rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:bg-surface">
              <p className="text-secText text-sm">Network</p>
              <p className="text-textColor text-lg font-bold">Solana</p>
            </div>
          </div>
        )}

        {/* Transaction Arguments */}
        {formattedArgs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-textColor mb-3">
              Transaction Arguments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formattedArgs.map((arg, index) => (
                <a
                  key={index}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(arg.value);
                    toast.success('Copied to clipboard');
                  }}
                  className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 
                            ${activeArgIndex === index ? 'bg-primary/10 ring-1 ring-primary' : 'bg-background hover:bg-surface'}`}
                  onMouseEnter={() => setActiveArgIndex(index)}
                >
                  <div>
                    <h3 className="text-base font-medium text-textColor group-hover:text-primary transition-colors">
                      {arg.key}
                    </h3>
                    <p className="text-sm text-secText mt-1 break-all">
                      {typeof arg.displayValue === 'string'
                        ? arg.displayValue
                        : JSON.stringify(arg.displayValue)}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-end items-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <LuCopy className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Animated highlight line */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-transform duration-300 
                                  ${activeArgIndex === index ? 'w-full scale-x-100' : 'w-0 scale-x-0'}`}
                  ></div>
                </a>
              ))}
            </div>
          </div>
        )}
      </MaskedRevealLoader>
    </BaseStatusMessageItem>
  );
};
