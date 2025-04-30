import { GoatIndexTopAiProjectsApiResponse } from '@/types/goatIndex';
import { ToolContext, ToolResult } from '@/types/tool';
import { Tool } from 'ai';
import { z } from 'zod';

export const createTrendingAiProjectsTool = (context: ToolContext) => {
  const Parameters = z.object({
    category: z
      .enum(['mindShare', 'ranking'])
      .describe('The category to fetch the AI Projects by'),
  });

  const trendingAiProjectsTool: Tool<typeof Parameters, ToolResult> = {
    id: `aiProjects.filterTrendingAiProjectsTool` as const,
    description:
      'search and filter for various trending AI projects in solana blockchain based on mindshare or ranking',
    parameters: Parameters,
    execute: async (params) => {
      try {
        const response = await fetch(
          'https://loadbalance.goatindex.ai/api/agent/overview?dataSource=AI_INDEX'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch AI projects');
        }

        const data: GoatIndexTopAiProjectsApiResponse = await response.json();

        // Return based on category
        if (
          params.category === 'mindShare' &&
          data.data.topTokensOrderByMindShareIn6h
        ) {
          return {
            success: true,
            data: {
              category: 'mindShare',
              projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
            },
          };
        } else if (
          params.category === 'ranking' &&
          data.data.topTokensOrderByMindShareIn6h
        ) {
          return {
            success: true,
            data: {
              category: 'ranking',
              projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
            },
          };
        } else {
          throw new Error('No data available for the specified category');
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch AI projects',
        };
      }
    },
  };

  return trendingAiProjectsTool;
};
