import { generateId, Message, smoothStream, streamText, Tool } from 'ai';
import {
  getToolHandlerPrimeDirective,
  getToolsFromToolset,
  toolhandlerModel,
  ToolsetSlug,
} from '@/config/ai';
import { cookies } from 'next/headers';
import { extractUserPrivyId } from '@/lib/server/userSession';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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
    const result = streamText({
      model: toolhandlerModel,
      system: getToolHandlerPrimeDirective(walletPublicKey),
      messages,
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
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
        ...tools,
      },
      toolChoice: 'auto',
      maxSteps: 8,
      experimental_telemetry: { isEnabled: true },
      experimental_transform: smoothStream(),
      onError({ error }) {
        console.error(error);
      },
      onFinish: async ({ text, toolResults, usage }) => {
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
        await handleStreamCompletion(
          text,
          toolResults,
          currentRoomID,
          accessToken
        );
      },
    });
    // console.log(result)
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
  console.log(`INFO: Loading toolsets [${toolsets.join(', ')}]`);

  const allTools: Record<string, Tool<any, any>> = {};

  for (const toolset of toolsets) {
    const toolsetTools = getToolsFromToolset(toolset, {
      authToken: accessToken,
      publicKey: walletPublicKey,
    });

    Object.assign(allTools, toolsetTools);
  }

  return allTools;
}

/**
 * Handles the completion of a stream, storing tool results and final text
 */
async function handleStreamCompletion(
  text: string,
  toolResults: Array<{
    toolName: string;
    toolCallId: string;
    result: any;
    args: any;
  }>,
  roomId: string,
  accessToken: string
) {
  console.log(`INFO: Stream completed with ${toolResults.length} tool results`);

  for (const toolResult of toolResults) {
    try {
      await storeToolResultMessage(toolResult, roomId, accessToken);
    } catch (error) {
      console.error(
        `ERROR: Failed to store result for ${toolResult.toolName} - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  if (text?.trim()) {
    try {
      await storeTextMessage(text, roomId, accessToken);
    } catch (error) {
      console.error(
        `ERROR: Failed to store final text message - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Creates and stores a tool result message
 */
async function storeToolResultMessage(
  toolResult: {
    toolName: string;
    toolCallId: string;
    result: any;
    args: any;
  },
  roomId: string,
  accessToken: string
) {
  const message: Message = {
    id: generateId(),
    role: 'assistant',
    content: JSON.stringify(toolResult.result),
    createdAt: new Date(),
    parts: [
      {
        type: 'tool-invocation',
        toolInvocation: {
          state: 'result',
          result: toolResult.result,
          toolName: toolResult.toolName,
          toolCallId: toolResult.toolCallId,
          args: toolResult.args,
        },
      },
    ],
  };

  await storeMessageInDB(roomId, JSON.stringify(message), accessToken);
}

/**
 * Creates and stores a text message
 */
async function storeTextMessage(
  text: string,
  roomId: string,
  accessToken: string
) {
  const message: Message = {
    id: generateId(),
    role: 'assistant',
    content: text,
    createdAt: new Date(),
    parts: [
      {
        type: 'text',
        text,
      },
    ],
  };

  await storeMessageInDB(roomId, JSON.stringify(message), accessToken);
}

/**
 * Stores a message in the database
 */
async function storeMessageInDB(
  roomId: string,
  messageJson: string,
  authToken: string
): Promise<any> {
  const response = await fetch(
    `https://user-service.solaai.tech/api/v1/chatrooms/${roomId}/messages/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        message: messageJson,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to store message: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
