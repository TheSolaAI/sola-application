import { smoothStream, streamText, Tool } from 'ai';
import {
  TOOL_HANDLER_PRIME_DIRECTIVE,
  getToolsFromToolset,
  toolhandlerModel,
  ToolsetSlug,
} from '@/config/ai';
import { cookies } from 'next/headers';
import { extractUserPrivyId } from '@/lib/server/userSession';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGeneralToolSet } from '@/tools/commonToolSet';
import { storeTextMessage, storeToolResultMessage } from '@/lib/db/db';

/**
 * Handles POST requests for chat processing with tools
 */
export async function POST(req: Request) {
  try {
    const { walletPublicKey, messages, currentRoomID, requiredToolSets } =
      await req.json();

    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('privy-token')?.value;
    if (!accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    let privyId: string;

    try {
      privyId = await extractUserPrivyId(accessToken);
    } catch (error) {
      console.error('Error validating token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    if (!privyId) {
      return NextResponse.json(
        { error: 'Failed to extract user ID from token' },
        { status: 401 }
      );
    }

    const tools = loadToolsFromToolsets(
      requiredToolSets,
      accessToken,
      walletPublicKey
    );
    const generalTools = getGeneralToolSet({
      authToken: accessToken,
      publicKey: walletPublicKey,
    }).tools;
    const result = streamText({
      model: toolhandlerModel,
      system: TOOL_HANDLER_PRIME_DIRECTIVE,
      messages,
      tools: {
        ...generalTools,
        ...tools,
      },
      toolChoice: 'auto',
      maxSteps: 8,
      experimental_telemetry: { isEnabled: true },
      experimental_transform: smoothStream(),
      onError({ error }) {
        console.error(error);
      },
      onFinish: async ({ usage, steps }) => {
        const tokensUsed = usage.totalTokens;
        const usdConsumed = (tokensUsed / 1_000_000) * 8;

        try {
          await prisma.usageRecord.create({
            data: {
              privy_id: privyId,
              tokensUsed,
              usdConsumed,
              modelName: 'gpt-4.1',
            },
          });
        } catch (err) {
          console.error('Error: logging usage:', err);
        }

        try {
          const storePromises = steps.reverse().map(async (step) => {
            const promises = [];

            if (step.toolResults) {
              const toolResults = step.toolResults;
              for (const toolResult of toolResults) {
                promises.push(
                  storeToolResultMessage(
                    toolResult,
                    currentRoomID,
                    accessToken
                  ).catch((error) =>
                    console.log('Error: while storing tool-result in DB', error)
                  )
                );
              }
            }

            if (step.text) {
              promises.push(
                storeTextMessage(step.text, currentRoomID, accessToken).catch(
                  (error) =>
                    console.log('Error: while storing text in DB', error)
                )
              );
            }
            return Promise.all(promises);
          });
          await Promise.all(storePromises);
        } catch (error) {
          console.log('Error: while storing messages in DB', error);
        }
      },
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error(
      `ERROR: Chat processing failed - ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Loads tools from specified toolsets
 */
function loadToolsFromToolsets(
  toolsets: ToolsetSlug[],
  accessToken: string,
  walletPublicKey: string
): Record<string, Tool<any, any>> {
  const allTools: Record<string, Tool<any, any>> = {};
  if (!toolsets) return allTools;

  console.log(`INFO: Loading toolsets [${toolsets.join(', ')}]`);

  for (const toolset of toolsets) {
    const toolsetTools = getToolsFromToolset(toolset, {
      authToken: accessToken,
      publicKey: walletPublicKey,
    });

    Object.assign(allTools, toolsetTools);
  }

  return allTools;
}
