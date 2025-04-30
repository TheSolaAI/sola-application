import React from 'react';
import { UIMessage } from 'ai';
import { ToolResult } from '@/types/tool';
import { SimpleMessageChatItem } from '@/components/messages/SimpleMessageChatItem';
import UserInput from '@/components/messages/UserInput';
import { TokenAddressResultItem } from '@/components/messages/TokenAddressResultItem';
import { ShowLimitOrdersChatItem } from '@/components/messages/ShowLimitOrderChatItem';
import { AiProjects } from '@/components/messages/AiProjects';
import { LuloAssetsMessageItem } from '@/components/messages/LuloAssetsMessageItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { BubbleMapChatItem } from '@/components/messages/BubbleMapCardItem';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionCardItem';
import { generateId } from 'ai';
import { SwapTokenMessageItem } from '@/components/messages/SwapMessageItem';
import { SignedTransactionsMessageItem } from '@/components/messages/SignedTransactionsMessageItem';
import { SNSResolverMessageItem } from '@/components/messages/SNSResolverMessageItem';

export function renderMessageContent(message: UIMessage) {
  const role = message.role;
  if (message.role === 'user') {
    return <UserInput text={message.content} transcript={true} />;
  }

  if (message.parts) {
    return message.parts.map((part, partIndex) => {
      if (part.type === 'text') {
        return role === 'user' ? (
          <UserInput text={message.content} transcript={true} />
        ) : (
          <SimpleMessageChatItem key={`text-${partIndex}`} text={part.text} />
        );
      } else if (
        part.type === 'tool-invocation' &&
        part.toolInvocation.state === 'result'
      ) {
        return (
          <React.Fragment key={`tool-${message.id}-${partIndex}`}>
            {renderToolResult(
              part.toolInvocation.toolName,
              part.toolInvocation.result
            )}
          </React.Fragment>
        );
      } else if (part.type === 'step-start') {
        return (
          <div
            key={`step-start-${generateId()}`}
            className="h-px flex-grow opacity-30"
          ></div>
        );
      }
      return null;
    });
  }

  // Handle simple text messages
  return <SimpleMessageChatItem text={message.content} />;
}

export function renderToolResult(
  toolName: string,
  args: ToolResult
): React.ReactNode {
  // in the case we have a caught error in the tool and we have propagated said error to the frontEnd we display that error here
  if (!args.success) {
    return <SimpleMessageChatItem text={`Error: ${args.error}`} />;
  }
  switch (toolName) {
    case 'tokenAddressTool':
      return <TokenAddressResultItem props={args.data} />;
    case 'getLimitOrderTool':
      return <ShowLimitOrdersChatItem props={args.data} />;
    case 'trendingAiProjects':
      return <AiProjects props={args.data} />;
    case 'getLuloAssetsTool':
      return <LuloAssetsMessageItem props={args.data} />;
    case 'getTokenDataTool':
      return <TokenDataMessageItem props={args.data} />;
    case 'bubblemapTool':
      return <BubbleMapChatItem props={args.data} />;
    case 'topHoldersTool':
      return <TopHoldersMessageItem props={args.data} />;
    case 'getNFTPrice':
      return <NFTCollectionMessageItem props={args.data} />;
    case 'getTrendingNFTs':
      return <NFTCollectionMessageItem props={args.data} />;
    case 'swapTokens':
      return <SwapTokenMessageItem props={args.data} />;
    case 'resolveSnsNameTool':
      return <SNSResolverMessageItem props={args.data} />;
    case 'sign_and_send_tx':
      return <SignedTransactionsMessageItem props={args.data} />;
    default:
      return <SimpleMessageChatItem text={JSON.stringify(args.data)} />;
  }
}
