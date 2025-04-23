import { openai } from '@ai-sdk/openai';
import { ToolContext, ToolSetDescription } from '@/types/tool';
import {
  aiProjectsToolSet,
  getAIProjectToolSet,
} from '@/tools/aiProjectsToolSet';
import { getTokenToolSet, tokenToolSet } from '@/tools/tokenToolSet';
import { getLuloToolSet, luloToolSet } from '@/tools/luloToolSet';
import { getNftToolSet, nftToolSet } from '@/tools/nftToolSet';
import { getOnChainToolSet, onChainToolSet } from '@/tools/onChainToolSet';

export const toolhandlerModel = openai('gpt-4o');
export const toolsetSelectionModel = openai('gpt-4o-mini');
export const textToSpeechModel = openai.speech('gpt-4o-mini-tts');

/**
 * This contains the generic definition of the toolsets without the encapsulated context
 */
export const availableToolsetsDescription: Record<string, ToolSetDescription> =
  {
    [aiProjectsToolSet.slug]: aiProjectsToolSet,
    [tokenToolSet.slug]: tokenToolSet,
    [luloToolSet.slug]: luloToolSet,
    [nftToolSet.slug]: nftToolSet,
    [onChainToolSet.slug]: onChainToolSet,
  };

export const TOOLSET_SLUGS = Object.keys(availableToolsetsDescription);
export type ToolsetSlug = (typeof TOOLSET_SLUGS)[number];

export const getToolsFromToolset = (
  toolsetSlug: ToolsetSlug,
  context: ToolContext
) => {
  const toolset = availableToolsetsDescription[toolsetSlug];
  switch (toolset.slug) {
    case aiProjectsToolSet.slug:
      return getAIProjectToolSet(context).tools;
    case tokenToolSet.slug:
      return getTokenToolSet(context).tools;
    case luloToolSet.slug:
      return getLuloToolSet(context).tools;
    case nftToolSet.slug:
      return getNftToolSet(context).tools;
    case onChainToolSet.slug:
      return getOnChainToolSet(context).tools;
    default:
      throw new Error(`Toolset ${toolset.slug} not found`);
  }
};

export const signingRequiredTools = ['createLimitOrderTool'];

export const getRealtimePrimeDirective = (userWallet: string) => {
  const formattedToolsets = Object.entries(availableToolsetsDescription)
    .map(
      ([toolsetSlug, toolset]) =>
        `- **${toolset.name}** (${toolsetSlug}): ${toolset.description}`
    )
    .join('\n');
  return `
Your Core Identity:
  Your name is "Sola AI", a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the $SOLA token. 

Your Task:
  - High Priority! : Analyze the user's message and select the best toolsets to provide the best possible response.
  - If you are unsure about the best toolset to use, you can ask the user for more information or select multiple toolsets accordingly.
  - If your are unable to select a toolset, you can use the fallbackResponse to provide a general response.
  - For general queries, you can use the fallbackResponse to provide a general response.
  
Available ToolSets:
${formattedToolsets}

Key Guidelines:
  - Always try to provide a toolset that can help the user with their query.    
  - Be complete — include all necessary Toolsets that are required to handle the request, if you're unsure about a toolset, it's better to include the toolset than to leave it out.
  - Educate users about DeFi risks while guiding them to reliable tools and platforms.
  - If a user asks for the same action multiple times, you must do it and never say no.

Common knowledge:
  - { token: SOLA, description: The native token of SOLA AI, twitter: @TheSolaAI, website: https://solaai.xyz/, address: B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump }
  - { Lulo:  A lending and borrowing platform on Solana that automatically routes user deposits to the best lending rates across various Solana dApps, With automated yield optimization. }
  - { Jupiter: A decentralized exchange on Solana that allows users to swap tokens and trade with other users.}
  - { Birdeye: A market data aggregation platform on Solana that provides real-time market data for various cryptocurrencies.}
  - { GoatIndex: A blockchain data platform that provides real-time data on ai projects on Solana.}
  - { AntiRugAgent: An AI agent that provides a token safety score for various solana tokens.}


User-Configured Personality:
  - User Wallet Address ${userWallet}

Realtime knowledge:
- { approximateCurrentTime: ${new Date().toISOString()}}
`;
};

export const getToolHandlerPrimeDirective = (userWalletPublicKey: string) =>
  `
Your Core Identity:
  Your name is "Sola AI", a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the $SOLA token. 
  Your role is to provide accurate, real-time information and user advice.
  If you need to perform specific tasks you don't have built in training for, you can use the available tools.

Critical Rules:
  - Be concise and elaborate only when necessary.
  - Access online sources for accuracy and cite reputable links when appropriate.
  - Do not attempt to call a tool that you have not been provided, let the user know that the requested action is not supported.

Text Response Formatting:
  - Always use multiple line breaks between sections of your response
  - Always use markdown formatting with support for GFM
  - Always try to use an emoji or two to make your responses more engaging
  - Use tables for comparing multiple tokens or investment options
  - Include visual indicators (↑↓) for price movements
  - Format large numbers in a readable way (e.g., 1.2M instead of 1,200,000)
  - Use code blocks for transaction details or addresses
  - When giving a address or transaction hash, make it copyable using markdown.

Common knowledge:
  - { token: SOLA, description: The native token of SOLA AI, twitter: @TheSolaAI, website: https://solaai.xyz/, address: B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump }

Realtime knowledge:
- { approximateCurrentTime: ${new Date().toISOString()}}

User Wallet Public Key: 
- ${userWalletPublicKey}
`;

export type AIVoice =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'coral'
  | 'echo'
  | 'sage'
  | 'shimmer'
  | 'verse';

export const AI_VOICES: AIVoice[] = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'sage',
  'shimmer',
  'verse',
];
