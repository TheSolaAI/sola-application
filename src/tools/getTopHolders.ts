import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { getTopHoldersHandler } from '../lib/solana/topHolders.ts';
import { TopHoldersChatContent } from '../types/chatItem.ts';
import { TopHoldersMessageItem } from '../components/ui/message_items/TopHoldersMessageItem.tsx';
import { TopHolder } from '../types/messageCard.ts';



export async function getTopHoldersFunction(args: {
  tokenInput: string;
}): Promise<TopHolder[]|null> {

  let token = args.tokenInput;
  let final_token = '';
  console.log(token.length);
  if (token.length > 35 || token.startsWith('$')) {
    final_token = token;
  } else {
    final_token = `$${token}`;
  }
  const response = await getTopHoldersHandler(final_token);
  if (!response) {
    return null
  }
  return response
}
