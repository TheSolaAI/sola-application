import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findKnownBlinkGame } from '../../config/blinks.ts';
import { applyActionsJsonRules, parseBlinkUrl } from './url.ts';

describe('parseBlinkUrl', () => {
  it('maps known game names and aliases', () => {
    const parsed = parseBlinkUrl('coin flip', findKnownBlinkGame);
    assert.equal(parsed.source, 'game');
    assert.equal(parsed.gameId, 'coinflip');
    assert.equal(
      parsed.actionUrl,
      'https://flip.sendarcade.fun/api/actions/website'
    );
  });

  it('unwraps solana-action URLs', () => {
    const parsed = parseBlinkUrl(
      'solana-action:https://actions.alice.com/donate'
    );
    assert.equal(parsed.source, 'solana-action');
    assert.equal(parsed.actionUrl, 'https://actions.alice.com/donate');
  });

  it('unwraps dial.to interstitial URLs', () => {
    const parsed = parseBlinkUrl(
      'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Factions.alice.com%2Fdonate'
    );
    assert.equal(parsed.source, 'interstitial');
    assert.equal(parsed.actionUrl, 'https://actions.alice.com/donate');
  });

  it('keeps plain Action URLs', () => {
    const parsed = parseBlinkUrl(
      'https://flip.sendarcade.fun/api/actions/website'
    );
    assert.equal(parsed.source, 'action');
    assert.match(parsed.actionUrl, /^https:\/\/flip\.sendarcade\.fun\//);
  });

  it('rejects empty input', () => {
    assert.throws(() => parseBlinkUrl('   '), /required/i);
  });

  it('rejects non-http schemes after solana-action unwrapping', () => {
    assert.throws(
      () => parseBlinkUrl('solana-action:javascript:alert(1)'),
      /valid Blink action URL/i
    );
    assert.throws(
      () => parseBlinkUrl('solana-action:'),
      /valid Blink action URL/i
    );
  });
});

describe('applyActionsJsonRules', () => {
  it('maps an exact website path to an Actions API', () => {
    const mapped = applyActionsJsonRules('https://alice.com/donate', [
      {
        pathPattern: '/donate',
        apiPath: 'https://actions.alice.com/donate',
      },
    ]);
    assert.equal(mapped, 'https://actions.alice.com/donate');
  });

  it('maps wildcard website paths', () => {
    const mapped = applyActionsJsonRules('https://alice.com/buy/123', [
      {
        pathPattern: '/buy/**',
        apiPath: '/api/actions/buy/**',
      },
    ]);
    assert.equal(mapped, 'https://alice.com/api/actions/buy/123');
  });
});
