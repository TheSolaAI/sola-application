import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createGetNFTPriceTool } from './getNFTPrice';
import { createGetTrendingNFTsTool } from './getTrendingNFTs';

export const nftToolSet: ToolSetDescription = {
  slug: 'nftAnalyst',
  name: 'NFT Analyst',
  description:
    'Tools for analyzing NFTs, including getting a NFTs data and the trending NFTs.',
};

export const getNftToolSet = (context: ToolContext) => {
  return {
    ...nftToolSet,
    tools: {
      getNFTPrice: createGetNFTPriceTool(context),
      getTrendingNFTs: createGetTrendingNFTsTool(context),
    },
  };
};
