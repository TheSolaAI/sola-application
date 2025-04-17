import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createSwapTokensTool } from './swapTokens';
import { createTransferSolTool } from './transferSolTx';
import { createTransferSplTool } from './transferSpl';
import { createResolveSnsNameTool } from './resolveSnsName';

export const onChainToolSet: ToolSetDescription = {
  slug: 'onChain',
  name: 'OnChain',
  description:
    'Tools for on-chain actions. Includes swapping tokens, transferring tokens etc.',
};

export const getOnChainToolSet = (context: ToolContext) => {
  return {
    ...onChainToolSet,
    tools: {
      swapTokens: createSwapTokensTool(context),
      transferSol: createTransferSolTool(context),
      transferSpl: createTransferSplTool(context),
      resolveSnsNameTool: createResolveSnsNameTool(context),
    },
  };
};
