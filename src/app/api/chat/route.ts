import {
  appendResponseMessages,
  createDataStreamResponse,
  Message,
  smoothStream,
  streamText,
  Tool,
} from 'ai';
import {
  availableTools,
  getRequiredTools,
  mainAiModel,
} from '@/lib/ai/agentsConfig';

export async function POST(req: Request) {
  try {
    const {
      aiPrompt,
      userPublicKey,
      requiredTools,
      message,
    }: {
      aiPrompt: string;
      userPublicKey: string;
      requiredTools: string[];
      message: Array<Message>;
    } = await req.json();

    const systemPrompt = [
      aiPrompt,
      `User Solana wallet public key: ${userPublicKey}`,
    ].join('\n\n');

    console.log(aiPrompt, userPublicKey, requiredTools, message, systemPrompt);

    return createDataStreamResponse({
      execute: (dataStream) => {
        if (dataStream.onError) {
          dataStream.onError((error: unknown) => {
            console.error(error);
          });
        }

        const tools = requiredTools
          ? getRequiredTools(requiredTools)
          : availableTools;

        const result = streamText({
          model: mainAiModel,
          system: systemPrompt,
          tools: tools as Record<string, Tool<any, any>>,
          experimental_toolCallStreaming: true,
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
          experimental_transform: smoothStream(),
          maxSteps: 8,
          messages: message,
          async onFinish({ response }) {
            console.log(response);
            try {
              const responseMessages = appendResponseMessages({
                messages: [{ id: '', content: '', role: 'system' }],
                responseMessages: response.messages,
              }).filter(
                (message) =>
                  message.content !== '' || (message.parts || []).length !== 0
              );

              const now = new Date();
              responseMessages.forEach((message, index) => {
                if (message.createdAt) {
                  message.createdAt = new Date(
                    message.createdAt.getTime() + index
                  );
                } else {
                  message.createdAt = new Date(now.getTime() + index);
                }
              });
              //TODO: add implementation add the message to db from here.
              //TODO: add implementation to calculate token usage.
            } catch (error) {
              console.error(error);
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        console.error(error);
        return 'An error occurred';
      },
    });
  } catch (error) {
    console.error('Error in route [chat/route]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
