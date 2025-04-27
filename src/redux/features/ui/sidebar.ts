import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isOpen: boolean;
  canAutoClose: boolean;
}
const initialState: SidebarState = {
  isOpen: typeof window !== 'undefined' && window.innerWidth > 768,
  canAutoClose: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = sidebarSlice.actions;

export default sidebarSlice.reducer;
