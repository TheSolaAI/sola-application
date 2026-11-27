import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HandsfreeBlinkRegistry,
  matchBlinkAction,
  resolveBlinkActionHref,
} from './handsfreeBlinkRegistry.ts';

test('resolveBlinkActionHref resolves relative paths and interpolates parameters', () => {
  const href = resolveBlinkActionHref(
    'https://blinks.sola.ai/api/actions/game',
    '/api/actions/game?move={move}&amount={amount}',
    { move: 'attack', amount: '0.5' }
  );
  assert.equal(href, 'https://blinks.sola.ai/api/actions/game?move=attack&amount=0.5');
});

test('matchBlinkAction supports exact, partial, and default fallback matching', () => {
  const meta = {
    title: 'Sola Arena',
    description: 'Handsfree game blink',
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
  assert.equal(matchBlinkAction(meta)?.label, 'Join Match');
  assert.equal(matchBlinkAction(meta, 'nonexistent'), null);
});

test('HandsfreeBlinkRegistry registers, triggers, and cleans up custom handlers', async () => {
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
  assert.equal(res.message, 'Triggered for So11111111111111111111111111111111111111112');

  unregister();
  assert.equal(reg.has('game-1'), false);
  const missing = await reg.trigger('game-1', { blinkUrl: 'https://blinks.sola.ai/game' });
  assert.equal(missing.ok, false);
});
