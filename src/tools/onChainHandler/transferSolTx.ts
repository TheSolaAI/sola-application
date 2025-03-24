'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TransactionChatContent } from '@/types/chatItem';
import { TransferChatItem } from '@/components/messages/TransferMessageItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';

export const transferSolTx = registerTool({
  name: 'transferSolTx',
  description:
    'Call this function when the user wants to send SOL (Solana) to a recipient using either a wallet address or a .sol domain. Do not modify or autocorrect .sol domains, as they are arbitrary and may not have meaningful words.',
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: transferSolTxFunction,
  component: TransferChatItem,
  customParameters: {
    type: 'object',
    properties: {
      quantity: {
        type: 'number',
        description:
          'Amount of SOL (Solana) to transfer. This value should be in SOL, not lamports.',
      },
      address: {
        type: 'string',
        description: 'Recipient wallet address or a .sol domain.',
      },
    },
    required: ['quantity', 'address'],
  },
});

async function transferSolTxFunction(
  args: {
    quantity: number;
    address: string;
  },
  response_id: string
): Promise<ToolResult<'transaction_message'>> {
  const currentWallet = useWalletHandler.getState().currentWallet;

  if (currentWallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before trying to transfer.',
    };
  }

  useChatMessageHandler.getState().setCurrentMessage({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Transferring SOL...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    const senderAddress = currentWallet.address;
    const recipientAddress = args.address;
    // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = args.quantity * 1_000_000_000;

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(senderAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: lamports,
      })
    );

    const blockhashRes = await fetch('/api/wallet/blockhash');
    const { blockhash } = await blockhashRes.json();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(senderAddress);

    useChatMessageHandler.getState().setCurrentMessage({
      content: {
        type: 'loader_message',
        text: `OnChain Handler: Waiting for wallet signature...`,
        response_id: 'temp',
        sender: 'system',
      },
      id: 0,
      createdAt: new Date().toISOString(),
    });

    // Sign transaction
    const signedTransaction = await currentWallet.signTransaction(transaction);

    useChatMessageHandler.getState().setCurrentMessage({
      content: {
        type: 'loader_message',
        text: `OnChain Handler: Submitting transaction...`,
        response_id: 'temp',
        sender: 'system',
      },
      id: 0,
      createdAt: new Date().toISOString(),
    });

    // Send transaction
    const serializedTx = Buffer.from(signedTransaction.serialize()).toString(
      'base64'
    );

    // Send the transaction through the API
    const sendRes = await fetch('/api/wallet/sendTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serializedTransaction: serializedTx }),
    });

    const { txid } = await sendRes.json();

    const data: TransactionChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'transaction_message',
      data: {
        title: `Transfer ${args.quantity} SOL to ${recipientAddress}`,
        link: txid,
        status: 'success',
      },
    };

    return {
      status: 'success',
      response: `Successfully sent ${args.quantity} SOL to ${recipientAddress}`,
      props: data,
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      status: 'error',
      response: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
