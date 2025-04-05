'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';

export const resolveSnsName = registerTool({
  name: 'resolveSnsName',
  description:
    'Resolve a Solana Name Service (SNS) domain (like "example.sol") to a wallet address. Use this when the user provides a .sol domain instead of a wallet address.',
  propsType: 'token_address_result',
  cost: 0.00001,
  implementation: resolveSnsNameFunction,
  component: undefined,
  customParameters: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'The .sol domain name to resolve (e.g., "example.sol").',
      },
    },
    required: ['domain'],
  },
});

async function resolveSnsNameFunction(
  args: { domain: string },
  response_id: string
): Promise<ToolResult<'token_address_result'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Resolving ${args.domain} to wallet address...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    // Validate domain input
    const domain = args.domain.trim().toLowerCase();

    // Basic client-side validation
    if (!domain.endsWith('.sol') || domain.length < 5) {
      return {
        status: 'error',
        response: `"${domain}" is not a valid .sol domain name. It should be in the format "name.sol"`,
        props: {
          type: 'token_address_result',
          response_id,
          sender: 'system',
          symbol: domain,
          tokenAddress: '',
          success: false,
          errorMessage: 'Invalid .sol domain format',
        },
      };
    }

    // Call our server-side API to resolve the domain
    const response = await fetch(
      `/api/wallet/resolve-domain?domain=${encodeURIComponent(domain)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to resolve domain');
    }

    const ownerAddress = data.address;

    return {
      status: 'success',
      response: `Successfully resolved ${domain} to wallet address: ${ownerAddress}`,
      props: {
        type: 'token_address_result',
        response_id,
        sender: 'system',
        symbol: domain,
        tokenAddress: ownerAddress,
        source: 'Solana Name Service',
        success: true,
      },
    };
  } catch (error) {
    console.error('Error resolving SNS domain:', error);

    // Handle error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isNotFound =
      errorMessage.includes('not found') ||
      errorMessage.includes('not registered');

    return {
      status: 'error',
      response: isNotFound
        ? `The domain "${args.domain}" does not exist or is not registered.`
        : `Failed to resolve domain: ${errorMessage}`,
      props: {
        type: 'token_address_result',
        response_id,
        sender: 'system',
        symbol: args.domain,
        tokenAddress: '',
        success: false,
        errorMessage: isNotFound
          ? 'Domain not found'
          : `Resolution error: ${errorMessage}`,
      },
    };
  }
}
