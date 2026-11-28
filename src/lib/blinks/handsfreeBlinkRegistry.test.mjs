import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HandsfreeBlinkRegistry,
  isSafePublicHttpsUrl,
  matchBlinkAction,
  resolveBlinkActionHref,
} from './handsfreeBlinkRegistry.ts';

test('isSafePublicHttpsUrl blocks internal hosts and non-HTTPS schemes', () => {
  assert.equal(isSafePublicHttpsUrl('https://blinks.sola.ai/api/game'), true);
  assert.equal(isSafePublicHttpsUrl('http://blinks.sola.ai/api/game'), false);
  assert.equal(isSafePublicHttpsUrl('https://localhost:3000/api'), false);
  assert.equal(isSafePublicHttpsUrl('https://127.0.0.1/admin'), false);
  assert.equal(isSafePublicHttpsUrl('https://169.254.169.254/latest/meta-data'), false);
});

test('resolveBlinkActionHref resolves relative paths and interpolates parameters', () => {
  const href = resolveBlinkActionHref(
    'https://blinks.sola.ai/api/actions/game',
    '/api/actions/game?move={move}&amount={amount}',
    { move: 'attack', amount: '0.5' }
  );
  assert.equal(href, 'https://blinks.sola.ai/api/actions/game?move=attack&amount=0.5');
});

test('matchBlinkAction respects disabled flag and matches labels', () => {
  const meta = {
    title: 'Sola Arena',
    description: 'Game blink',
    label: 'Play',
    links: {
      actions: [
        { label: 'Join Match', href: '/api/join' },
        { label: 'Attack Boss', href: '/api/attack?power={power}' },
      ],
    },
  };
  assert.equal(matchBlinkAction(meta, 'attack boss')?.href, '/api/attack?power={power}');
  assert.equal(matchBlinkAction(meta, 'attack')?.label, 'Attack Boss');
  assert.equal(matchBlinkAction({ ...meta, disabled: true }, 'attack'), null);
});

test('HandsfreeBlinkRegistry registers, triggers, and cleans up handlers', async () => {
  const reg = new HandsfreeBlinkRegistry();
  const unregister = reg.register('game-1', async (req) => ({
    ok: true,
    actionLabel: req.actionLabel || 'Join Match',
    resolvedHref: req.blinkUrl,
    message: `Triggered for ${req.account}`,
  }));

  assert.equal(reg.has('game-1'), true);
  const res = await reg.trigger('game-1', {
    blinkUrl: 'https://blinks.sola.ai/game',
    actionLabel: 'Join Match',
    account: 'So11111111111111111111111111111111111111112',
  });
  assert.equal(res.ok, true);

  unregister();
  assert.equal(reg.has('game-1'), false);
});
