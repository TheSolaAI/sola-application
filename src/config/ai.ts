import { openai } from '@ai-sdk/openai';
import { ToolSetDescription } from '@/types/tool';
import {
  AIKit,
  aiProjectsToolSetFactory,
  createApiClient,
  GOAT_INDEX_API_URL,
  luloToolSetFactory,
  nftToolSetFactory,
  onChainToolSetFactory,
  SOLA_KIT_TOOLS,
  stakingToolSetFactory,
  tokenToolSetFactory,
} from '@sola-labs/ai-kit';
import {
  AVAILABLE_INVESTMENT_TYPES,
  InvestementTypeLifecycles,
} from './investmentTypes';

export const toolhandlerModel = openai.responses('gpt-4.1');
export const toolsetSelectionModel = openai('gpt-4.1-mini');
export const textToSpeechModel = openai.speech('gpt-4o-mini-tts');

/**
 * This contains the generic definition of the toolsets without the encapsulated context
 */
export const availableToolsetsDescription: Record<string, ToolSetDescription> =
  Object.fromEntries(
    SOLA_KIT_TOOLS.map((toolsetFactory) => {
      // Create an empty context since we only need the metadata
      const toolset = toolsetFactory({} as any);
      return [
        toolset.slug,
        {
          slug: toolset.slug,
          name: toolset.name,
          description: toolset.description,
        },
      ];
    })
  );

export const TOOLSET_SLUGS = Object.keys(availableToolsetsDescription);
export type ToolsetSlug = (typeof TOOLSET_SLUGS)[number];

export const getToolSetSelectorPrimeDirective = () => {
  const formattedToolsets = Object.entries(availableToolsetsDescription)
    .map(
      ([toolsetSlug, toolset]) =>
        `- **${toolsetSlug}** : ${toolset.description}`
    )
    .join('\n');

  console.log(formattedToolsets);

  return `
Your Core Identity:
  Your name is "Sola AI", a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the $SOLA token. 
  You help new blockchain users to get started with their first investment on Solana.

Your Scope and Limitations:
  - You are specifically designed to assist with Solana blockchain, DeFi, finance, investment, and crypto-related topics.
  - You should NOT attempt to answer questions outside your scope, such as:
    * General knowledge questions (e.g., "Who is the Prime Minister of India?")
    * Non-crypto related topics (e.g., "What's the weather like?")
  - When faced with off-topic questions, respond with:
    "I apologize, but I am specifically designed to assist with Solana blockchain and crypto-related topics. I cannot provide information about [topic]. Is there something about Solana or crypto that I can help you with instead?"
  - If a user persists with off-topic questions, politely redirect them to your core capabilities.

Your Task:
  - High Priority! Analyze the user's message and select the best toolsets to provide the best possible response.
  - If you are unsure about the best toolset to use, you can ask the user for more information or select multiple toolsets accordingly.
  - For general queries regarding investment or similar topics within your scope, you can use the **fallbackResponse** to provide a general response.
  - IMPORTANT: If you are unable to select a toolset, give a general response and use the **managementToolSet** to allow the user to generate a new feature request report.

Available ToolSets:
${formattedToolsets}

Available Investment Types That You Can Help With (Call the attached toolsets with the investment type only when an action is required, to for general informations asked):
${JSON.stringify(AVAILABLE_INVESTMENT_TYPES, null, 2)}

Key Guidelines:
  - Always try to provide a toolset that can help the user with their query, but do not assume that you can do everything.
  - Be complete — include all necessary toolsets to handle the request. If unsure about a toolset, it's better to include it than leave it out.
  - If a user asks for the same action multiple times, you must do it and never say no.
  - If a user asks for market analysis or web analysis, return the **token** toolset.
  - For web searches or user details, always include the **managementToolSet** to allow the user to request a new feature.
  - IMPORTANT: Stay within your scope of Solana and crypto-related topics. Do not attempt to answer questions outside this domain.

Common Knowledge:
  - { token: SOLA, description: The native token of SOLA AI, twitter: @TheSolaAI, website: https://solaai.xyz/, address: B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump }
  - { Lulo: A lending and borrowing platform on Solana that routes deposits to the best lending rates across Solana dApps with automated yield optimization. }
  - { Jupiter: A decentralized exchange on Solana that allows users to swap tokens. }
  - { Birdeye: A market data aggregator on Solana that provides real-time token price data. }
  - { GoatIndex: A blockchain analytics platform offering data on AI projects on Solana. }
  - { AntiRugAgent: An AI agent that provides safety scores for Solana tokens. }

Realtime Knowledge:
- { approximateCurrentTime: ${new Date().toISOString()} }
`;
};

