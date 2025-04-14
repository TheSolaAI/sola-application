import { Message, generateText } from 'ai';
import {
  getToolHandlerPrimeDirective,
  getToolsFromToolset,
  toolhandlerModel,
  ToolsetSlug,
} from '@/config/ai';
import { API_URLS } from '@/config/api_urls';
import {
  ChatMessageResponseWrapper,
  ChatMessagesResponse,
} from '@/types/response';

export async function POST(req: Request) {
  try {
    const {
      walletPublicKey,
      requiredToolSet,
      message,
      currentRoomID,
    }: {
      walletPublicKey: string;
      requiredToolSet: ToolsetSlug;
      message: Message;
      currentRoomID: string;
    } = await req.json();

    // Fetch previous messages
    const previousMessagesResponse = await fetch(
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL +
        API_URLS.CHAT_ROOMS +
        currentRoomID +
        '/messages/?limit=6',
      {
        headers: {
          Authorization: req.headers.get('authorization') || '',
        },
      }
    );
    const previousMessages: ChatMessagesResponse =
      await previousMessagesResponse.json();

    // Get tools for the specific toolset
    const tools = getToolsFromToolset(requiredToolSet, {
      authToken: req.headers.get('authorization')?.replace('Bearer ', '') || '',
      publicKey: walletPublicKey,
    });

    const parsedPreviousMessages = previousMessages.results
      .map((msg) => chatItemToMessage(msg))
      .filter((msg): msg is Message => msg !== null);
    console.log(parsedPreviousMessages);

    const messageAlreadyExists = parsedPreviousMessages.some(
      (msg) => msg.id === message.id
    );

    const allMessages = messageAlreadyExists
      ? parsedPreviousMessages
      : [...parsedPreviousMessages, message];

    const response = await generateText({
      model: toolhandlerModel,
      system: getToolHandlerPrimeDirective(walletPublicKey),
      messages: allMessages,
      tools: tools,
      toolChoice: 'required',
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });
    console.log(response);
    // return tool call data
    return new Response(JSON.stringify(response.toolResults), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in route [chat/route]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Duplicated Function for server side processing
 */
const chatItemToMessage = (
  item: ChatMessageResponseWrapper
): Message | null => {
  try {
    // Parse the JSON string
    const parsedContent = JSON.parse(item.message);
    return parsedContent as Message;
  } catch (error) {
    console.error('Error parsing chat item content:', error);
    return null;
  }
};
