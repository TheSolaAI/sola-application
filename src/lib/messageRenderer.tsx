import React from 'react';
import { UIMessage, generateId } from 'ai';
import { ToolResult } from '@/types/tool';
import UserInput from '@/components/messages/UserInput';
import { LuloAssetsMessageItem } from '@/components/messages/LuloAssetsMessageItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';
import { SignedTransactionsMessageItem } from '@/components/messages/SignedTransactionsMessageItem';
import { SNSResolverMessageItem } from '@/components/messages/SNSResolverMessageItem';
import { TransferTokenMessageItem } from '@/components/messages/TransferTokenMessageItem';
import { AiProjectsMessageItem } from '@/components/messages/AiProjectsMessageItem';
import { BubbleMapMessageItem } from '@/components/messages/BubbleMapMessageItem';
import { TokenAddressResultMessageItem } from '../components/messages/TokenAddressResultMessageItem';
import { UserDetailsMessageItem } from '../components/messages/UserDetailsMessageItem';
import { ShowLimitOrdersMessageItem } from '@/components/messages/ShowLimitOrderMessageItem';
import { SimpleMessageItem } from '@/components/messages/SimpleMessageItem';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionMessageItem';
import { SwapTokenMessageItem } from '@/components/messages/SwapTokenMessageItem';
import { FeatureRequestMessageItem } from '@/components/messages/FeatureRequestMessageItem';
import { BugReportMessageItem } from '@/components/messages/BugReportMessageItem';
import { ThemeChangeMessageItem } from '@/components/messages/ThemeChangeMessageItem';
import { CreateLimitOrderMessageItem } from '@/components/messages/CreateLimitOrderMessageItem';
import { TopXStocksMessageItem } from '@/components/messages/TopXstocksMessageItem';
import { NativeStakeMessageItem } from '@/components/messages/NativeStakeMessageItem';
import { NativeUnstakeMessageItem } from '@/components/messages/NativeUnstakeMessageItem';
import { ValidatorsMessageItem } from '@/components/messages/ValidatorsMessageItem';
import { ViewStakesMessageItem } from '@/components/messages/ViewStakesMessageItem';
import { StakeStatusMessageItem } from '@/components/messages/StakeStatusMessageItem';
import { NativeWithdrawMessageItem } from '@/components/messages/NativeWithdrawMessageItem';
import { ErrorMessageItem } from '@/components/messages/ErrorMessageItem';
import { BlinksActionMessageItem } from '@/components/messages/BlinksActionMessageItem';

type ToolResultRenderer = (args: ToolResult) => React.ReactNode;

// Maps AI tool identifiers to their specialized chat message UI components.
const TOOL_RESULT_RENDERERS: Record<string, ToolResultRenderer> = {
  tokenAddress: (args) => <TokenAddressResultMessageItem props={args.data} />,
  tokenAddressTool: (args) => (
    <TokenAddressResultMessageItem props={args.data} />
  ),
  getLimitOrder: (args) => <ShowLimitOrdersMessageItem props={args.data} />,
  createLimitOrder: (args) => <CreateLimitOrderMessageItem props={args.data} />,
  trendingAiProjects: (args) => <AiProjectsMessageItem props={args.data} />,
  getLuloAssets: (args) => <LuloAssetsMessageItem props={args.data} />,
  getTokenData: (args) => <TokenDataMessageItem props={args.data} />,
  bubblemap: (args) => <BubbleMapMessageItem props={args.data} />,
  topHolders: (args) => <TopHoldersMessageItem props={args.data} />,
  getNFTPrice: (args) => <NFTCollectionMessageItem props={args.data} />,
  getTrendingNFTs: (args) => <NFTCollectionMessageItem props={args.data} />,
  swapTokens: (args) => <SwapTokenMessageItem props={args.data} />,
  getTopXStocks: (args) => <TopXStocksMessageItem props={args.data} />,
  resolveSnsNameTool: (args) => <SNSResolverMessageItem props={args.data} />,
  sign_and_send_tx: (args) => (
    <SignedTransactionsMessageItem props={args.data} />
  ),
  transferSol: (args) => <TransferTokenMessageItem props={args.data} />,
  transferSpl: (args) => <TransferTokenMessageItem props={args.data} />,
  requestFeature: (args) => <FeatureRequestMessageItem props={args.data} />,
  reportBug: (args) => <BugReportMessageItem props={args.data} />,
  changeTheme: (args) => <ThemeChangeMessageItem props={args.data} />,
  getUserInfo: (args) => <UserDetailsMessageItem props={args.data} />,
  nativeStake: (args) => <NativeStakeMessageItem props={args.data} />,
  nativeUnstake: (args) => <NativeUnstakeMessageItem props={args.data} />,
  nativeGetValidators: (args) => <ValidatorsMessageItem props={args} />,
  nativeViewStakes: (args) => <ViewStakesMessageItem props={args.data} />,
  nativeStakeStatus: (args) => <StakeStatusMessageItem props={args.data} />,
  nativeWithdraw: (args) => <NativeWithdrawMessageItem props={args.data} />,
  executeBlinkAction: (args) => <BlinksActionMessageItem props={args.data} />,
  blinksAction: (args) => <BlinksActionMessageItem props={args.data} />,
};

function renderSingleMessagePart(
  message: UIMessage,
  partInfo: { part: NonNullable<UIMessage['parts']>[number]; partIndex: number }
): React.ReactNode {
  const { part, partIndex } = partInfo;
  if (part.type === 'text') {
    return message.role === 'user' ? (
      <UserInput text={message.content} transcript={true} />
    ) : (
      <SimpleMessageItem key={`text-${partIndex}`} text={part.text} />
    );
  }
  if (
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
  }
  if (part.type === 'step-start') {
    return (
      <div
        key={`step-start-${generateId()}`}
        className="h-px flex-grow opacity-30"
      ></div>
    );
  }
  return null;
}

export function renderMessageContent(message: UIMessage) {
  if (message.role === 'user') {
    return <UserInput text={message.content} transcript={true} />;
  }

  if (message.parts) {
    return message.parts.map((part, partIndex) =>
      renderSingleMessagePart(message, { part, partIndex })
    );
  }

  return <SimpleMessageItem text={message.content} />;
}

export function renderToolResult(
  toolName: string,
  args: ToolResult | undefined
): React.ReactNode {
  if (args === undefined) {
    return;
  }

  if (!args.success) {
    return <ErrorMessageItem message={`Error: ${args.error}`} />;
  }

  const renderer = TOOL_RESULT_RENDERERS[toolName];
  if (renderer) {
    return renderer(args);
  }

  return <SimpleMessageItem text={JSON.stringify(args.data)} />;
}
