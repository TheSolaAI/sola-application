import { ToolContext, ToolSet, ToolSetDescription } from '@/types/tool';
import { createTrendingAiProjectsTool } from './filterTrendingAiProjectsTool';

export const aiProjectsToolSet: ToolSetDescription = {
  slug: 'aiProjects',
  name: 'AI Projects',
  description:
    'Tools for providing information on the top AI projects and any AI project in general in the Solana Block chain ecosystem',
};

export const getAIProjectToolSet = (context: ToolContext): ToolSet => {
  return {
    ...aiProjectsToolSet,
    tools: {
      trendingAiProjects: createTrendingAiProjectsTool(context),
    },
  };
};
