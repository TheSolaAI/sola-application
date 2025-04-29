import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createTokenAddressTool } from './tokenAddress';

export const onChainToolSet: ToolSetDescription = {
  slug: 'general',
  name: 'general_tools',
  description: 'Common tools. To get Token Address',
};

export const getOnChainToolSet = (context: ToolContext) => {
  return {
    ...onChainToolSet,
    tools: {
      tokenAddressTool: createTokenAddressTool(context),
    },
  };
};
