'use client';
import { create } from 'zustand';
import {
  DEFAULT_PRIORITY_FEE,
  DEFAULT_PRIORITY_FEE_LEVEL,
  MAX_PRIORITY_FEE_MICRO_LAMPORTS,
  PRIORITY_FEE_PRESETS,
  PRIORITY_FEE_STORAGE_KEY,
  inferPriorityFeeLevel,
  isValidPriorityFeeLevel,
  loadPriorityFeeStateFromStorage,
  priorityFeeStore,
  resolveEffectivePriorityFee,
  savePriorityFeeStateToStorage,
  validatePriorityFee,
} from '@/utils/priorityFeeState';
import type {
  PersistedPriorityFeeState,
  PriorityFeeLevel,
  PriorityFeeState,
} from '@/utils/priorityFeeState';

export {
  DEFAULT_PRIORITY_FEE,
  DEFAULT_PRIORITY_FEE_LEVEL,
  MAX_PRIORITY_FEE_MICRO_LAMPORTS,
  PRIORITY_FEE_PRESETS,
  PRIORITY_FEE_STORAGE_KEY,
  inferPriorityFeeLevel,
  isValidPriorityFeeLevel,
  loadPriorityFeeStateFromStorage,
  priorityFeeStore,
  resolveEffectivePriorityFee,
  savePriorityFeeStateToStorage,
  validatePriorityFee,
};
export type { PersistedPriorityFeeState, PriorityFeeLevel, PriorityFeeState };

export const usePriorityFeeHandler = create<PriorityFeeState>((set) => {
  priorityFeeStore.subscribe((next) => {
    set({
      priorityFee: next.priorityFee,
      priorityFeeLevel: next.priorityFeeLevel,
    });
  });

  const base = priorityFeeStore.getState();

  return {
    priorityFee: base.priorityFee,
    priorityFeeLevel: base.priorityFeeLevel,
    getPriorityFee: () => priorityFeeStore.getState().getPriorityFee(),
    getPriorityFeeLevel: () =>
      priorityFeeStore.getState().getPriorityFeeLevel(),
    setPriorityFee: (fee: number) =>
      priorityFeeStore.getState().setPriorityFee(fee),
    setPriorityFeeLevel: (level: PriorityFeeLevel, customFee?: number) =>
      priorityFeeStore.getState().setPriorityFeeLevel(level, customFee),
    resetPriorityFee: () => priorityFeeStore.getState().resetPriorityFee(),
    hydratePriorityFee: () => priorityFeeStore.getState().hydratePriorityFee(),
    resolveTransactionPriorityFee: (overrideFee?: number | null) =>
      priorityFeeStore.getState().resolveTransactionPriorityFee(overrideFee),
  };
});

export const usePriorityFeeStore = usePriorityFeeHandler;
