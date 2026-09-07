import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  base64ToBytes,
  bytesToBase64,
  getSignMessageBytes,
} from './encoding.ts';

describe('getSignMessageBytes', () => {
  it('decodes base64 payload data instead of signing the UTF-8 string', () => {
    const message = 'hello blink';
    const data = bytesToBase64(new TextEncoder().encode(message));
    const signedBytes = getSignMessageBytes(data);

    assert.deepEqual(signedBytes, new TextEncoder().encode(message));
    assert.notDeepEqual(signedBytes, new TextEncoder().encode(data));
    assert.deepEqual(signedBytes, base64ToBytes(data));
  });

  it('does not use a display message field as the bytes to sign', () => {
    const data = bytesToBase64(new TextEncoder().encode('actual-bytes'));
    const signedBytes = getSignMessageBytes(data);
    assert.deepEqual(signedBytes, new TextEncoder().encode('actual-bytes'));
  });

  it('throws when no signable data is present', () => {
    assert.throws(() => getSignMessageBytes(undefined), /message to sign/);
    assert.throws(() => getSignMessageBytes(''), /message to sign/);
    assert.throws(() => getSignMessageBytes('not-base64'), /message to sign/);
  });
});
