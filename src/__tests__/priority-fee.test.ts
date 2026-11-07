import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  addPriorityFeeToLegacyTransaction,
  addPriorityFeeToSerializedTransaction,
  addPriorityFeeToVersionedTransaction,
  createPriorityFeeInstructions,
  DEFAULT_COMPUTE_UNIT_LIMIT,
  estimatePriorityFee,
  PRIORITY_FEE_LEVELS,
  resolvePriorityFeeMicroLamports,
} from '../utils/priorityFee.ts';

describe('Solana Priority Fee Utilities (#338)', () => {
  describe('resolvePriorityFeeMicroLamports', () => {
    test('resolves default medium fee when no options provided', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports(), PRIORITY_FEE_LEVELS.medium);
    });

    test('resolves 0 for none level', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'none' }), 0);
    });

    test('resolves correct presets for low, medium, high, and veryHigh levels', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'low' }), 1_000);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'medium' }), 50_000);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'high' }), 100_000);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'veryHigh' }), 500_000);
    });

    test('resolves custom priority fee correctly', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'custom', customFee: 25_000 }), 25_000);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: 75_000 }), 75_000);
    });

    test('clamps negative or NaN custom fees to 0', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: -500 }), 0);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: NaN as any }), 0);
    });
  });

  describe('createPriorityFeeInstructions', () => {
    test('creates both unit limit and unit price instructions by default', () => {
      const instructions = createPriorityFeeInstructions({ level: 'medium' });
      assert.strictEqual(instructions.length, 2);

      // Verify instruction program IDs target ComputeBudgetProgram
      assert.ok(instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(instructions[1].programId.equals(ComputeBudgetProgram.programId));
    });

    test('omits compute unit price instruction when level is none', () => {
      const instructions = createPriorityFeeInstructions({ level: 'none' });
      assert.strictEqual(instructions.length, 1);
      assert.ok(instructions[0].programId.equals(ComputeBudgetProgram.programId));
    });

    test('supports custom compute unit limit', () => {
      const instructions = createPriorityFeeInstructions({
        level: 'high',
        computeUnitLimit: 200_000,
      });
      assert.strictEqual(instructions.length, 2);
    });
  });

  describe('addPriorityFeeToLegacyTransaction', () => {
    test('prepends priority fee instructions to legacy transaction', () => {
      const payer = Keypair.generate();
      const recipient = Keypair.generate();

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipient.publicKey,
          lamports: 1_000_000,
        })
      );
      tx.feePayer = payer.publicKey;
      tx.recentBlockhash = Keypair.generate().publicKey.toBase58();

      const updatedTx = addPriorityFeeToLegacyTransaction(tx, { level: 'high' });
      assert.strictEqual(updatedTx.instructions.length, 3);
      assert.ok(updatedTx.instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(updatedTx.instructions[1].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(updatedTx.instructions[2].programId.equals(SystemProgram.programId));
    });

    test('deduplicates previous compute budget instructions when adding new fee', () => {
      const payer = Keypair.generate();
      const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100 }),
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: payer.publicKey,
          lamports: 10,
        })
      );

      const updatedTx = addPriorityFeeToLegacyTransaction(tx, { level: 'veryHigh' });
      // Should have 2 compute budget instructions + 1 transfer instruction
      assert.strictEqual(updatedTx.instructions.length, 3);
    });
  });

  describe('addPriorityFeeToVersionedTransaction', () => {
    test('adds priority fee to VersionedTransaction and decompiles/recompiles successfully', () => {
      const payer = Keypair.generate();
      const recipient = Keypair.generate();
      const blockhash = Keypair.generate().publicKey.toBase58();

      const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: recipient.publicKey,
            lamports: 5_000_000,
          }),
        ],
      }).compileToV0Message();

      const versionedTx = new VersionedTransaction(message);
      const updatedTx = addPriorityFeeToVersionedTransaction(versionedTx, payer.publicKey, {
        level: 'medium',
      });

      const decompiled = TransactionMessage.decompile(updatedTx.message);
      assert.strictEqual(decompiled.instructions.length, 3);
      assert.ok(decompiled.instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(decompiled.instructions[1].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(decompiled.instructions[2].programId.equals(SystemProgram.programId));
    });
  });

  describe('addPriorityFeeToSerializedTransaction', () => {
    test('attaches priority fee to base64 serialized VersionedTransaction', () => {
      const payer = Keypair.generate();
      const blockhash = Keypair.generate().publicKey.toBase58();

      const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: payer.publicKey,
            lamports: 100,
          }),
        ],
      }).compileToV0Message();

      const versionedTx = new VersionedTransaction(message);
      const base64Tx = Buffer.from(versionedTx.serialize()).toString('base64');

      const result = addPriorityFeeToSerializedTransaction(base64Tx, payer.publicKey, {
        level: 'high',
        computeUnitLimit: 350_000,
      });

      assert.ok(result.serializedTransaction);
      assert.strictEqual(result.microLamports, 100_000);
      assert.strictEqual(result.computeUnitLimit, 350_000);

      const deserialized = VersionedTransaction.deserialize(
        Buffer.from(result.serializedTransaction, 'base64')
      );
      const decompiled = TransactionMessage.decompile(deserialized.message);
      assert.strictEqual(decompiled.instructions.length, 3);
      assert.ok(decompiled.instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(decompiled.instructions[1].programId.equals(ComputeBudgetProgram.programId));
    });

    test('attaches priority fee to base64 serialized legacy Transaction', () => {
      const payer = Keypair.generate();
      const blockhash = Keypair.generate().publicKey.toBase58();

      const legacyTx = new Transaction();
      legacyTx.feePayer = payer.publicKey;
      legacyTx.recentBlockhash = blockhash;
      legacyTx.add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: payer.publicKey,
          lamports: 500,
        })
      );

      const base64Legacy = legacyTx.serialize({ requireAllSignatures: false }).toString('base64');
      const result = addPriorityFeeToSerializedTransaction(base64Legacy, payer.publicKey, {
        level: 'low',
      });

      assert.ok(result.serializedTransaction);
      assert.strictEqual(result.microLamports, 1_000);

      const deserialized = VersionedTransaction.deserialize(
        Buffer.from(result.serializedTransaction, 'base64')
      );
      const decompiled = TransactionMessage.decompile(deserialized.message);
      assert.strictEqual(decompiled.instructions.length, 3);
      assert.ok(decompiled.instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.ok(decompiled.instructions[1].programId.equals(ComputeBudgetProgram.programId));
    });
  });

  describe('estimatePriorityFee', () => {
    test('falls back gracefully to default fee when RPC URL is not provided', async () => {
      const fee = await estimatePriorityFee('syntheticBase64Tx', undefined);
      assert.strictEqual(fee, PRIORITY_FEE_LEVELS.medium);
    });

    test('falls back gracefully when RPC call fails', async () => {
      const fee = await estimatePriorityFee('syntheticBase64Tx', 'http://127.0.0.1:9999');
      assert.strictEqual(fee, PRIORITY_FEE_LEVELS.medium);
    });
  });
});
