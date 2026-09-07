import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { blinkWalletError, shouldAutoExecuteBlink } from './toolPolicy.ts';

describe('shouldAutoExecuteBlink', () => {
  it('defaults to handsfree when autoExecute is omitted', () => {
    assert.equal(shouldAutoExecuteBlink(), true);
    assert.equal(shouldAutoExecuteBlink(true), true);
    assert.equal(shouldAutoExecuteBlink(false), false);
  });
});

describe('blinkWalletError', () => {
  it('requires a wallet only for handsfree execution', () => {
    assert.equal(blinkWalletError(true, undefined), 'No wallet connected');
    assert.equal(blinkWalletError(undefined, undefined), 'No wallet connected');
  });

  it('allows metadata preview without a wallet', () => {
    assert.equal(blinkWalletError(false, undefined), undefined);
    assert.equal(blinkWalletError(false, 'SomeWallet111'), undefined);
  });

  it('allows handsfree execution when a wallet is present', () => {
    assert.equal(blinkWalletError(true, 'SomeWallet111'), undefined);
  });
});
