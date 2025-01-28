import { create } from "zustand";

interface PipState {
  isSupported: boolean;
  pipWindow: Window | null;
  setPipWindow: (pipWindow: Window | null) => void;
  requestPipWindow: (width: number, height: number) => Promise<void>;
  closePipWindow: () => void;
}

export const usePipStore = create<PipState>((set, get) => ({
  isSupported: "documentPictureInPicture" in window,
  pipWindow: null,
  setPipWindow: (pipWindow) => set({ pipWindow }),

  requestPipWindow: async (width: number, height: number) => {
    const pipWindow = get().pipWindow;
    if (pipWindow != null) {
      return;
    }

    try {
      const pip = await (window as any).documentPictureInPicture.requestWindow({
        width,
        height,
      });

      pip.addEventListener("pagehide", () => {
        get().setPipWindow(null);
      });

      set({ pipWindow: pip });
    } catch (error) {
      console.error("Failed to request PiP window:", error);
    }
  },

  closePipWindow: () => {
    const pipWindow = get().pipWindow;
    if (pipWindow != null) {
      pipWindow.close();
      set({ pipWindow: null });
    }
  },
}));
