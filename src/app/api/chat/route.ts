import { streamText, Tool, UIMessage } from 'ai';
import {
  getToolHandlerPrimeDirective,
  getToolsFromToolset,
  toolhandlerModel,
  ToolsetSlug,
} from '@/config/ai';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const {
      walletPublicKey,
      messages,
      currentRoomID,
      requiredToolSets,
    }: {
      walletPublicKey: string;
      messages: UIMessage[];
      currentRoomID: string;
      requiredToolSets: ToolsetSlug[];
    } = await req.json();

    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('privy-token')?.value;

    console.log('Processing request with toolset:', requiredToolSets);
    console.log('Chat room ID:', currentRoomID);

    let tools: Record<string, Tool<any, any>> = {};

    for (const selectedToolset of requiredToolSets) {
      console.log('Loading tools for toolset:', selectedToolset);
      const newTools = getToolsFromToolset(selectedToolset, {
        authToken: accessToken,
        publicKey: walletPublicKey,
      });

      tools = {
        ...tools,
        ...newTools,
      };

      console.log('Tools loaded for toolset:', selectedToolset);
    }

    console.log('All tools loaded:', tools);

    const result = streamText({
      model: toolhandlerModel,
      system: getToolHandlerPrimeDirective(walletPublicKey),
      messages: messages,
      tools: tools,
      toolChoice: 'required',
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
      onStepFinish: (stepResult) => {
        console.log('Step finished:', stepResult);
        // TODO: Handle sending the message to the database

        // try {

        // } catch (error) {

        // }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in route [chat]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function storeMessageInDB(
  roomId: string,
  messageJson: string,
  authToken: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://user-service.solaai.tech/api/v1/chatrooms/${roomId}/messages/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
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
  } catch (error) {
    console.error('Error storing message:', error);
    throw error;
  }
}
