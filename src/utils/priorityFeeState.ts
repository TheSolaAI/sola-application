export type PriorityFeeLevel = 'low' | 'medium' | 'high' | 'custom';

export const PRIORITY_FEE_PRESETS: Record<
  Exclude<PriorityFeeLevel, 'custom'>,
  number
> = {
  low: 10_000,
  medium: 50_000,
  high: 100_000,
};

export const DEFAULT_PRIORITY_FEE_LEVEL: PriorityFeeLevel = 'medium';
export const DEFAULT_PRIORITY_FEE: number =
  PRIORITY_FEE_PRESETS[DEFAULT_PRIORITY_FEE_LEVEL];
export const MAX_PRIORITY_FEE_MICRO_LAMPORTS = 10_000_000;
export const PRIORITY_FEE_STORAGE_KEY = 'sola_priority_fee_state';

export interface PersistedPriorityFeeState {
  priorityFee: number;
  priorityFeeLevel: PriorityFeeLevel;
}

export interface PriorityFeeState extends PersistedPriorityFeeState {
  getPriorityFee: () => number;
  getPriorityFeeLevel: () => PriorityFeeLevel;
  setPriorityFee: (fee: number) => number;
  setPriorityFeeLevel: (level: PriorityFeeLevel, customFee?: number) => number;
  resetPriorityFee: () => void;
  hydratePriorityFee: () => void;
  resolveTransactionPriorityFee: (overrideFee?: number | null) => number;
}

export type PriorityFeeListener = (state: PriorityFeeState) => void;

export interface PriorityFeeStore {
  getState: () => PriorityFeeState;
  setState: (partial: Partial<PersistedPriorityFeeState>) => void;
  subscribe: (listener: PriorityFeeListener) => () => void;
}

/**
 * Validates and normalizes a priority fee value in micro-lamports.
 * Throws a RangeError if the provided value is not a finite non-negative number.
 */
export function validatePriorityFee(fee: unknown): number {
  if (typeof fee !== 'number' || !Number.isFinite(fee) || fee < 0) {
    throw new RangeError(
      'Priority fee must be a finite non-negative number in micro-lamports'
    );
  }
  const normalized = Math.floor(fee);
  return Math.min(normalized, MAX_PRIORITY_FEE_MICRO_LAMPORTS);
}

/**
 * Checks whether a value is a valid PriorityFeeLevel.
 */
export function isValidPriorityFeeLevel(
  level: unknown
): level is PriorityFeeLevel {
  return (
    level === 'low' ||
    level === 'medium' ||
    level === 'high' ||
    level === 'custom'
  );
}

/**
 * Infers the matching preset level for a micro-lamport fee, or 'custom'.
 */
export function inferPriorityFeeLevel(fee: number): PriorityFeeLevel {
  if (fee === PRIORITY_FEE_PRESETS.low) return 'low';
  if (fee === PRIORITY_FEE_PRESETS.medium) return 'medium';
  if (fee === PRIORITY_FEE_PRESETS.high) return 'high';
  return 'custom';
}

function getStorage(): Storage | null {
  try {
    if (
      typeof globalThis !== 'undefined' &&
      'localStorage' in globalThis &&
      globalThis.localStorage
    ) {
      return globalThis.localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted/SSR environments
  }
  return null;
}

export function loadPriorityFeeStateFromStorage(): PersistedPriorityFeeState {
  const storage = getStorage();
  if (!storage) {
    return {
      priorityFee: DEFAULT_PRIORITY_FEE,
      priorityFeeLevel: DEFAULT_PRIORITY_FEE_LEVEL,
    };
  }

  try {
    const raw = storage.getItem(PRIORITY_FEE_STORAGE_KEY);
    if (!raw) {
      return {
        priorityFee: DEFAULT_PRIORITY_FEE,
        priorityFeeLevel: DEFAULT_PRIORITY_FEE_LEVEL,
      };
    }

    const parsed = JSON.parse(raw) as Partial<PersistedPriorityFeeState>;
    const level: PriorityFeeLevel = isValidPriorityFeeLevel(
      parsed.priorityFeeLevel
    )
      ? parsed.priorityFeeLevel
      : DEFAULT_PRIORITY_FEE_LEVEL;

    if (
      typeof parsed.priorityFee === 'number' &&
      Number.isFinite(parsed.priorityFee) &&
      parsed.priorityFee >= 0
    ) {
      const validatedFee = validatePriorityFee(parsed.priorityFee);
      return {
        priorityFee: validatedFee,
        priorityFeeLevel: level,
      };
    }

    if (level !== 'custom') {
      return {
        priorityFee: PRIORITY_FEE_PRESETS[level],
        priorityFeeLevel: level,
      };
    }
  } catch {
    // Fall back to default state on malformed JSON
  }

  return {
    priorityFee: DEFAULT_PRIORITY_FEE,
    priorityFeeLevel: DEFAULT_PRIORITY_FEE_LEVEL,
  };
}

export function savePriorityFeeStateToStorage(
  state: PersistedPriorityFeeState
): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(PRIORITY_FEE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or storage write errors
  }
}

