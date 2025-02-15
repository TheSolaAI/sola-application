import { Tool } from "../types/tool";


const functionDescription =
  'To get the price of on an NFT. NOTE: The user must specify the word NFT';

export const getNFTPrice: Tool = {
  implementation: getNFTPriceFunction,
  representation: {
    props_type: 'nft_price',
    component: NFTPriceChatContent,
  }

  type: 'function',
  name: 'getNFTPrice',
  description: functionDescription,
  parameters: {
    type: 'object',
    properties: {
      nft_name: {
        type: 'string',
        description: 'the name of the nft',
      },
    },
    required: ['nft_name'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getNFTPriceFunction() {}
