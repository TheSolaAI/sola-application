import { ToolContext, ToolSet, ToolSetDescription } from '@/types/tool';
import { createGetTokenDataTool } from './getTokenData';
import { createLimitOrderTool } from './limitOrder';
import { createGetLimitOrderTool } from './getLimitOrder';
import { createBubblemapTool } from './bubblemaps';
import { createTokenAddressTool } from './tokenAddress';
import { create } from 'domain';
import { createTopHoldersTool } from './topHolders';

export const tokenToolSet: ToolSetDescription = {
  slug: 'token',
  name: 'Crypto Tokens',
  description:
    'Tools for providing information on crypto tokens inside the Solana Block chain ecosystem, for placing limitOrders and getting information on placed limitOrders',
};

export const getTokenToolSet = (context: ToolContext): ToolSet => {
  return {
    ...tokenToolSet,
    tools: {
      getTokenDataTool: createGetTokenDataTool(context),
      createLimitOrderTool: createLimitOrderTool(context),
      getLimitOrderTool: createGetLimitOrderTool(context),
      bubblemapTool: createBubblemapTool(context),
      tokenAddressTool: createTokenAddressTool(context),
      topHoldersTool: createTopHoldersTool(context),
    },
  };
};
