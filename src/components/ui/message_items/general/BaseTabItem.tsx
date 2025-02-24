// types.ts
import { LucideIcon } from 'lucide-react';

export interface TabContent {
  headers: string[];
  rows: Record<string, string | number>[];
}

export interface Tab {
  id: number;
  name: string;
  icon: LucideIcon;
  content?: TabContent;
}

export interface TerminalTabsProps {
  tabs: Tab[];
  activeTabId: number;
  onTabChange?: (tabId: number) => void;
  customTabContent?: (tab: Tab) => React.ReactNode;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
}