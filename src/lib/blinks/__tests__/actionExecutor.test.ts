import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSafeBlinkUrl,
  assertValidBlinkTransaction,
  getExecutableBlinkActions,
  hasAllRequiredBlinkParameters,
  normalizeBlinkActionUrl,
  resolveBlinkActionHref,
  selectBlinkAction,
} from '../actionExecutor.ts';

test('normalizeBlinkActionUrl unwraps solana-action: and dial.to URLs', () => {
  assert.equal(
    normalizeBlinkActionUrl(
      'solana-action:https%3A%2F%2Fgames.solaai.xyz%2Fapi%2Factions%2Fplay'
    ),
    'https://games.solaai.xyz/api/actions/play'
  );

  assert.equal(
    normalizeBlinkActionUrl(
      'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fgames.solaai.xyz%2Fapi%2Factions%2Fplay'
    ),
    'https://games.solaai.xyz/api/actions/play'
  );
});

test('assertSafeBlinkUrl rejects non-HTTPS and private/local hosts', () => {
  assert.throws(
    () => assertSafeBlinkUrl('http://games.solaai.xyz/api/actions/play'),
    /HTTPS/
  );
  assert.throws(
    () => assertSafeBlinkUrl('https://localhost:3000/api/actions/play'),
    /Unsafe Blink action host/
  );
  assert.throws(
    () => assertSafeBlinkUrl('https://127.0.0.1/api/actions/play'),
    /Unsafe Blink action host/
  );
  assert.throws(
    () => assertSafeBlinkUrl('https://192.168.1.25/api/actions/play'),
    /Unsafe Blink action host/
  );

  const safe = assertSafeBlinkUrl('https://games.solaai.xyz/api/actions/play');
  assert.equal(safe.origin, 'https://games.solaai.xyz');
});

test('resolveBlinkActionHref substitutes templated parameters and blocks cross-origin targets', () => {
  const resolved = resolveBlinkActionHref(
    '/api/actions/play?move={move}&wager={wager}',
    'https://games.solaai.xyz/api/actions/play',
    { move: 'rock', wager: '0.5' }
  );
  assert.equal(
    resolved.toString(),
    'https://games.solaai.xyz/api/actions/play?move=rock&wager=0.5'
  );

  assert.throws(
    () =>
      resolveBlinkActionHref(
        '/api/actions/play?move={move}',
        'https://games.solaai.xyz/api/actions/play',
        {}
      ),
    /Missing required Blink parameter: move/
  );

  assert.throws(
    () =>
      resolveBlinkActionHref(
        'https://attacker.example/api/actions/steal',
        'https://games.solaai.xyz/api/actions/play',
        {}
      ),
    /Cross-origin Blink action href blocked/
  );
});

test('selectBlinkAction matches by label or defaults to first action', () => {
  const metadata = {
    title: 'Rock Paper Scissors',
    label: 'Play',
    links: {
      actions: [
        { label: 'Play 0.1 SOL', href: '/api/play?amount=0.1' },
        { label: 'Play 0.5 SOL', href: '/api/play?amount=0.5' },
      ],
    },
  };

  assert.equal(
    selectBlinkAction(metadata, 'https://games.solaai.xyz/api/play')?.label,
    'Play 0.1 SOL'
  );
  assert.equal(
    selectBlinkAction(metadata, 'https://games.solaai.xyz/api/play', '0.5 SOL')
      ?.label,
    'Play 0.5 SOL'
  );

  const singleActionMetadata = {
    title: 'Claim Daily Reward',
    label: 'Claim Now',
  };
  const fallbackActions = getExecutableBlinkActions(
    singleActionMetadata,
    'https://games.solaai.xyz/api/claim'
  );
  assert.equal(fallbackActions.length, 1);
  assert.equal(fallbackActions[0].label, 'Claim Now');
});

test('hasAllRequiredBlinkParameters checks explicit required flags and href placeholders', () => {
  const action = {
    label: 'Custom Bet',
    href: '/api/play?amount={amount}',
    parameters: [{ name: 'amount', required: true }],
  };

  assert.equal(hasAllRequiredBlinkParameters(action, {}), false);
  assert.equal(hasAllRequiredBlinkParameters(action, { amount: '1.0' }), true);
});

test('assertValidBlinkTransaction validates base64 transaction strings', () => {
  assert.equal(assertValidBlinkTransaction('dGVzdA=='), 'dGVzdA==');
  assert.throws(() => assertValidBlinkTransaction(''), /did not return/);
  assert.throws(
    () => assertValidBlinkTransaction('not-valid-base64!!!'),
    /invalid base64/
  );
});
