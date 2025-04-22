import { Message, generateObject } from 'ai';
import {
  getRealtimePrimeDirective,
  TOOLSET_SLUGS,
  toolsetSelectionModel,
  ToolsetSlug,
} from '@/config/ai';
import { z } from 'zod';

const ToolsetSelectionSchema = z.object({
  selectedToolset: z.enum(TOOLSET_SLUGS as unknown as [string, ...string[]]),
  fallbackResponse: z
    .string()
    .describe(
      "response to user's general query if no toolset is required to answer the user question or request"
    )
    .optional(),
});

export async function POST(req: Request) {
  try {
    const {
      walletPublicKey,
      message,
      previousMessages = [],
    }: {
      walletPublicKey: string;
      message: Message;
      previousMessages: Message[];
    } = await req.json();

    console.log('Processing toolset selection for message:', message.content);

    // Combine previous messages with current message
    const allMessages = [...previousMessages, message];

    let selectedToolset: ToolsetSlug = 'token';
    let fallbackResponse: string | undefined;

    try {
      console.log('Selecting toolset with AI model...');

      // Create a specialized system prompt for toolset selection
      const toolsetSelectionPrompt = getRealtimePrimeDirective(walletPublicKey);

      const toolsetSelectionResult = await generateObject({
        model: toolsetSelectionModel,
        output: 'object',
        system: toolsetSelectionPrompt,
        schema: ToolsetSelectionSchema,
        messages: allMessages,
        temperature: 0.2,
      });

      selectedToolset = toolsetSelectionResult.object.selectedToolset;
      fallbackResponse = toolsetSelectionResult.object.fallbackResponse;

      if (fallbackResponse) {
        console.log(
          'Fallback response detected (no toolset required):',
          fallbackResponse
        );
        // TODO: Handle direct response generation (voice/text) without using a toolset
      }
    } catch (error) {
      console.error('Error selecting toolset with AI:', error);
      console.log('Using default toolset:', selectedToolset);
    }

    return new Response(
      JSON.stringify({
        selectedToolset,
        fallbackResponse,
        needsToolset: !fallbackResponse,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in route [get-required-toolsets]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
