'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { Transaction } from '@solana/web3.js';
import { TransferChatItem } from '@/components/messages/TransferMessageItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';
import { TransactionChatContent } from '@/types/chatItem';

export const transferSpl = registerTool({
  name: 'transferSpl',
  description:
    'Call this function when the user wants to send SPL tokens (non-SOL) to an address or a .sol domain. Do not autocorrect or modify .sol domains, as they are arbitrary and may not have meaningful words.',
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: transferSplTxFunction,
  component: TransferChatItem,
  customParameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of the token to send.',
      },
      token: {
        type: 'string',
        description: 'The token that the user wants to send.',
      },
      address: {
        type: 'string',
        description: 'Recipient wallet address or .sol domain.',
      },
    },
    required: ['amount', 'token', 'address'],
  },
});

async function transferSplTxFunction(
  args: {
    amount: number;
    token: string;
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

  const senderAddress = currentWallet.address;
  const recipientAddress = args.address;
  const tokenMint = args.token;
  const amount = args.amount;

  useChatMessageHandler.getState().setCurrentMessage({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Preparing SPL transfer...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    // Step 1: Call the API to prepare the SPL transfer (creates destination ATA if needed)
    const prepareResponse = await fetch('/api/wallet/prepareSplTransfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderAddress,
        recipientAddress,
        tokenMint,
        amount,
      }),
    });

    if (!prepareResponse.ok) {
      const errorData = await prepareResponse.json();
      throw new Error(errorData.message || 'Failed to prepare SPL transfer');
    }

    const prepareData = await prepareResponse.json();
    const { serializedTransaction } = prepareData;

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

    // Step 2: Deserialize and sign the transaction
    const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const signedTransaction = await currentWallet.signTransaction(transaction);
    const serializedSignedTransaction = Buffer.from(
      signedTransaction.serialize()
    ).toString('base64');

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

    // Step 3: Send the transaction
    const sendResponse = await fetch('/api/wallet/sendTransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serializedTransaction: serializedSignedTransaction,
        options: {
          skipPreflight: true,
          maxRetries: 10,
        },
      }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(errorData.message || 'Failed to send transaction');
    }

    const sendData = await sendResponse.json();
    const { txid } = sendData;

    // Get token display name or symbol
    const tokenDisplay =
      tokenMint.length > 10 ? tokenMint.substring(0, 6) + '...' : tokenMint;
    const recipientDisplay =
      recipientAddress.length > 10
        ? recipientAddress.substring(0, 6) + '...'
        : recipientAddress;

    // Prepare response data
    const data: TransactionChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'transaction_message',
      data: {
        title: `Transfer ${amount} ${tokenDisplay} to ${recipientDisplay}`,
        link: txid,
        status: 'success',
      },
    };

    return {
      status: 'success',
      response: `Successfully sent ${amount} tokens to ${recipientAddress}`,
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
