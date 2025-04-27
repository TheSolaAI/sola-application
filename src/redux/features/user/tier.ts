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
} = {
  userTier: null,
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
  },
});

export const { setTierVerificationResult } = tierSlice.actions;
export default tierSlice.reducer;
