import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  MessageCompiledInstruction,
  MessageV0,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

export type PriorityFeeLevel =
  | 'none'
  | 'low'
  | 'medium'
  | 'high'
  | 'veryHigh'
  | 'custom';

export const PRIORITY_FEE_LEVELS: Record<Exclude<PriorityFeeLevel, 'custom'>, number> = {
  none: 0,
  low: 1_000,
  medium: 50_000,
  high: 100_000,
  veryHigh: 500_000,
};

export const DEFAULT_COMPUTE_UNIT_LIMIT = 400_000;

export interface PriorityFeeOptions {
  level?: PriorityFeeLevel;
  customFee?: number | bigint;
  computeUnitLimit?: number;
  addressLookupTableAccounts?: AddressLookupTableAccount[];
}

const COMPUTE_UNIT_LIMIT_DISCRIMINATOR = 2;
const COMPUTE_UNIT_PRICE_DISCRIMINATOR = 3;
const SYSTEM_ADVANCE_NONCE_DISCRIMINATOR = 4;

function isAdvanceNonceInstruction(ix: TransactionInstruction): boolean {
  if (!ix.programId.equals(SystemProgram.programId)) {
    return false;
  }
  return ix.data.length >= 4 && ix.data.readUInt32LE(0) === SYSTEM_ADVANCE_NONCE_DISCRIMINATOR;
}

function getComputeUnitLimitFromInstruction(ix: TransactionInstruction): number | null {
  if (!ix.programId.equals(ComputeBudgetProgram.programId)) {
    return null;
  }
  if (ix.data.length >= 5 && ix.data[0] === COMPUTE_UNIT_LIMIT_DISCRIMINATOR) {
    return ix.data.readUInt32LE(1);
  }
  return null;
}

function isComputeLimitOrPriceInstruction(ix: TransactionInstruction): boolean {
  if (!ix.programId.equals(ComputeBudgetProgram.programId) || ix.data.length === 0) {
    return false;
  }
  return (
    ix.data[0] === COMPUTE_UNIT_LIMIT_DISCRIMINATOR ||
    ix.data[0] === COMPUTE_UNIT_PRICE_DISCRIMINATOR
  );
}

/**
 * Resolves microLamports compute unit price from options or configured fee levels.
 */
export function resolvePriorityFeeMicroLamports(options?: PriorityFeeOptions): number {
  if (!options) return PRIORITY_FEE_LEVELS.medium;

  if (options.level === 'none') {
    return 0;
  }

  if (options.level === 'custom' && options.customFee === undefined) {
    throw new Error('customFee is required when priority fee level is custom');
  }

  if (options.level === 'custom' || options.customFee !== undefined) {
    const feeNum = Number(options.customFee ?? 0);
    if (isNaN(feeNum) || feeNum < 0) {
      return 0;
    }
    return Math.floor(feeNum);
  }

  if (options.level && options.level in PRIORITY_FEE_LEVELS) {
    return PRIORITY_FEE_LEVELS[options.level as Exclude<PriorityFeeLevel, 'custom'>];
  }

  return PRIORITY_FEE_LEVELS.medium;
}

/**
 * Builds ComputeBudgetProgram instructions for compute unit limit and price.
 */
export function createPriorityFeeInstructions(options?: PriorityFeeOptions): TransactionInstruction[] {
  const instructions: TransactionInstruction[] = [];
  const microLamports = resolvePriorityFeeMicroLamports(options);
  const units = options?.computeUnitLimit ?? DEFAULT_COMPUTE_UNIT_LIMIT;

  if (units > 0) {
    instructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({
        units,
      })
    );
  }

  if (microLamports > 0) {
    instructions.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
      })
    );
  }

  return instructions;
}

