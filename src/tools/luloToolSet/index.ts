import { ToolContext, ToolSet, ToolSetDescription } from '@/types/tool';
import { createDepositLuloTool } from './depositLulo';
import { createGetLuloAssetsTool } from './getLuloAssets';
import { createWithdrawLuloTool } from './withdrawLulo';

export const luloToolSet: ToolSetDescription = {
  slug: 'lulo',
  name: 'Lulo',
  description:
    'Tools for providing information on Lulo, a decentralized exchange on Solana. Allows users to get their lulo assets, withdraw and deposit assets. Only used if an user specifies that they want to operate on their Lulo account.',
};

export const getLuloToolSet = (context: ToolContext): ToolSet => {
  return {
    ...luloToolSet,
    tools: {
      depositLuloTool: createDepositLuloTool(context),
      getLuloAssetsTool: createGetLuloAssetsTool(context),
      withdrawLuloTool: createWithdrawLuloTool(context),
    },
  };
};
