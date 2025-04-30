import React from 'react';
import { UIMessage } from 'ai';
import { ToolResult } from '@/types/tool';
import UserInput from '@/components/messages/UserInput';
import { LuloAssetsMessageItem } from '@/components/messages/LuloAssetsMessageItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';
import { generateId } from 'ai';
import { SignedTransactionsMessageItem } from '@/components/messages/SignedTransactionsMessageItem';
import { SNSResolverMessageItem } from '@/components/messages/SNSResolverMessageItem';
import { TransferTokenMessageItem } from '@/components/messages/TransferTokenMessageItem';
import { AiProjectsMessageItem } from '@/components/messages/AiProjectsMessageItem';
import { BubbleMapMessageItem } from '@/components/messages/BubbleMapMessageItem';
import { TokenAddressResultMessageItem } from '../components/messages/TokenAddressResultMessageItem';
import { ShowLimitOrdersMessageItem } from '@/components/messages/ShowLimitOrderMessageItem';
import { SimpleMessageItem } from '@/components/messages/SimpleMessageItem';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionMessageItem';
import { SwapTokenMessageItem } from '@/components/messages/SwapTokenMessageItem';

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
          <SimpleMessageItem key={`text-${partIndex}`} text={part.text} />
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
  return <SimpleMessageItem text={message.content} />;
}

export function renderToolResult(
  toolName: string,
  args: ToolResult
): React.ReactNode {
  // in the case we have a caught error in the tool and we have propagated said error to the frontEnd we display that error here
  if (!args.success) {
    return <SimpleMessageItem text={`Error: ${args.error}`} />;
  }
  switch (toolName) {
    case 'tokenAddressTool':
      return <TokenAddressResultMessageItem props={args.data} />;
    case 'getLimitOrderTool':
      return <ShowLimitOrdersMessageItem props={args.data} />;
    case 'trendingAiProjects':
      return <AiProjectsMessageItem props={args.data} />;
    case 'getLuloAssetsTool':
      return <LuloAssetsMessageItem props={args.data} />;
    case 'getTokenDataTool':
      return <TokenDataMessageItem props={args.data} />;
    case 'bubblemapTool':
      return <BubbleMapMessageItem props={args.data} />;
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
    case 'transferSol':
      return <TransferTokenMessageItem props={args.data} />;
    case 'transferSpl':
      return <TransferTokenMessageItem props={args.data} />;
    default:
      return <SimpleMessageItem text={JSON.stringify(args.data)} />;
  }
}
