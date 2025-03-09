// types.ts
import { LucideIcon } from 'lucide-react';
import { TokenDataChatContent } from '../../../types/chatItem.ts';

export interface TabContent {
  headers: string[];
  rows: Record<string, string | number>[];
}

export interface Tab {
  id: number;
  name: string;
  icon: LucideIcon;
  content?: TabContent;
  isLoading?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface TerminalTabsProps {
  tabs: Tab[];
  agentDetails: TokenDataChatContent | null;
  activeTabId: number;
  onTabChange?: (tabId: number) => void;
  customTabContent?: (tab: Tab) => React.ReactNode;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}
