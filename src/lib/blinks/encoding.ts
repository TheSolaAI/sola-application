import { Transaction, VersionedTransaction } from '@solana/web3.js';

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function bytesToBase64(value: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64');
  }

  let binary = '';
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const compact = value.replace(/\s+/g, '');
  if (!isBase64(compact)) {
    throw new Error('Invalid base64 payload');
  }

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(compact, 'base64'));
  }
  return Uint8Array.from(atob(compact), (char) => char.charCodeAt(0));
}

const isBase64 = (value: string) =>
  value.length > 0 &&
  value.length % 4 === 0 &&
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
    value
  );

export function getSignMessageBytes(
  data: string | Record<string, unknown> | undefined
): Uint8Array {
  if (typeof data === 'string') {
    try {
      return base64ToBytes(data);
    } catch {
      throw new Error('Blink did not return a message to sign');
    }
  }

  if (data && typeof data === 'object') {
    return new TextEncoder().encode(JSON.stringify(data));
  }

  throw new Error('Blink did not return a message to sign');
}

export function encodeBase58(bytes: Uint8Array): string {
  if (!bytes.length) return '';

  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros += 1;
  }

  const size = Math.ceil(bytes.length * 1.38) + 1;
  const encoded = new Uint8Array(size);
  let length = 0;

  for (let i = zeros; i < bytes.length; i += 1) {
    let carry = bytes[i];
    let j = 0;
    for (
      let k = size - 1;
      (carry !== 0 || j < length) && k >= 0;
      k -= 1, j += 1
    ) {
      carry += encoded[k] * 256;
      encoded[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    length = j;
  }

  let start = size - length;
  while (start < size && encoded[start] === 0) {
    start += 1;
  }

  let result = '1'.repeat(zeros);
  for (let i = start; i < size; i += 1) {
    result += BASE58_ALPHABET[encoded[i]];
  }
  return result;
}

export function deserializeTransaction(transaction: string) {
  const buffer = base64ToBytes(transaction);

  try {
    return VersionedTransaction.deserialize(buffer);
  } catch {
    return Transaction.from(buffer);
  }
}

export const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isSolanaAddress(value: string): boolean {
  return SOLANA_ADDRESS_RE.test(value);
}
