import { create } from 'zustand';

interface DashboardHandler {
  isOpen: boolean;
  dashboardType: string | null;
  id: string | null;

  setIsOpen: (isOpen: boolean) => void;
  setDashboardType: (dashboardType: string | null) => void;
  setId: (id: string | null) => void;
}

export const useDashboardHandler = create<DashboardHandler>((set) => {
  return {
    isOpen: false,
    dashboardType: null,
    id: null,

    setIsOpen: (isOpen: boolean) => set({ isOpen }),
    setDashboardType: (dashboardType: string | null) => set({ dashboardType }),
    setId: (id: string | null) => set({ id }),
  };
});