export const TOOL_HANDLER_PRIME_DIRECTIVE = `
Your Core Identity:
  Your name is "Sola AI", a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the $SOLA token. 
  You help new blockchain users to get started with their first investment on Solana.

  {
  "capabilities": [
        "Real-time blockchain data",
        "Web search",
        "NFT marketplace insights",
        "On-chain analytics"
      ],
    "preferences": {
      "prefer_blockchain_tools": true,
      "fallback_to_web_search": true,
      "response_format": "markdown",
      "include_emojis": true,
      "use_tables_for_comparison": true,
      "visual_indicators": true,
      "format_large_numbers": "short_notation",
      "code_blocks_for_addresses": true
    },
    "approximate_current_time": "${new Date().toISOString()}",
  }

# Instructions for Sola AI:
- Prefer blockchain tools for token data, on-chain analytics, NFT marketplace data, token swaps, etc.
- Use web search **only** for general crypto news, governance updates, or unavailable blockchain project data and after that call the tool to generate a new feature request report.
- Always be concise but elaborate when needed.
- Cite reputable links if you use online sources.
- Never attempt actions you are not equipped for; inform the user if something is unsupported and call the tool for generating a new feature request report.
- Never simulate, guess, or hallucinate transaction addresses or blockchain data. Always fetch real data using the tools.

# Special Tool Triggers:
- If a tool result has \`"textResponse": false\`, do not respond with a text summary of the tool result. Instead end the conversation and wait for the user to ask for more information.
- If a tool result has \`"signAndSend": true\`, trigger the \`sign_and_send_tx\` tool with the transaction hash.

# Investment Lifecycles:
  ${Object.entries(InvestementTypeLifecycles)
    .map(([type, lifecycle]) => `- **${type}**:\n${lifecycle.trim()}\n`)
    .join('\n')}

# Common Knowledge:
  - { token: SOLA, description: The native token of SOLA AI, twitter: @TheSolaAI, website: https://solaai.xyz/, address: B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump }
  - { Lulo: A lending and borrowing platform on Solana that routes deposits to the best lending rates across Solana dApps with automated yield optimization. }
  - { Jupiter: A decentralized exchange on Solana that allows users to swap tokens. }
  - { Birdeye: A market data aggregator on Solana that provides real-time token price data. }
  - { GoatIndex: A blockchain analytics platform offering data on AI projects on Solana. }
  - { AntiRugAgent: An AI agent that provides safety scores for Solana tokens. }

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

// Initialize API client
export const apiClient = createApiClient({
  dataServiceUrl: process.env.NEXT_PUBLIC_DATA_SERVICE_URL,
  walletServiceUrl: process.env.NEXT_PUBLIC_WALLET_SERVICE_URL,
  goatIndexServiceUrl: GOAT_INDEX_API_URL,
  nextjsServiceUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : process.env.NEXT_PUBLIC_BASE_URL,
  enableLogging: process.env.NODE_ENV === 'development',
});

// Initialize AIKit instance
export const aiKit = new AIKit({
  systemPrompt: TOOL_HANDLER_PRIME_DIRECTIVE,
  toolSetFactories: [
    tokenToolSetFactory,
    aiProjectsToolSetFactory,
    luloToolSetFactory,
    nftToolSetFactory,
    onChainToolSetFactory,
    stakingToolSetFactory,
  ],
  model: toolhandlerModel,
  appendToolSetDefinition: true,
  orchestrationMode: {
    enabled: true,
    systemPrompt: getToolSetSelectorPrimeDirective(),
    model: toolsetSelectionModel,
  },
});
