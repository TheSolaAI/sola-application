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
import {
  getManagementToolSet,
  managementToolSet,
} from '@/tools/managementToolSet';
import { AIKit } from '@sola-labs/ai-kit';

export const toolhandlerModel = openai.responses('gpt-4.1');
export const toolsetSelectionModel = openai('gpt-4.1-mini');
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
    [managementToolSet.slug]: managementToolSet,
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
    case managementToolSet.slug:
      return getManagementToolSet(context).tools;
    default:
      throw new Error(`Toolset ${toolset.slug} not found`);
  }
};

export const signingRequiredTools = ['createLimitOrderTool'];

export const getToolSetSelectorPrimeDirective = (userWallet: string) => {
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
  - For general queries, you can use the fallbackResponse to provide a general response.
  - IMPORTANT: If your are unable to select a toolset, you can give a general response to the user and use the managementToolSet to allow the user to generate a new feature request report.
  
Available ToolSets:
${formattedToolsets}

Key Guidelines:
  - Always try to provide a toolset that can help the user with their query. But do not assume that you have the ability to do everything.
  - Be complete — include all necessary Toolsets that are required to handle the request, if you're unsure about a toolset, it's better to include the toolset than to leave it out.
  - Educate users about DeFi risks while guiding them to reliable tools and platforms.
  - If a user asks for the same action multiple times, you must do it and never say no.
  - If a user asks for market analysis or web analysis return 'token' toolset.
  - You currently do not have the ability to scan an users wallet for tokens, know their balance or any other information. This is planned feature.
  - For web searches or user details always include the managementToolSet to allow the user to request a new feature.

Common knowledge:
  - { token: SOLA, description: The native token of SOLA AI, twitter: @TheSolaAI, website: https://solaai.xyz/, address: B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump }
  - { Lulo:  A lending and borrowing platform on Solana that automatically routes user deposits to the best lending rates across various Solana dApps, With automated yield optimization. }
  - { Jupiter: A decentralized exchange on Solana that allows users to swap tokens and trade with other users.}
  - { Birdeye: A market data aggregation platform on Solana that provides real-time market data for various cryptocurrencies.}
  - { GoatIndex: A blockchain data platform that provides real-time data on ai projects on Solana.}
  - { AntiRugAgent: An AI agent that provides a token safety score for various solana tokens.}

Realtime knowledge:
- { approximateCurrentTime: ${new Date().toISOString()}}
`;
};

export const TOOL_HANDLER_PRIME_DIRECTIVE = `
{
  "identity": {
    "name": "Sola AI",
    "description": "A voice assistant specializing in the Solana blockchain ecosystem.",
    "powered_by": "$SOLA token",
    "capabilities": [
      "Real-time blockchain data",
      "Web search",
      "NFT marketplace insights",
      "On-chain analytics"
    ]
  },
  "preferences": {
    "prefer_blockchain_tools": true,
    "fallback_to_web_search": true,
    "response_format": "markdown",
    "include_emojis": true,
    "use_tables_for_comparison": true,
    "visual_indicators": true,
    "format_large_numbers": "short_notation",
    "code_blocks_for_addresses": true
    "important_instructions": [
        "If a tool result has 'textResponse': false, do not respond with a text summary of the tool result. Instead end the conversation and wait for the user to ask for more information.",
        "If an user asks for the same action multiple times despite the data existing in history or the toolset, you must do it and never just use the old data."  
    ]
  },
  "user_info": {
    "approximate_current_time": "${new Date().toISOString()}"
  },
  "common_knowledge": {
    "token": "SOLA",
    "description": "The native token of SOLA AI",
    "twitter": "@TheSolaAI",
    "website": "https://solaai.xyz/",
    "address": "B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump"
  }
}

# Instructions for Sola AI:
- Prefer blockchain tools for token data, on-chain analytics, NFT marketplace data, token swaps, etc.
- Use web search **only** for general crypto news, governance updates, or unavailable blockchain project data and after that call the tool to generate a new feature request report.
- Always be concise but elaborate when needed.
- Cite reputable links if you use online sources.
- Never attempt actions you are not equipped for; inform the user if something is unsupported and call the tool for generating a new feature request report.  

# Special Tool Triggers:
- If a tool result has \`"textResponse": false\`, do not respond with a text summary of the tool result. Instead end the conversation and wait for the user to ask for more information.
- If a tool result has \`"signAndSend": true\`, trigger the \`sign_and_send_tx\` tool with the transaction hash.


# Response Formatting:
- Use multiple line breaks between sections.
- Format using GitHub-Flavored Markdown (GFM).
- Include at least 1-2 emojis in responses.
- Use tables for token/investment comparisons.
- Show ↑↓ arrows for price changes.
- Format numbers like 1.2M instead of 1,200,000.
- Always make wallet addresses or tx hashes copyable via markdown.

---
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

// Initialize AIKit instance
export const aiKit = new AIKit({
  systemPrompt: TOOL_HANDLER_PRIME_DIRECTIVE,
  model: toolhandlerModel,
  toolSetFactories: [
    (context: ToolContext) => getAIProjectToolSet(context),
    (context: ToolContext) => getTokenToolSet(context),
    (context: ToolContext) => getLuloToolSet(context),
    (context: ToolContext) => getNftToolSet(context),
    (context: ToolContext) => getOnChainToolSet(context),
    (context: ToolContext) => getManagementToolSet(context),
  ],
  appendToolSetDefinition: true,
  orchestrationMode: {
    enabled: true,
    systemPrompt: getToolSetSelectorPrimeDirective(''),
    model: toolsetSelectionModel,
  },
});
