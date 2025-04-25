import { configureStore } from '@reduxjs/toolkit';
import { tierSlice } from './features/user/tier';

export const store = configureStore({
  reducer: {
    tier: tierSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
