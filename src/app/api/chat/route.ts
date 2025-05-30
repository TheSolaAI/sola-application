import { Message, smoothStream, streamText, Tool } from 'ai';
import {
  TOOL_HANDLER_PRIME_DIRECTIVE,
  aiKit,
  toolhandlerModel,
  apiClient,
} from '@/config/ai';
import { prisma } from '@/lib/prisma';
import { getGeneralToolSet } from '@/tools/commonToolSet';
import { storeTextMessage, storeToolResultMessage } from '@/lib/db/db';
import {
  authenticateAndCheckUsage,
  createErrorResponseFromAuth,
} from '@/lib/server/authAndUsage';
import { getManagementToolSet } from '@/tools/managementToolSet';

/**
 * Handles POST requests for chat processing with tools
 */
export async function POST(req: Request) {
  try {
    const { walletPublicKey, messages, currentRoomID, requiredToolSets } =
      await req.json();

    // Use the new authentication utility
    const authResult = await authenticateAndCheckUsage(req);
    if (
      !authResult.isAuthenticated ||
      !authResult.privyId ||
      !authResult.accessToken
    ) {
      return createErrorResponseFromAuth(authResult);
    }

    const { privyId, accessToken } = authResult;

    const filteredMessages: Message[] = messages.filter(
      (message: Message, index: number, self: Message[]) => {
        // First deduplicate messages
        const isDuplicate =
          self.findIndex(
            (messageInArray: Message) =>
              messageInArray.role === message.role &&
              messageInArray.content === message.content &&
              messageInArray.createdAt === message.createdAt
          ) !== index;

        if (isDuplicate) return false;

        if (message.role === 'assistant') {
          // Check if message has parts
          if (!message.parts) return true;

          // Track if we should keep this message
          let shouldKeepMessage = true;

          message.parts.forEach((part) => {
            if (part.type === 'tool-invocation') {
              const toolInvocation = part.toolInvocation;
              // Filter out messages with incomplete tool invocations
              // We only want messages where the tool invocation is complete
              if (
                !toolInvocation ||
                !toolInvocation.toolCallId ||
                toolInvocation.state === 'call' ||
                toolInvocation.state === 'result'
              ) {
                shouldKeepMessage = false;
              }
            }
          });

          return shouldKeepMessage;
        }
        return true;
      }
    );

    console.log('filteredMessages', filteredMessages);

    const context = {
      authToken: accessToken,
      walletPublicKey: walletPublicKey,
      apiClient,
    };

    // Get tools from AIKit
    const aiKitTools = await aiKit.getTools(
      context,
      messages,
      requiredToolSets
    );
    const generalTools = getGeneralToolSet({
      authToken: accessToken,
      publicKey: walletPublicKey,
    }).tools;
    const managementTools = getManagementToolSet({
      authToken: accessToken,
      publicKey: walletPublicKey,
    }).tools;

    const tools: Record<string, Tool<any, any>> = {
      ...generalTools,
      ...managementTools,
      ...(aiKitTools === Symbol.for('NO_TOOLS_NEEDED')
        ? {}
        : (aiKitTools as Record<string, Tool<any, any>>)),
    };

    const result = streamText({
      model: toolhandlerModel,
      system: TOOL_HANDLER_PRIME_DIRECTIVE,
      messages: messages,
      tools,
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
          const storePromises = steps.map(async (step) => {
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