function mergeInstructionsWithPriority(
  existingInstructions: TransactionInstruction[],
  options?: PriorityFeeOptions
): TransactionInstruction[] {
  let maxExistingUnits = 0;
  for (const ix of existingInstructions) {
    const existingLimit = getComputeUnitLimitFromInstruction(ix);
    if (existingLimit !== null && existingLimit > maxExistingUnits) {
      maxExistingUnits = existingLimit;
    }
  }

  const effectiveOptions: PriorityFeeOptions = {
    ...options,
    computeUnitLimit:
      options?.computeUnitLimit !== undefined
        ? options.computeUnitLimit
        : Math.max(DEFAULT_COMPUTE_UNIT_LIMIT, maxExistingUnits),
  };

  const priorityInstructions = createPriorityFeeInstructions(effectiveOptions);
  if (priorityInstructions.length === 0) {
    return existingInstructions;
  }

  const preservedInstructions = existingInstructions.filter(
    (ix) => !isComputeLimitOrPriceInstruction(ix)
  );

  if (
    preservedInstructions.length > 0 &&
    isAdvanceNonceInstruction(preservedInstructions[0])
  ) {
    return [
      preservedInstructions[0],
      ...priorityInstructions,
      ...preservedInstructions.slice(1),
    ];
  }

  return [...priorityInstructions, ...preservedInstructions];
}

/**
 * Prepends priority fee instructions to a legacy Solana Transaction.
 */
export function addPriorityFeeToLegacyTransaction(
  transaction: Transaction,
  options?: PriorityFeeOptions
): Transaction {
  const merged = mergeInstructionsWithPriority(transaction.instructions, options);
  if (merged === transaction.instructions) return transaction;

  const newTx = new Transaction();
  newTx.feePayer = transaction.feePayer;
  newTx.recentBlockhash = transaction.recentBlockhash;
  newTx.lastValidBlockHeight = transaction.lastValidBlockHeight;
  newTx.nonceInfo = transaction.nonceInfo;

  for (const ix of merged) {
    newTx.add(ix);
  }
  if (transaction.signatures.length > 0) {
    newTx.signatures = transaction.signatures;
  }

  return newTx;
}

/**
 * Prepends priority fee instructions to a Solana VersionedTransaction,
 * preserving address lookup tables and durable nonce ordering.
 */
export function addPriorityFeeToVersionedTransaction(
  versionedTx: VersionedTransaction,
  payerKey: PublicKey | string,
  options?: PriorityFeeOptions
): VersionedTransaction {
  const payer = typeof payerKey === 'string' ? new PublicKey(payerKey) : payerKey;
  const lookupTables = options?.addressLookupTableAccounts;
  const hasLookupReferences = versionedTx.message.addressTableLookups.length > 0;

  if (!hasLookupReferences || (lookupTables && lookupTables.length > 0)) {
    const existingInstructions = TransactionMessage.decompile(versionedTx.message, {
      addressLookupTableAccounts: lookupTables,
    }).instructions;

    const mergedInstructions = mergeInstructionsWithPriority(existingInstructions, options);
    if (mergedInstructions === existingInstructions) return versionedTx;

    const newMessage = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: versionedTx.message.recentBlockhash,
      instructions: mergedInstructions,
    }).compileToV0Message(lookupTables);

    return new VersionedTransaction(newMessage);
  }

  // Fallback for v0 messages with lookup tables when lookup table accounts are not passed:
  // preserve staticAccountKeys and addressTableLookups directly on MessageV0.
  const priorityInstructions = createPriorityFeeInstructions(options);
  if (priorityInstructions.length === 0) return versionedTx;

  const staticKeys = [...versionedTx.message.staticAccountKeys];
  let computeBudgetIndex = staticKeys.findIndex((k) =>
    k.equals(ComputeBudgetProgram.programId)
  );
  if (computeBudgetIndex === -1) {
    computeBudgetIndex = staticKeys.length;
    staticKeys.push(ComputeBudgetProgram.programId);
  }

  const compiledPriority: MessageCompiledInstruction[] = priorityInstructions.map((ix) => ({
    programIdIndex: computeBudgetIndex,
    accountKeyIndexes: [],
    data: Uint8Array.from(ix.data),
  }));

  const existingCompiled = versionedTx.message.compiledInstructions.filter((cix) => {
    const progKey = staticKeys[cix.programIdIndex];
    if (!progKey || !progKey.equals(ComputeBudgetProgram.programId)) return true;
    const disc = cix.data[0];
    return disc !== COMPUTE_UNIT_LIMIT_DISCRIMINATOR && disc !== COMPUTE_UNIT_PRICE_DISCRIMINATOR;
  });

  const firstIsNonce =
    existingCompiled.length > 0 &&
    staticKeys[existingCompiled[0].programIdIndex]?.equals(SystemProgram.programId) &&
    existingCompiled[0].data.length >= 4 &&
    Buffer.from(existingCompiled[0].data).readUInt32LE(0) === SYSTEM_ADVANCE_NONCE_DISCRIMINATOR;

  const finalCompiled = firstIsNonce
    ? [existingCompiled[0], ...compiledPriority, ...existingCompiled.slice(1)]
    : [...compiledPriority, ...existingCompiled];

  const updatedMessage = new MessageV0({
    header: versionedTx.message.header,
    staticAccountKeys: staticKeys,
    recentBlockhash: versionedTx.message.recentBlockhash,
    compiledInstructions: finalCompiled,
    addressTableLookups: versionedTx.message.addressTableLookups,
  });

  return new VersionedTransaction(updatedMessage);
}

