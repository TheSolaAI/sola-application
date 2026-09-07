import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createTokenAddressTool } from './tokenAddress';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createGetUserInfoTool } from './getUserInfo';
import { createBlinkActionTool } from './blinkAction';

export const generalToolSet: ToolSetDescription = {
  slug: 'general',
  name: 'general_tools',
  description:
    'Common tools for token address lookup, user info, and handsfree Solana Blink/Blockchain Action execution',
};

export const getGeneralToolSet = (context: ToolContext) => {
  return {
    ...generalToolSet,
    tools: {
      web_search_preview: openai.tools.webSearchPreview(),
      tokenAddressTool: createTokenAddressTool(context),
      sign_and_send_tx: {
        description:
          'Ask the user to sign the transaction and send it to blockchain',
        parameters: z.object({
          transactionHash: z
            .string()
            .describe(
              'Transaction hash to be signed and sent to the blockchain by the user'
            ),
        }),
      },
      getUserInfo: createGetUserInfoTool(),
      blinkAction: createBlinkActionTool(context),
    },
  };
};