export function createPriorityFeeStore(): PriorityFeeStore {
  const listeners = new Set<PriorityFeeListener>();
  const initial = loadPriorityFeeStateFromStorage();

  const notify = () => {
    for (const listener of listeners) {
      listener(state);
    }
  };

  const state: PriorityFeeState = {
    priorityFee: initial.priorityFee,
    priorityFeeLevel: initial.priorityFeeLevel,

    getPriorityFee: () => state.priorityFee,

    getPriorityFeeLevel: () => state.priorityFeeLevel,

    setPriorityFee: (fee: number): number => {
      const validatedFee = validatePriorityFee(fee);
      const level = inferPriorityFeeLevel(validatedFee);
      state.priorityFee = validatedFee;
      state.priorityFeeLevel = level;
      savePriorityFeeStateToStorage({
        priorityFee: validatedFee,
        priorityFeeLevel: level,
      });
      notify();
      return validatedFee;
    },

    setPriorityFeeLevel: (
      level: PriorityFeeLevel,
      customFee?: number
    ): number => {
      if (!isValidPriorityFeeLevel(level)) {
        throw new RangeError(`Invalid priority fee level: ${String(level)}`);
      }

      const resolvedFee =
        level === 'custom'
          ? validatePriorityFee(customFee ?? state.priorityFee)
          : PRIORITY_FEE_PRESETS[level];

      state.priorityFee = resolvedFee;
      state.priorityFeeLevel = level;
      savePriorityFeeStateToStorage({
        priorityFee: resolvedFee,
        priorityFeeLevel: level,
      });
      notify();
      return resolvedFee;
    },

    resetPriorityFee: (): void => {
      state.priorityFee = DEFAULT_PRIORITY_FEE;
      state.priorityFeeLevel = DEFAULT_PRIORITY_FEE_LEVEL;
      savePriorityFeeStateToStorage({
        priorityFee: DEFAULT_PRIORITY_FEE,
        priorityFeeLevel: DEFAULT_PRIORITY_FEE_LEVEL,
      });
      notify();
    },

    hydratePriorityFee: (): void => {
      const hydrated = loadPriorityFeeStateFromStorage();
      state.priorityFee = hydrated.priorityFee;
      state.priorityFeeLevel = hydrated.priorityFeeLevel;
      notify();
    },

    resolveTransactionPriorityFee: (overrideFee?: number | null): number => {
      if (overrideFee !== undefined && overrideFee !== null) {
        return validatePriorityFee(overrideFee);
      }
      return state.priorityFee;
    },
  };

  return {
    getState: () => state,
    setState: (partial: Partial<PersistedPriorityFeeState>) => {
      if (partial.priorityFee !== undefined) {
        state.priorityFee = validatePriorityFee(partial.priorityFee);
      }
      if (partial.priorityFeeLevel !== undefined) {
        state.priorityFeeLevel = partial.priorityFeeLevel;
      }
      savePriorityFeeStateToStorage({
        priorityFee: state.priorityFee,
        priorityFeeLevel: state.priorityFeeLevel,
      });
      notify();
    },
    subscribe: (listener: PriorityFeeListener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const priorityFeeStore = createPriorityFeeStore();

/**
 * Resolves the effective priority fee (in micro-lamports) for a transaction.
 * Uses the per-transaction override if provided; otherwise inherits from global state.
 */
export function resolveEffectivePriorityFee(
  overrideFee?: number | null
): number {
  return priorityFeeStore.getState().resolveTransactionPriorityFee(overrideFee);
}
