import { ToolContext, ToolSet, ToolSetDescription } from '@/types/tool';
import {} from './filterTrendingAiProjectsTool';

export const xStocksToolSet: ToolSetDescription = {
  slug: 'xstocks',
  name: 'XSTOCKS',
  description:
    'Tools for providing information on the xstocks and trading them',
};

export const getAIProjectToolSet = (context: ToolContext): ToolSet => {
  return {
    ...xStocksToolSet,
    tools: {
      trendingAiProjects: createTrendingAiProjectsTool(context),
    },
  };
};
