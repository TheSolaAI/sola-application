import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173');

export function createResolveSnsNameTool(context: ToolContext) {
  const Parameters = z.object({
    domain: z
      .string()
      .describe('The .sol domain name to resolve (e.g., "example.sol").'),
  });

  const resolveSnsNameTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.resolveSnsName' as const,
    description:
      'Resolve a Solana Name Service (SNS) domain (like "example.sol") to a wallet address. Use this when the user provides a .sol domain instead of a wallet address.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        // Validate domain input
        const domain = params.domain.trim().toLowerCase();

        // Basic client-side validation
        if (!domain.endsWith('.sol') || domain.length < 5) {
          return {
            success: false,
            error: `"${domain}" is not a valid .sol domain name. It should be in the format "name.sol"`,
            data: undefined,
          };
        }

        // Call our server-side API to resolve the domain
        const response = await fetch(
          `${baseUrl}/api/wallet/resolve-domain?domain=${encodeURIComponent(domain)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to resolve domain');
        }

        const ownerAddress = data.address;

        return {
          success: true,
          data: {
            type: 'token_address_result',
            symbol: domain,
            tokenAddress: ownerAddress,
            source: 'Solana Name Service',
            success: true,
            response_id: 'temp',
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
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
          success: false,
          error: isNotFound
            ? `The domain "${params.domain}" does not exist or is not registered.`
            : `Failed to resolve domain: ${errorMessage}`,
          data: undefined,
        };
      }
    },
  };

  return resolveSnsNameTool;
}
