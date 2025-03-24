import { z } from 'zod';
import {
  GoatIndexTokenData,
  GoatIndexTopAiProjectsApiResponse,
} from '@/types/goatIndex';
import { AiProjects } from '@/components/messages/AiProjects';

export const aiProjectsTools = {
  filterTrendingAiProjects: {
    toolSlug: '🤖 AI Projects',
    isCollapsible: true,
    isExpandedByDefault: true,
    description:
      'search and filter for various trending AI projects in solana blockchain',
    parameters: z.object({
      category: z
        .enum(['mindShare', 'ranking'])
        .describe('The category to filter projects by'),
    }),
    execute: async ({ category }: { category: 'mindShare' | 'ranking' }) => {
      try {
        // In a real implementation, we would fetch from an API
        // For this example, I'm simulating an API fetch
        const response = await fetch(
          'https://loadbalance.goatindex.ai//api/agent/overview?dataSource=AI_INDEX'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch AI projects');
        }

        const data: GoatIndexTopAiProjectsApiResponse = await response.json();

        // Return based on category
        if (
          category === 'mindShare' &&
          data.data.topTokensOrderByMindShareIn6h
        ) {
          return {
            success: true,
            data: {
              category: 'mindShare',
              projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
            },
            suppressFollowUp: true,
          };
        } else if (
          category === 'ranking' &&
          data.data.topTokensOrderByMindShareIn6h
        ) {
          return {
            success: true,
            data: {
              category: 'ranking',
              projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
            },
            suppressFollowUp: true,
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
    implementation: (result: unknown) => {
      const typedResult = result as {
        success: boolean;
        data?: {
          category: 'mindShare';
          projects: GoatIndexTokenData[];
        };
        error?: string;
      };

      if (!typedResult.success || !typedResult.data) {
        return (
          <div className="relative overflow-hidden rounded-2xl bg-surface/5 p-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-destructive">
                Error: {typedResult.error || 'Failed to load AI projects'}
              </p>
            </div>
          </div>
        );
      }

      return <AiProjects props={{ data: typedResult.data.projects }} />;
    },
  },
};
