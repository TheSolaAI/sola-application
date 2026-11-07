import {
  ComputeBudgetProgram,
  PublicKey,
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
}

/**
 * Resolves microLamports compute unit price from options or configured fee levels.
 */
export function resolvePriorityFeeMicroLamports(options?: PriorityFeeOptions): number {
  if (!options) return PRIORITY_FEE_LEVELS.medium;

  if (options.level === 'none') {
    return 0;
  }

  if (options.level === 'custom' || options.customFee !== undefined) {
    const feeNum = Number(options.customFee ?? 0);
    return isNaN(feeNum) || feeNum < 0 ? 0 : Math.floor(feeNum);
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

/**
 * Prepends priority fee instructions to a legacy Solana Transaction.
 */
export function addPriorityFeeToLegacyTransaction(
  transaction: Transaction,
  options?: PriorityFeeOptions
): Transaction {
  const priorityInstructions = createPriorityFeeInstructions(options);
  if (priorityInstructions.length === 0) return transaction;

  const newTx = new Transaction();
  newTx.feePayer = transaction.feePayer;
  newTx.recentBlockhash = transaction.recentBlockhash;
  newTx.lastValidBlockHeight = transaction.lastValidBlockHeight;
  newTx.nonceInfo = transaction.nonceInfo;

  // Compute budget instructions should precede other program instructions
  for (const ix of priorityInstructions) {
    newTx.add(ix);
  }
  for (const ix of transaction.instructions) {
    // Filter out existing compute budget instructions to avoid duplicates
    if (!ix.programId.equals(ComputeBudgetProgram.programId)) {
      newTx.add(ix);
    }
  }
  if (transaction.signatures.length > 0) {
    newTx.signatures = transaction.signatures;
  }

  return newTx;
}

/**
 * Prepends priority fee instructions to a Solana VersionedTransaction.
 */
export function addPriorityFeeToVersionedTransaction(
  versionedTx: VersionedTransaction,
  payerKey: PublicKey | string,
  options?: PriorityFeeOptions
): VersionedTransaction {
  const priorityInstructions = createPriorityFeeInstructions(options);
  if (priorityInstructions.length === 0) return versionedTx;

  const payer = typeof payerKey === 'string' ? new PublicKey(payerKey) : payerKey;
  const existingInstructions = TransactionMessage.decompile(versionedTx.message).instructions;

  // Filter out any pre-existing ComputeBudget instructions to avoid conflicting instructions
  const filteredInstructions = existingInstructions.filter(
    (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
  );

  const newMessage = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: versionedTx.message.recentBlockhash,
    instructions: [...priorityInstructions, ...filteredInstructions],
  }).compileToV0Message();

  return new VersionedTransaction(newMessage);
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
 * Dynamic priority fee estimation using Solana RPC with resilient fallback.
 */
export async function estimatePriorityFee(
  serializedTransaction: string,
  rpcUrl?: string
): Promise<number> {
  const rpc = rpcUrl || process.env.SOLANA_RPC_URL;
  if (!rpc) return PRIORITY_FEE_LEVELS.medium;

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
    });

    if (!response.ok) return PRIORITY_FEE_LEVELS.medium;
    const data = await response.json();
    const estimate = data?.result?.priorityFeeEstimate;
    return typeof estimate === 'number' && estimate > 0
      ? Math.floor(estimate)
      : PRIORITY_FEE_LEVELS.medium;
  } catch {
    return PRIORITY_FEE_LEVELS.medium;
  }
}
