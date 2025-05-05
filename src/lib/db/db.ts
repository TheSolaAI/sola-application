import { Message } from '@ai-sdk/react';
import { generateId } from 'ai';

/**
 * Creates and stores a tool result message
 */
export async function storeToolResultMessage(
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
export async function storeTextMessage(
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
export async function storeMessageInDB(
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
