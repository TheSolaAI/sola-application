'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { getRugCheckHandler } from '@/lib/solana/rugCheck';
import { ToolResult } from '@/types/tool';

/**
 * Implementation function for the getRugCheck tool
 * Analyzes a token for potential rug pull characteristics
 */
async function getRugCheckFunction(
  args: { token_address: string },
  response_id: string
): Promise<ToolResult<'rug_check'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analyst: Analyzing token for rug pull risk...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    // Validate token address
    if (!args.token_address || args.token_address.trim().length < 32) {
      return {
        status: 'error',
        response:
          'Please provide a valid Solana token address for the rug check analysis.',
      };
    }

    // Clean up the token address (remove any $ prefix if present)
    const tokenAddress = args.token_address.startsWith('$')
      ? args.token_address.substring(1)
      : args.token_address;

    // Get rug check data
    const rugCheckData = await getRugCheckHandler(tokenAddress);

    if (!rugCheckData) {
      return {
        status: 'error',
        response:
          'Failed to perform rug check analysis. Please check the token address and try again.',
      };
    }

    // Interpret the risk score
    let riskLevel = '';
    if (rugCheckData.score >= 85) {
      riskLevel = 'Very Low Risk';
    } else if (rugCheckData.score >= 70) {
      riskLevel = 'Low Risk';
    } else if (rugCheckData.score >= 50) {
      riskLevel = 'Moderate Risk';
    } else if (rugCheckData.score >= 30) {
      riskLevel = 'High Risk';
    } else {
      riskLevel = 'Very High Risk';
    }

    return {
      status: 'success',
      response: `Rug Check Analysis for token ${tokenAddress}:\n\nRisk Score: ${rugCheckData.score}/100\nRisk Level: ${riskLevel}\n\nAnalysis: ${rugCheckData.message}`,
      props: {
        response_id,
        sender: 'system',
        type: 'rug_check',
        data: rugCheckData,
      },
    };
  } catch (error) {
    console.error('Error performing rug check:', error);
    return {
      status: 'error',
      response:
        'Failed to analyze token for rug pull risk. Please check the token address and try again.',
    };
  }
}

// Register the tool using the registry
export const rugCheck = registerTool({
  name: 'RugCheck',
  description:
    'Analyze a token for rug pull risk. This evaluates various factors like contract code, liquidity locks, ownership patterns, and trading history to determine the likelihood that a token might be a scam. Returns a risk score and detailed analysis.',
  propsType: 'rug_check',
  cost: 0.00001,
  implementation: getRugCheckFunction,
  component: undefined,
  customParameters: {
    type: 'object',
    properties: {
      token_address: {
        type: 'string',
        description:
          'The token address (contract address) to analyze for rug pull risk. Must be a valid Solana SPL token address.',
      },
    },
    required: ['token_address'],
  },
});
