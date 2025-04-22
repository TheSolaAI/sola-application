import { streamText, UIMessage } from 'ai';
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
      selectedToolset,
      message,
      previousMessages = [],
      currentRoomID,
    }: {
      walletPublicKey: string;
      selectedToolset: ToolsetSlug;
      message: UIMessage;
      previousMessages: UIMessage[];
      currentRoomID: string;
    } = await req.json();

    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('privy-token')?.value;

    console.log('Processing request with toolset:', selectedToolset);
    console.log('Chat room ID:', currentRoomID);

    // Use the provided previous messages and current message
    const allMessages = [...previousMessages, message];

    // Get tools for the selected toolset
    const tools = getToolsFromToolset(selectedToolset, {
      authToken: accessToken,
      publicKey: walletPublicKey,
    });
    console.log('Tools loaded for toolset:', selectedToolset);

    console.log('Processing with main AI model...');

    const result = streamText({
      model: toolhandlerModel,
      system: getToolHandlerPrimeDirective(walletPublicKey),
      messages: allMessages,
      tools: tools,
      toolChoice: 'required',
      maxSteps: 8,
      experimental_telemetry: {
        isEnabled: true,
      },
      onStepFinish: (stepResult) => {
        console.log('Step finished:', stepResult.text);
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
