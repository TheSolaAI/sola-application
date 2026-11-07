export type AlphalineConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type AlphalineChannel =
  | 'bounties'
  | 'quests'
  | 'leaderboard'
  | 'protocol_stats'
  | 'wallet_activity'
  | (string & {});

export interface AlphalineStreamItem {
  id: string;
  channel: AlphalineChannel;
  title: string;
  protocol?: string;
  category?: string;
  rewardAmount?: number;
  rewardToken?: string;
  walletAddress?: string;
  status?: 'active' | 'completed' | 'claimed' | 'expired';
  timestamp: number;
  url?: string;
}

export interface AlphalineMetrics {
  activeCampaigns: number;
  totalVolumeUsd: number;
  totalRewardsDistributedUsd: number;
  activeParticipants: number;
  updatedAt: number;
}

export interface AlphalineWssConfig {
  url: string;
  channels: AlphalineChannel[];
  reconnect: boolean;
  maxReconnectAttempts: number;
  baseReconnectDelayMs: number;
  maxReconnectDelayMs: number;
  heartbeatIntervalMs: number;
  maxItems: number;
  allowInsecureLocalhost?: boolean;
  apiKey?: string;
}

export type AlphalineParsedMessage =
  | {
      kind: 'item';
      item: AlphalineStreamItem;
    }
  | {
      kind: 'items';
      items: AlphalineStreamItem[];
    }
  | {
      kind: 'metrics';
      metrics: AlphalineMetrics;
    }
  | {
      kind: 'pong';
      timestamp: number;
    }
  | {
      kind: 'subscribed';
      channels: AlphalineChannel[];
    }
  | {
      kind: 'error';
      message: string;
    };
