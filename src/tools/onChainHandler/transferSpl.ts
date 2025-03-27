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
    'Send SPL tokens (non-SOL tokens) to a recipient. This tool requires a valid token address. If user input contains token name/symbol and .sol domains resolve them using the available tools before using this tool.',
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: transferSplTxFunction,
  component: TransferChatItem,
  customParameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of the token to send. Must be greater than zero.',
      },
      tokenAddress: {
        type: 'string',
        description:
          'The token address (not symbol) to send. Must be a valid Solana SPL token address.',
      },
      recipientAddress: {
        type: 'string',
        description:
          'Recipient wallet address. For .sol domains, first resolve them using the other available tools',
      },
    },
    required: ['amount', 'tokenAddress', 'recipientAddress'],
  },
});

async function transferSplTxFunction(
  args: {
    amount: number;
    tokenAddress: string;
    recipientAddress: string;
  },
  response_id: string
): Promise<ToolResult<'transaction_message'>> {
  // Input validation
  if (args.amount <= 0) {
    return {
      status: 'error',
      response: 'Transfer amount must be greater than zero.',
    };
  }

  // Validate token address format
  if (args.tokenAddress.length < 32) {
    return {
      status: 'error',
      response:
        'Invalid token address. Please use the TokenAddress tool to get a valid token address from a symbol.',
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

  const senderAddress = currentWallet.address;
  const recipientAddress = args.recipientAddress;
  const tokenAddress = args.tokenAddress;
  const amount = args.amount;

  useChatMessageHandler.getState().setCurrentChatItem({
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
        tokenMint: tokenAddress,
        amount,
      }),
    });

    if (!prepareResponse.ok) {
      const errorData = await prepareResponse.json();
      console.log(errorData);
      return {
        status: 'error',
        response: `Transfer failed: Failed to prepare the transaction.`,
      };
    }

    const prepareData = await prepareResponse.json();
    const { serializedTransaction, tokenDetails } = prepareData;

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

    // Step 2: Deserialize and sign the transaction
    const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
    const transaction = Transaction.from(transactionBuffer);
    const signedTransaction = await currentWallet.signTransaction(transaction);
    const serializedSignedTransaction = Buffer.from(
      signedTransaction.serialize()
    ).toString('base64');

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
      console.log(errorData);
      return {
        status: 'error',
        response: `Transfer failed: Failed to send transaction to blockchain`,
      };
    }

    const sendData = await sendResponse.json();
    const { txid } = sendData;

    // Get token display name or symbol
    const tokenSymbol = tokenDetails?.symbol || 'Token';
    const tokenDisplay =
      tokenSymbol ||
      (tokenAddress.length > 10
        ? `${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}`
        : tokenAddress);

    // Format recipient for display
    const recipientDisplay =
      recipientAddress.length > 10
        ? `${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`
        : recipientAddress;

    // Prepare response data
    const data: TransactionChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'transaction_message',
      data: {
        title: `Transfer ${amount} ${tokenDisplay}`,
        status: 'pending',
        link: `https://solscan.io/tx/${txid}`,
        recipient: recipientDisplay,
        amount: amount,
        tokenSymbol: tokenSymbol || tokenDisplay,
        tokenAddress: tokenAddress,
        txid: txid,
      },
    };

    return {
      status: 'success',
      response: `Successfully initiated transfer of ${amount} ${tokenDisplay} to ${recipientDisplay}. The transaction has been submitted to the network and will be processed shortly.`,
      props: data,
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      status: 'error',
      response: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your token balance and try again.`,
    };
  }
}
