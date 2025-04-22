import { Message, streamText } from 'ai';
import {
  getToolHandlerPrimeDirective,
  getToolsFromToolset,
  toolhandlerModel,
  ToolsetSlug,
} from '@/config/ai';

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
      message: Message;
      previousMessages: Message[];
      currentRoomID: string;
    } = await req.json();

    console.log('Processing request with toolset:', selectedToolset);
    console.log('Chat room ID:', currentRoomID);

    // Use the provided previous messages and current message
    const allMessages = [...previousMessages, message];

    // Get tools for the selected toolset
    const tools = getToolsFromToolset(selectedToolset, {
      authToken: req.headers.get('authorization')?.replace('Bearer ', '') || '',
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
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in route [chat]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
