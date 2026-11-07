import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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
  validatePriorityFee,
} from '../utils/priorityFeeState.ts';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('Global Priority Fee State (PriorityFeeHandler)', () => {
  let mockStorage: MemoryStorage;

  beforeEach(() => {
    mockStorage = new MemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });
    priorityFeeStore.getState().resetPriorityFee();
  });

  it('initializes with default medium level and 50,000 micro-lamports', () => {
    const state = priorityFeeStore.getState();
    assert.equal(state.getPriorityFee(), DEFAULT_PRIORITY_FEE);
    assert.equal(state.getPriorityFeeLevel(), DEFAULT_PRIORITY_FEE_LEVEL);
    assert.equal(state.priorityFee, 50_000);
    assert.equal(state.priorityFeeLevel, 'medium');
  });

  it('validates non-negative numbers in micro-lamports and rejects invalid inputs', () => {
    assert.equal(validatePriorityFee(0), 0);
    assert.equal(validatePriorityFee(12345.9), 12345);
    assert.equal(
      validatePriorityFee(MAX_PRIORITY_FEE_MICRO_LAMPORTS + 500_000),
      MAX_PRIORITY_FEE_MICRO_LAMPORTS
    );

    assert.throws(() => validatePriorityFee(-1), RangeError);
    assert.throws(() => validatePriorityFee(NaN), RangeError);
    assert.throws(() => validatePriorityFee(Infinity), RangeError);
    assert.throws(() => validatePriorityFee('50000'), RangeError);
  });

  it('validates and infers priority fee levels accurately', () => {
    assert.equal(isValidPriorityFeeLevel('low'), true);
    assert.equal(isValidPriorityFeeLevel('medium'), true);
    assert.equal(isValidPriorityFeeLevel('high'), true);
    assert.equal(isValidPriorityFeeLevel('custom'), true);
    assert.equal(isValidPriorityFeeLevel('invalid'), false);

    assert.equal(inferPriorityFeeLevel(PRIORITY_FEE_PRESETS.low), 'low');
    assert.equal(inferPriorityFeeLevel(PRIORITY_FEE_PRESETS.medium), 'medium');
    assert.equal(inferPriorityFeeLevel(PRIORITY_FEE_PRESETS.high), 'high');
    assert.equal(inferPriorityFeeLevel(75_000), 'custom');
  });

  it('updates priority fee via setPriorityFee and syncs level + localStorage', () => {
    const state = priorityFeeStore.getState();

    state.setPriorityFee(PRIORITY_FEE_PRESETS.high);
    assert.equal(priorityFeeStore.getState().priorityFee, 100_000);
    assert.equal(priorityFeeStore.getState().priorityFeeLevel, 'high');

    state.setPriorityFee(42_500);
    assert.equal(priorityFeeStore.getState().priorityFee, 42_500);
    assert.equal(priorityFeeStore.getState().priorityFeeLevel, 'custom');

    const persisted = JSON.parse(
      mockStorage.getItem(PRIORITY_FEE_STORAGE_KEY)!
    );
    assert.deepEqual(persisted, {
      priorityFee: 42_500,
      priorityFeeLevel: 'custom',
    });
  });

  it('updates priority fee via setPriorityFeeLevel for presets and custom values', () => {
    const state = priorityFeeStore.getState();

    state.setPriorityFeeLevel('low');
    assert.equal(
      priorityFeeStore.getState().priorityFee,
      PRIORITY_FEE_PRESETS.low
    );
    assert.equal(priorityFeeStore.getState().priorityFeeLevel, 'low');

    state.setPriorityFeeLevel('custom', 250_000);
    assert.equal(priorityFeeStore.getState().priorityFee, 250_000);
    assert.equal(priorityFeeStore.getState().priorityFeeLevel, 'custom');
  });

  it('hydrates state from localStorage and gracefully handles malformed storage data', () => {
    mockStorage.setItem(
      PRIORITY_FEE_STORAGE_KEY,
      JSON.stringify({ priorityFee: 88_000, priorityFeeLevel: 'custom' })
    );

    priorityFeeStore.getState().hydratePriorityFee();
    assert.equal(priorityFeeStore.getState().priorityFee, 88_000);
    assert.equal(priorityFeeStore.getState().priorityFeeLevel, 'custom');

    mockStorage.setItem(PRIORITY_FEE_STORAGE_KEY, '{not-valid-json');
    const fallback = loadPriorityFeeStateFromStorage();
    assert.equal(fallback.priorityFee, DEFAULT_PRIORITY_FEE);
    assert.equal(fallback.priorityFeeLevel, DEFAULT_PRIORITY_FEE_LEVEL);
  });

  it('inherits global priority fee for transactions unless overridden per-transaction', () => {
    priorityFeeStore.getState().setPriorityFeeLevel('high');

    // Inherit from global state when no per-transaction override is supplied
    assert.equal(resolveEffectivePriorityFee(), PRIORITY_FEE_PRESETS.high);
    assert.equal(resolveEffectivePriorityFee(undefined), 100_000);
    assert.equal(resolveEffectivePriorityFee(null), 100_000);

    // Override per-transaction when explicit fee is passed
    assert.equal(resolveEffectivePriorityFee(15_000), 15_000);
    assert.equal(resolveEffectivePriorityFee(0), 0);
  });
});
