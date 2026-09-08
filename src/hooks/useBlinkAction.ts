'use client';

import { useCallback, useState } from 'react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

export interface BlinkActionMetadata {
  title: string;
  description?: string;
  icon?: string;
  label?: string;
  links?: { actions?: Array<{ href: string; label: string }> };
}

export interface BlinkActionState {
  status: 'loading' | 'signing' | 'success' | 'error';
  metadata: BlinkActionMetadata | null;
  signature: string | null;
  message: string | null;
  error: string | null;
}

const rpc =
  process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

function decodeBase64(encoded: string): Uint8Array {
  return Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
}

/**
 * Custom functions to load a Solana Action (Blink) and execute it
 * programmatically, enabling handsfree interaction from voice/text chat.
 */
export function useBlinkAction(actionUrl: string) {
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];

  const [state, setState] = useState<BlinkActionState>({
    status: 'loading',
    metadata: null,
    signature: null,
    message: null,
    error: null,
  });

  const loadMetadata = useCallback(async () => {
    const response = await fetch(actionUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to load blink metadata (${response.status})`);
    }
    return (await response.json()) as BlinkActionMetadata;
  }, [actionUrl]);

  const executeAction = useCallback(
    async (metadata: BlinkActionMetadata, account: string) => {
      const endpoint = metadata.links?.actions?.[0]?.href || actionUrl;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account }),
      });
      if (!response.ok) {
        throw new Error(`Blink action request failed (${response.status})`);
      }
      const data = (await response.json()) as {
        transaction?: string;
        message?: string;
      };
      if (!data.transaction) {
        throw new Error('Blink did not return a transaction.');
      }
      return { transaction: data.transaction, message: data.message || null };
    },
    [actionUrl]
  );

  const execute = useCallback(async () => {
    try {
      const metadata = await loadMetadata();
      setState((prev) => ({ ...prev, metadata }));

      if (!wallet?.address) {
        throw new Error('No Solana wallet connected.');
      }

      const { transaction, message } = await executeAction(
        metadata,
        wallet.address
      );

      setState((prev) => ({ ...prev, status: 'signing', message }));
      const parsed = VersionedTransaction.deserialize(
        decodeBase64(transaction)
      );
      const connection = new Connection(rpc, 'confirmed');
      const signature = await wallet.sendTransaction(parsed, connection);

      setState((prev) => ({
        ...prev,
        status: 'success',
        message: message || prev.message,
        signature,
        error: null,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err?.message || 'Blink execution failed.',
      }));
    }
  }, [wallet, loadMetadata, executeAction]);

  return { state, execute };
}
