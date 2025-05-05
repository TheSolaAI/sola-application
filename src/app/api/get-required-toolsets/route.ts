import {
  UIMessage,
  generateObject,
  experimental_generateSpeech as generateSpeech,
  generateId,
  Message,
} from 'ai';
import {
  getToolSetSelectorPrimeDirective,
  textToSpeechModel,
  TOOLSET_SLUGS,
  toolsetSelectionModel,
  ToolsetSlug,
} from '@/config/ai';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { extractUserPrivyId } from '@/lib/server/userSession';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasExceededUsageLimit } from '@/lib/server/userTier';

const ToolsetSelectionSchema = z.object({
  selectedToolset: z.array(
    z.enum(TOOLSET_SLUGS as unknown as [string, ...string[]])
  ),
  fallbackResponse: z
    .string()
    .describe(
      "response to user's general query if no toolset is required to answer the user question or request"
    )
    .optional(),
});

/**
 * Validates if the request is from an authorized mobile client
 * Uses a combination of mobile-client-id and mobile-api-key headers
 */
function isValidMobileClient(req: Request): boolean {
  const clientId = req.headers.get('x-mobile-client-id');
  const apiKey = req.headers.get('x-mobile-api-key');
  const expectedApiKeys: Record<string, string> = {
    'ios-app': process.env.IOS_MOBILE_API_KEY || '',
    'android-app': process.env.ANDROID_MOBILE_API_KEY || '',
  };
  if (!clientId || !apiKey || !expectedApiKeys[clientId]) {
    return false;
  }
  return timingSafeEqual(apiKey, expectedApiKeys[clientId]);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Handles POST requests for toolset selection and fallback responses
 */
export async function POST(req: Request) {
  try {
    const {
      walletPublicKey,
      message,
      previousMessages = [],
      currentRoomID,
    }: {
      walletPublicKey: string;
      message: UIMessage;
      previousMessages: UIMessage[];
      currentRoomID: string;
    } = await req.json();

    // Get auth token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('privy-token')?.value;
    if (!accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }
    let privyId: string;

    // Check if request is from a mobile client and bypass usage limits if so
    const isMobileClient = isValidMobileClient(req);

    try {
      privyId = await extractUserPrivyId(accessToken, isMobileClient);
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

    let usageLimit = { active: true };

    if (!isMobileClient && process.env.NODE_ENV === 'production') {
      usageLimit = await hasExceededUsageLimit(privyId);
      if (!usageLimit.active) {
        return NextResponse.json(
          { error: 'Usage limit exceeded', usageLimit },
          { status: 403 }
        );
      }
    }

    console.log(
      `INFO: Processing toolset selection for message in room ${currentRoomID}${isMobileClient ? ' (mobile client)' : ''}`
    );

    try {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: message.content,
        createdAt: new Date(),
        parts: [
          {
            type: 'text',
            text: message.content,
          },
        ],
      };

      storeMessageInDB(currentRoomID, JSON.stringify(userMessage), accessToken);
    } catch (error) {
      console.error(
        `ERROR: Failed to store user message - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const allMessages = [...previousMessages, message];

    let selectedToolset: ToolsetSlug[] = ['token'];
    let fallbackResponse: string | undefined;
    let audioData: string | undefined;

    try {
      const toolsetSelectionPrompt =
        getToolSetSelectorPrimeDirective(walletPublicKey);

      const toolsetSelectionResult = await generateObject({
        model: toolsetSelectionModel,
        output: 'object',
        system: toolsetSelectionPrompt,
        schema: ToolsetSelectionSchema,
        messages: allMessages,
        temperature: 0.2,
      });

      const usage = toolsetSelectionResult.usage;
      const tokensUsed = usage.totalTokens;
      const usdConsumed = (tokensUsed / 1_000_000) * 1.5;

      try {
        prisma.usageRecord.create({
          data: {
            privy_id: privyId,
            tokensUsed,
            usdConsumed,
            modelName: 'gpt-4.1-mini',
          },
        });
      } catch (err) {
        console.error('Error: logging usage:', err);
      }

      selectedToolset = toolsetSelectionResult.object.selectedToolset;
      fallbackResponse = toolsetSelectionResult.object.fallbackResponse;

      // If there's a fallback response and no toolset needed
      if (fallbackResponse && selectedToolset.length === 0) {
        console.log(`INFO: Using fallback response (no toolset required)`);

        // Generate speech for the fallback response
        try {
          const audio = await generateSpeech({
            model: textToSpeechModel,
            text: fallbackResponse,
            voice: 'sage',
            outputFormat: 'wav',
          });
          audioData = audio.audio.base64;
        } catch (speechError) {
          console.error(
            `ERROR: Speech generation failed - ${speechError instanceof Error ? speechError.message : 'Unknown error'}`
          );
          // Continue even if speech generation fails
        }

        try {
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: fallbackResponse,
            createdAt: new Date(),
            parts: [
              {
                type: 'text',
                text: fallbackResponse,
              },
            ],
          };

          storeMessageInDB(
            currentRoomID,
            JSON.stringify(assistantMessage),
            accessToken
          );
        } catch (dbError) {
          console.error(
            `ERROR: Failed to store fallback response - ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
          );
        }
      }
    } catch (error) {
      console.error(
        `ERROR: Toolset selection failed - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      console.log(`INFO: Using default toolset: ${selectedToolset}`);
    }

    return new Response(
      JSON.stringify({
        selectedToolset,
        fallbackResponse,
        audioData,
        needsToolset: !fallbackResponse,
        usageLimit,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(
      `ERROR: Request processing failed - ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return new Response('Internal Server Error', { status: 500 });
  }
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
