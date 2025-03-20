import { SimpleMessageChatItem } from '@/components/messages/SimpleMessageChatItem';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { AudioPlayerMessageItem } from '@/components/messages/AudioPlayerMessageItem';
import { InProgressMessageChatItem } from '@/components/messages/InProgressMessageChatItem';
import { LoaderMessageItem } from '@/components/messages/LoaderMessageItem';
import React from 'react';
import { CreateLimitOrderChatItem } from '@/components/messages/CreateLimitOrderMessageItem';
import { ShowLimitOrdersChatItem } from '@/components/messages/ShowLimitOrderChatItem';
import { AiProjects } from '@/components/messages/AiProjects';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionCardItem';
import { TrendingNFTMessageItem } from '@/components/messages/TrendingNFTMessageItem';
import { LuloChatItem } from '@/components/messages/LuloMessageItem';
import { TransactionDataMessageItem } from '@/components/messages/TransactionCard';
import { SwapChatItem } from '@/components/messages/SwapMessageItem';

export const messageComponentMap: Record<string, React.ComponentType<any>> = {
  simple_message: SimpleMessageChatItem,
  token_data: TokenDataMessageItem,
  create_limit_order: CreateLimitOrderChatItem,
  show_limit_order: ShowLimitOrdersChatItem,
  ai_projects_classification: AiProjects,
  nft_collection_data: NFTCollectionMessageItem,
  get_trending_nfts: TrendingNFTMessageItem,
  user_lulo_data: LuloChatItem,
  swap: SwapChatItem,
  user_audio_chat: AudioPlayerMessageItem,
  in_progress_message: InProgressMessageChatItem,
  loader_message: LoaderMessageItem,
  transaction_message: TransactionDataMessageItem,
};
