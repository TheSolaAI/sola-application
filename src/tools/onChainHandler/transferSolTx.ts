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
    'Send SOL (native Solana) to a recipient wallet address. This tool expects a valid Solana wallet address, not a .sol domain.',
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
          'Amount of SOL (Solana) to transfer. Must be greater than zero. This value should be in SOL, not lamports.',
      },
      recipientAddress: {
        type: 'string',
        description:
          'Recipient wallet address. Must be a valid Solana address, not a .sol domain.',
      },
    },
    required: ['quantity', 'recipientAddress'],
  },
});

async function transferSolTxFunction(
  args: {
    quantity: number;
    recipientAddress: string;
  },
  response_id: string
): Promise<ToolResult<'transaction_message'>> {
  // Input validation
  if (args.quantity <= 0) {
    return {
      status: 'error',
      response: 'Transfer amount must be greater than zero.',
    };
  }

  const currentWallet = useWalletHandler.getState().currentWallet;

  if (currentWallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before trying to transfer.',
    };
  }

  useChatMessageHandler.getState().setCurrentChatItem({
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
    const recipientAddress = args.recipientAddress;

    // Validate the recipient address is a valid public key
    try {
      new PublicKey(recipientAddress);
    } catch (err) {
      console.log(err);
      return {
        status: 'error',
        response: `Invalid recipient address: "${recipientAddress}" is not a valid Solana address.`,
      };
    }

    // Format recipient for display
    const recipientDisplay =
      recipientAddress.length > 10
        ? `${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`
        : recipientAddress;

    // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = Math.floor(args.quantity * 1_000_000_000);

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(senderAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: lamports,
      })
    );

    // Get recent blockhash
    const blockhashRes = await fetch('/api/wallet/blockhash');
    if (!blockhashRes.ok) {
      return {
        status: 'error',
        response: `Transfer failed: Failed to fetch recent blockhash. Ask the user to try again later.`,
      };
    }
    const { blockhash } = await blockhashRes.json();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(senderAddress);

    useChatMessageHandler.getState().setCurrentChatItem({
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

    useChatMessageHandler.getState().setCurrentChatItem({
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
      body: JSON.stringify({
        serializedTransaction: serializedTx,
        options: {
          skipPreflight: false,
          maxRetries: 3,
        },
      }),
    });

    if (!sendRes.ok) {
      const errorData = await sendRes.json();
      console.log(errorData);
      return {
        status: 'error',
        response: `Transfer failed: Failed to send transaction to the blockchain.`,
      };
    }

    const { txid } = await sendRes.json();

    const data: TransactionChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'transaction_message',
      data: {
        title: `Transfer ${args.quantity} SOL`,
        status: 'pending',
        link: `https://solscan.io/tx/${txid}`,
        amount: args.quantity,
        recipient: recipientDisplay,
        txid: txid,
        tokenSymbol: 'SOL',
      },
    };

    return {
      status: 'success',
      response: `Successfully initiated transfer of ${args.quantity} SOL to ${recipientDisplay}. The transaction has been submitted to the network and will be processed shortly.`,
      props: data,
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      status: 'error',
      response: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your SOL balance and try again.`,
    };
  }
}
