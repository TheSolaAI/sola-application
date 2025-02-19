import { create } from 'zustand';

interface DashboardHandler {
  isOpen: boolean;
  dashboardType: string | null;
  id: string | null;

  openDashboard: (dashboardType: string, id: string) => void;
  closeDashboard: () => void;
  setDashboardType: (dashboardType: string | null) => void;
  setId: (id: string | null) => void;
}

export const useDashboardHandler = create<DashboardHandler>((set) => {
  return {
    isOpen: false,
    dashboardType: null,
    id: null,

    openDashboard: (dashboardType, id) => {
      set({ isOpen: true, dashboardType: dashboardType, id: id });
    },
    closeDashboard: () => {
      set({ isOpen: false, dashboardType: null, id: null });
    },
    setDashboardType: (dashboardType: string | null) => set({ dashboardType }),
    setId: (id: string | null) => set({ id }),
  };
});
