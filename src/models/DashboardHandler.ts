import { create } from 'zustand';
import { TokenDataChatContent } from '../types/chatItem';

interface DashboardHandler {
  isOpen: boolean;
  dashboardType: string | null;
  id: string | null;
  tokenData: TokenDataChatContent | null;

  openDashboard: (dashboardType: string, id: string, tokenCard?: TokenDataChatContent ) => void;
  closeDashboard: () => void;
  setDashboardType: (dashboardType: string | null) => void;
  setId: (id: string | null) => void;
}

export const useDashboardHandler = create<DashboardHandler>((set) => ({
  isOpen: false,
  dashboardType: null,
  id: null,
  tokenData: null,

  openDashboard: (dashboardType, id, tokenCard = undefined) => {
    set({ isOpen: true, dashboardType, id, tokenData: tokenCard });
  },
  closeDashboard: () => {
    set({ isOpen: false, dashboardType: null, id: null, tokenData: null });
  },
  setDashboardType: (dashboardType) => set({ dashboardType }),
  setId: (id) => set({ id }),
}));
