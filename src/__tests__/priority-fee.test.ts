import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ComputeBudgetProgram,
  Keypair,
  MessageV0,
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

    test('resolves custom priority fee correctly and rejects missing customFee when level is custom', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ level: 'custom', customFee: 25_000 }), 25_000);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: 75_000 }), 75_000);
      assert.throws(
        () => resolvePriorityFeeMicroLamports({ level: 'custom' }),
        /customFee is required/
      );
    });

    test('clamps negative or NaN custom fees to 0', () => {
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: -500 }), 0);
      assert.strictEqual(resolvePriorityFeeMicroLamports({ customFee: NaN as any }), 0);
    });
  });

  describe('createPriorityFeeInstructions', () => {
    test('creates both unit limit and unit price instructions with exact encoded data', () => {
      const instructions = createPriorityFeeInstructions({ level: 'medium' });
      assert.strictEqual(instructions.length, 2);

      // Instruction 0: SetComputeUnitLimit (discriminator 2, u32 LE = DEFAULT_COMPUTE_UNIT_LIMIT)
      assert.ok(instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.strictEqual(instructions[0].data[0], 2);
      assert.strictEqual(instructions[0].data.readUInt32LE(1), DEFAULT_COMPUTE_UNIT_LIMIT);

      // Instruction 1: SetComputeUnitPrice (discriminator 3, u64 LE = 50_000n)
      assert.ok(instructions[1].programId.equals(ComputeBudgetProgram.programId));
      assert.strictEqual(instructions[1].data[0], 3);
      assert.strictEqual(instructions[1].data.readBigUInt64LE(1), BigInt(PRIORITY_FEE_LEVELS.medium));
    });

    test('omits compute unit price instruction when level is none', () => {
      const instructions = createPriorityFeeInstructions({ level: 'none' });
      assert.strictEqual(instructions.length, 1);
      assert.ok(instructions[0].programId.equals(ComputeBudgetProgram.programId));
      assert.strictEqual(instructions[0].data[0], 2);
      assert.strictEqual(instructions[0].data.readUInt32LE(1), DEFAULT_COMPUTE_UNIT_LIMIT);
    });

    test('supports custom compute unit limit and encodes exact units and price', () => {
      const instructions = createPriorityFeeInstructions({
        level: 'high',
        computeUnitLimit: 200_000,
      });
      assert.strictEqual(instructions.length, 2);
      assert.strictEqual(instructions[0].data[0], 2);
      assert.strictEqual(instructions[0].data.readUInt32LE(1), 200_000);
      assert.strictEqual(instructions[1].data[0], 3);
      assert.strictEqual(instructions[1].data.readBigUInt64LE(1), BigInt(PRIORITY_FEE_LEVELS.high));
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

    test('keeps durable nonce advance instruction first and preserves non-fee compute budget instructions', () => {
      const payer = Keypair.generate();
      const nonceAccount = Keypair.generate();
      const tx = new Transaction().add(
        SystemProgram.nonceAdvance({
          noncePubkey: nonceAccount.publicKey,
          authorizedPubkey: payer.publicKey,
        }),
        ComputeBudgetProgram.requestHeapFrame({ bytes: 64 * 1024 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100 }),
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: payer.publicKey,
          lamports: 10,
        })
      );

      const updatedTx = addPriorityFeeToLegacyTransaction(tx, { level: 'veryHigh' });
      // 1 nonceAdvance + 2 compute budget (limit + price) + 1 heapFrame + 1 transfer = 5
      assert.strictEqual(updatedTx.instructions.length, 5);
      // First instruction remains nonceAdvance
      assert.ok(updatedTx.instructions[0].programId.equals(SystemProgram.programId));
      assert.strictEqual(updatedTx.instructions[0].data.readUInt32LE(0), 4);
      // Preserves higher 600_000 compute unit limit when caller did not override it
      assert.strictEqual(updatedTx.instructions[1].data[0], 2);
      assert.strictEqual(updatedTx.instructions[1].data.readUInt32LE(1), 600_000);
      // Replaces compute unit price with veryHigh
      assert.strictEqual(updatedTx.instructions[2].data[0], 3);
      assert.strictEqual(
        updatedTx.instructions[2].data.readBigUInt64LE(1),
        BigInt(PRIORITY_FEE_LEVELS.veryHigh)
      );
      // Preserves requestHeapFrame instruction (discriminator 1)
      assert.strictEqual(updatedTx.instructions[3].data[0], 1);
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

    test('preserves addressTableLookups when v0 message references lookup tables without accounts', () => {
      const payer = Keypair.generate();
      const tableKey = Keypair.generate().publicKey;
      const msgWithLut = new MessageV0({
        header: {
          numRequiredSignatures: 1,
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 1,
        },
        staticAccountKeys: [payer.publicKey, SystemProgram.programId],
        recentBlockhash: Keypair.generate().publicKey.toBase58(),
        compiledInstructions: [
          {
            programIdIndex: 1,
            accountKeyIndexes: [0, 0],
            data: Uint8Array.from([2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0]),
          },
        ],
        addressTableLookups: [
          {
            accountKey: tableKey,
            writableIndexes: [0],
            readonlyIndexes: [1],
          },
        ],
      });

      const vtx = new VersionedTransaction(msgWithLut);
      const updated = addPriorityFeeToVersionedTransaction(vtx, payer.publicKey, {
        level: 'high',
      });
      assert.strictEqual(updated.message.addressTableLookups.length, 1);
      assert.ok(updated.message.addressTableLookups[0].accountKey.equals(tableKey));
      assert.strictEqual(updated.message.compiledInstructions.length, 3);
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

    test('falls back gracefully when RPC call fails or times out', async () => {
      const fee = await estimatePriorityFee('syntheticBase64Tx', 'http://127.0.0.1:9999', 100);
      assert.strictEqual(fee, PRIORITY_FEE_LEVELS.medium);
    });
  });
});