/**
 * Attaches priority fee instructions to a base64 serialized transaction (legacy or versioned).
 */
export function addPriorityFeeToSerializedTransaction(
  serializedBase64: string,
  payerKey: PublicKey | string,
  options?: PriorityFeeOptions
): {
  serializedTransaction: string;
  versionedTransaction: VersionedTransaction;
  microLamports: number;
  computeUnitLimit?: number;
} {
  const buffer = Buffer.from(serializedBase64, 'base64');
  const payer = typeof payerKey === 'string' ? new PublicKey(payerKey) : payerKey;
  const microLamports = resolvePriorityFeeMicroLamports(options);
  const computeUnitLimit = options?.computeUnitLimit ?? DEFAULT_COMPUTE_UNIT_LIMIT;

  let versionedTx: VersionedTransaction;
  try {
    versionedTx = VersionedTransaction.deserialize(buffer);
  } catch {
    // If it is a legacy transaction, deserialize and convert to VersionedTransaction
    const legacyTx = Transaction.from(buffer);
    const newMessage = new TransactionMessage({
      payerKey: legacyTx.feePayer || payer,
      recentBlockhash: legacyTx.recentBlockhash || '',
      instructions: legacyTx.instructions,
    }).compileToV0Message();
    versionedTx = new VersionedTransaction(newMessage);
  }

  const updatedTx = addPriorityFeeToVersionedTransaction(versionedTx, payer, options);
  const updatedBuffer = Buffer.from(updatedTx.serialize());

  return {
    serializedTransaction: updatedBuffer.toString('base64'),
    versionedTransaction: updatedTx,
    microLamports,
    computeUnitLimit,
  };
}

/**
 * Dynamic priority fee estimation using Solana RPC with resilient fallback and abort timeout.
 */
export async function estimatePriorityFee(
  serializedTransaction: string,
  rpcUrl?: string,
  timeoutMs = 3000
): Promise<number> {
  const rpc = rpcUrl || process.env.SOLANA_RPC_URL;
  if (!rpc) return PRIORITY_FEE_LEVELS.medium;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      jsonrpc: '2.0',
      id: 'sola-priority-fee',
      method: 'getPriorityFeeEstimate',
      params: [
        {
          transaction: serializedTransaction,
          options: {
            recommended: true,
            transactionEncoding: 'base64',
          },
        },
      ],
    };

    const response = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) return PRIORITY_FEE_LEVELS.medium;
    const data = await response.json();
    const estimate = data?.result?.priorityFeeEstimate;
    return typeof estimate === 'number' && estimate > 0
      ? Math.floor(estimate)
      : PRIORITY_FEE_LEVELS.medium;
  } catch {
    return PRIORITY_FEE_LEVELS.medium;
  } finally {
    clearTimeout(timer);
  }
}
