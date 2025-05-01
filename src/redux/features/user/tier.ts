// src/redux/tierVerificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TierVerificationResult {
  success: boolean;
  tier: number;
  totalSolaBalance: number;
  message?: string;
}

const initialState: {
  userTier: TierVerificationResult | null;
  currentUsage: number;
  percentageUsed: number;
} = {
  userTier: null,
  currentUsage: 0,
  percentageUsed: 0,
};

export const tierSlice = createSlice({
  name: 'tier',
  initialState,
  reducers: {
    setTierVerificationResult: (
      state,
      action: PayloadAction<TierVerificationResult | null>
    ) => {
      state.userTier = action.payload;
    },
    updateCurrentUsage: (
      state,
      action: PayloadAction<{ currentUsage: number; percentageUsed: number }>
    ) => {
      if (state.userTier) {
        state.currentUsage = action.payload.currentUsage;
        state.percentageUsed = action.payload.percentageUsed;
      }
    },
  },
});

export const { setTierVerificationResult, updateCurrentUsage } =
  tierSlice.actions;
export default tierSlice.reducer;
