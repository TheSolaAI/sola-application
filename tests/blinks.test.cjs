const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Extract pure helper functions from src/tools/blinksToolSet/actions.ts for direct Node execution without TS build step
const actionsSource = fs.readFileSync(
  path.join(__dirname, '../src/tools/blinksToolSet/actions.ts'),
  'utf8'
);

function loadBlinkHelpers() {
  // Strip TypeScript type annotations and imports for pure runtime execution test
  const jsCode = actionsSource
    .replace(/^import\s+.*?;$/gm, '')
    .replace(/export\s+interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
    .replace(/const\s+InspectBlinkParameters[\s\S]*$/, '')
    .replace(/export\s+(async\s+)?function/g, '$1function')
    .replace(/:\s*typeof\s+fetch\s*=\s*fetch/g, ' = fetch')
    .replace(/:\s*Record<string,\s*string\s*\|\s*number>\s*=\s*\{\}/g, ' = {}')
    .replace(/:\s*Promise<\{[\s\S]*?\}>/g, '')
    .replace(/:\s*Promise<\w+>/g, '')
    .replace(/options:\s*\{[\s\S]*?\}/g, 'options')
    .replace(/Set<string>\(\)/g, 'Set()')
    .replace(/:\s*BlinkLinkedAction\[\]/g, '')
    .replace(/\?:\s*(string\s*\|\s*number|string|BlinkActionGetResponse|BlinkLinkedAction)/g, '')
    .replace(/:\s*(string\s*\|\s*number|string|BlinkActionGetResponse|BlinkLinkedAction)/g, '')
    .replace(/as\s+BlinkActionGetResponse/g, '')
    .replace(/as\s+BlinkActionPostResponse/g, '')
    .replace(/metadata!/g, 'metadata');

  const fn = new Function(
    `${jsCode}\nreturn { resolveActionUrl, normalizeBlinkActions, matchBlinkAction, interpolateActionHref, fetchBlinkMetadata, initiateBlinkAction };`
  );
  return fn();
}

const {
  resolveActionUrl,
  normalizeBlinkActions,
  matchBlinkAction,
  interpolateActionHref,
  fetchBlinkMetadata,
  initiateBlinkAction,
} = loadBlinkHelpers();

const SAMPLE_METADATA = {
  icon: 'https://solaai.xyz/game-icon.png',
  title: 'Sola Coin Flip',
  description: 'Flip a coin hands-free on Solana',
  label: 'Flip Now',
  links: {
    actions: [
      {
        href: '/api/actions/flip?side=heads&amount=0.1',
        label: 'Bet 0.1 SOL on Heads',
      },
      {
        href: '/api/actions/flip?side=tails&amount=0.1',
        label: 'Bet 0.1 SOL on Tails',
      },
      {
        href: '/api/actions/flip?side={side}&amount={amount}',
        label: 'Custom Flip',
        parameters: [
          { name: 'side', label: 'Side (heads/tails)', required: true },
          { name: 'amount', label: 'Amount in SOL', required: true },
        ],
      },
    ],
  },
};

test('resolveActionUrl normalizes solana-action:, blink:, and embedded action query URLs', () => {
  assert.equal(
    resolveActionUrl('solana-action:https%3A%2F%2Fgames.solaai.xyz%2Fapi%2Fflip'),
    'https://games.solaai.xyz/api/flip'
  );
  assert.equal(
    resolveActionUrl('blink:https://games.solaai.xyz/api/flip'),
    'https://games.solaai.xyz/api/flip'
  );
  assert.equal(
    resolveActionUrl(
      'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fgames.solaai.xyz%2Fapi%2Fflip'
    ),
    'https://games.solaai.xyz/api/flip'
  );
});

test('normalizeBlinkActions returns linked actions or falls back to root action', () => {
  const linked = normalizeBlinkActions(
    'https://games.solaai.xyz/api/flip',
    SAMPLE_METADATA
  );
  assert.equal(linked.length, 3);

  const fallback = normalizeBlinkActions('https://games.solaai.xyz/api/simple', {
    icon: 'https://solaai.xyz/icon.png',
    title: 'Simple Blink',
    description: 'Single action blink',
    label: 'Claim Reward',
  });
  assert.equal(fallback.length, 1);
  assert.equal(fallback[0].label, 'Claim Reward');
  assert.equal(fallback[0].href, 'https://games.solaai.xyz/api/simple');
});

test('matchBlinkAction selects action by label, partial label, href, or numeric index', () => {
  const baseUrl = 'https://games.solaai.xyz/api/flip';
  assert.equal(
    matchBlinkAction(baseUrl, SAMPLE_METADATA, 'Bet 0.1 SOL on Tails').label,
    'Bet 0.1 SOL on Tails'
  );
  assert.equal(
    matchBlinkAction(baseUrl, SAMPLE_METADATA, 'heads').label,
    'Bet 0.1 SOL on Heads'
  );
  assert.equal(
    matchBlinkAction(baseUrl, SAMPLE_METADATA, 2).label,
    'Bet 0.1 SOL on Tails'
  );
  assert.throws(
    () => matchBlinkAction(baseUrl, SAMPLE_METADATA, 'nonexistent'),
    /Could not match Blink action/
  );
});

test('interpolateActionHref substitutes template parameters and enforces required parameters', () => {
  const baseUrl = 'https://games.solaai.xyz/api/flip';
  const customAction = SAMPLE_METADATA.links.actions[2];

  const resolved = interpolateActionHref(baseUrl, customAction, {
    side: 'heads',
    amount: 0.5,
  });
  assert.equal(
    resolved,
    'https://games.solaai.xyz/api/actions/flip?side=heads&amount=0.5'
  );

  assert.throws(
    () => interpolateActionHref(baseUrl, customAction, { side: 'heads' }),
    /Missing required parameter "amount"/
  );
});

test('initiateBlinkAction performs GET + POST and returns serialized transaction for hands-free signing', async () => {
  const calls = [];
  const mockFetch = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body });
    if (init.method === 'GET') {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => SAMPLE_METADATA,
      };
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        transaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAA==',
        message: 'Placed 0.5 SOL on heads',
      }),
    };
  };

  const result = await initiateBlinkAction({
    actionUrl: 'solana-action:https://games.solaai.xyz/api/flip',
    account: 'B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump',
    actionSelector: 'Custom Flip',
    parameters: { side: 'heads', amount: 0.5 },
    fetchImpl: mockFetch,
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[1].method, 'POST');
  assert.equal(
    calls[1].url,
    'https://games.solaai.xyz/api/actions/flip?side=heads&amount=0.5'
  );
  assert.equal(result.actionLabel, 'Custom Flip');
  assert.equal(result.message, 'Placed 0.5 SOL on heads');
  assert.ok(result.transaction.length > 10);
});

test('Application wiring includes BlinkMessageItem and blinksToolSet across AI config and routes', () => {
  const componentSrc = fs.readFileSync(
    path.join(__dirname, '../src/components/messages/BlinkMessageItem.tsx'),
    'utf8'
  );
  const aiConfigSrc = fs.readFileSync(
    path.join(__dirname, '../src/config/ai.ts'),
    'utf8'
  );
  const chatRouteSrc = fs.readFileSync(
    path.join(__dirname, '../src/app/api/chat/route.ts'),
    'utf8'
  );
  const rendererSrc = fs.readFileSync(
    path.join(__dirname, '../src/lib/messageRenderer.tsx'),
    'utf8'
  );

  assert.match(componentSrc, /export const BlinkMessageItem/);
  assert.match(componentSrc, /initiateAction/);
  assert.match(aiConfigSrc, /blinksToolSet/);
  assert.match(chatRouteSrc, /getBlinksToolSet/);
  assert.match(rendererSrc, /BlinkMessageItem/);
});
