import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BLINKGAMES,
  matchBlinkLinkedAction,
  resolveBlinkActionHref,
} from '../../../config/blinks/games';
import {
  createGetBlinksTool,
  executeGetBlinksTool,
} from '../getBlinks';

test('resolveBlinkActionHref interpolates placeholders and resolves relative URLs', () => {
  const baseUrl = BLINKGAMES.coinflip;
  const resolved = resolveBlinkActionHref(
    baseUrl,
    '/api/actions/flip?side={choice}&bet={amount}',
    { choice: 'heads', amount: 0.25 }
  );
  assert.equal(
    resolved,
    'https://flip.sendarcade.fun/api/actions/flip?side=heads&bet=0.25'
  );
});

test('matchBlinkLinkedAction selects matching action by label or href', () => {
  const metadata = {
    icon: 'https://example.com/icon.png',
    title: 'Rock Paper Scissors',
    description: 'Play RPS on Solana',
    label: 'Play',
    links: {
      actions: [
        { href: '/api/rps?move=rock', label: 'Play Rock' },
        { href: '/api/rps?move=paper', label: 'Play Paper' },
        { href: '/api/rps?move=scissors', label: 'Play Scissors' },
      ],
    },
  };

  const matched = matchBlinkLinkedAction(metadata, 'paper');
  assert.ok(matched);
  assert.equal(matched?.href, '/api/rps?move=paper');
});

test('executeGetBlinksTool builds handsfree execution payload when actionLabel or parameters provided', () => {
  const toolDef = createGetBlinksTool();
  assert.ok(toolDef.description.includes('handsfree'));

  const res = executeGetBlinksTool({
    actionName: 'coinflip',
    actionLabel: 'heads',
    parameters: { amount: 0.1 },
  });

  assert.equal(res.success, true);
  assert.equal(res.data.actionName, 'coinflip');
  assert.equal(res.data.actionUrl, BLINKGAMES.coinflip);
  assert.equal(res.data.command, 'execute');
  assert.equal(res.data.autoExecute, true);
  assert.deepEqual(res.data.parameters, { amount: 0.1 });
});

test('executeGetBlinksTool defaults to render command when no handsfree action args are passed', () => {
  const res = executeGetBlinksTool({
    actionName: 'snake',
  });

  assert.equal(res.success, true);
  assert.equal(res.data.command, 'render');
  assert.equal(res.data.autoExecute, false);
});
