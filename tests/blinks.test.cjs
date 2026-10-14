const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test, afterEach } = require('node:test');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Run the isolated TypeScript handlers using the project's existing compiler.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  module._compile(outputText, filename);
};

const {
  BLINK_GAMES,
  handleBlinkToolCall,
} = require('../src/tools/blinksToolSet/actions.ts');
const { getBlinksToolSet } = require('../src/tools/blinksToolSet/index.ts');
const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

const metadata = {
  title: 'Coin flip',
  description: 'Choose your side',
  label: 'Play',
  links: {
    actions: [
      {
        label: 'Heads',
        href: '/api/play?side=heads&amount={amount}',
        parameters: [{ name: 'amount', required: true }],
      },
      {
        label: 'Tails',
        href: '/api/play?side=tails&amount={amount}',
        parameters: [{ name: 'amount', required: true }],
      },
    ],
  },
};
const args = {
  actionName: 'coinflip',
  actionIndex: 1,
  parameters: { amount: '1&other=2' },
};
const signed = {
  success: true,
  data: { transactionDetails: { signature: 'test-signature' } },
};
const unexpectedSign = () => {
  assert.fail('Must not request a wallet signature');
};
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status });

test('custom card renders actions and inputs without executing on mount or replay', () => {
  const filename = path.resolve(
    __dirname,
    '../src/components/messages/BlinkMessageItem.tsx'
  );
  const componentModule = new Module(filename, module);
  componentModule.filename = filename;
  componentModule.paths = module.paths;
  componentModule.require = (id) =>
    id === '@/providers/ChatContextProvider'
      ? {
          useChat: () => ({
            isLoading: false,
            processMessage: () => assert.fail('Must not execute on render'),
          }),
        }
      : require(id);
  componentModule._compile(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    filename
  );
  const { BlinkMessageItem } = componentModule.exports;
  const props = {
    ...metadata,
    actionName: 'coinflip',
    url: BLINK_GAMES.coinflip,
    actions: metadata.links.actions,
  };
  for (let replay = 0; replay < 2; replay++) {
    const html = renderToStaticMarkup(
      React.createElement(BlinkMessageItem, { props })
    );
    assert.match(html, /flip.sendarcade.fun/);
    assert.match(html, /Heads/);
    assert.match(html, /Tails/);
    assert.equal((html.match(/<input/g) ?? []).length, 2);
  }
  const disabledHtml = renderToStaticMarkup(
    React.createElement(BlinkMessageItem, {
      props: { ...props, disabled: true, error: { message: 'Game closed' } },
    })
  );
  assert.equal((disabledHtml.match(/disabled=""/g) ?? []).length, 2);
  assert.match(disabledHtml, /role="alert">Game closed/);
});

test('tool configuration exposes both client functions and validates arguments', () => {
  const { slug, tools } = getBlinksToolSet();
  assert.equal(slug, 'blinks');
  assert.equal(tools.getBlinks.execute, undefined);
  assert.equal(tools.executeBlink.execute, undefined);
  assert.equal(
    tools.getBlinks.parameters.safeParse({ actionName: 'unknown' }).success,
    false
  );
  assert.equal(
    tools.executeBlink.parameters.safeParse({ ...args, actionIndex: -1 })
      .success,
    false
  );
});

test('loads each supported game without a wallet or transaction side effects', async () => {
  for (const [actionName, url] of Object.entries(BLINK_GAMES)) {
    global.fetch = async (requested, options) => {
      assert.equal(requested, url);
      assert.equal(options, undefined);
      return json(metadata);
    };
    const result = await handleBlinkToolCall(
      'getBlinks',
      { actionName },
      undefined,
      unexpectedSign
    );
    assert.equal(result.success, true);
    assert.equal(result.data.actionName, actionName);
    assert.equal(result.data.actions[1].label, 'Tails');
  }
});

test('voice tool selects the requested action, encodes inputs, and uses wallet approval', async () => {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return json(options ? { transaction: 'encoded-transaction' } : metadata);
  };
  let signatures = 0;
  const result = await handleBlinkToolCall(
    'executeBlink',
    args,
    'wallet-address',
    async (input) => {
      signatures++;
      assert.deepEqual(input, { transactionHash: 'encoded-transaction' });
      return signed;
    }
  );
  assert.deepEqual(result, signed);
  assert.equal(signatures, 1);
  assert.equal(requests.length, 2);
  assert.equal(
    requests[1].url,
    'https://flip.sendarcade.fun/api/play?side=tails&amount=1%26other%3D2'
  );
  assert.equal(requests[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    account: 'wallet-address',
  });
});

test('supports an action without linked buttons', async () => {
  const { links, ...simple } = metadata;
  global.fetch = async (url, options) => {
    assert.equal(url, BLINK_GAMES.coinflip);
    return json(options ? { transaction: 'transaction' } : simple);
  };
  const result = await handleBlinkToolCall(
    'executeBlink',
    { ...args, actionIndex: 0, parameters: {} },
    'wallet',
    async () => signed
  );
  assert.deepEqual(result, signed);
});

test('missing wallet and invalid game fail before any request', async () => {
  global.fetch = () => assert.fail('Must not fetch');
  const missingWallet = await handleBlinkToolCall(
    'executeBlink',
    args,
    undefined,
    unexpectedSign
  );
  assert.match(missingWallet.error, /connect your wallet/);
  const invalidGame = await handleBlinkToolCall(
    'getBlinks',
    { actionName: '__proto__' },
    'wallet',
    unexpectedSign
  );
  assert.equal(invalidGame.success, false);
});

test('disabled, invalid, unsupported, and incomplete actions never POST or sign', async () => {
  const cases = [
    [{ ...metadata, disabled: true }, args, /disabled/],
    [{ ...metadata, error: { message: 'Game closed' } }, args, /Game closed/],
    [metadata, { ...args, actionIndex: 5 }, /Invalid Blink action/],
    [metadata, { ...args, parameters: {} }, /Missing parameter/],
    [
      {
        ...metadata,
        links: { actions: [{ label: 'Bad', href: 'http://example.com' }] },
      },
      { ...args, actionIndex: 0 },
      /Invalid Blink action URL/,
    ],
    [
      {
        ...metadata,
        links: {
          actions: [
            {
              label: 'External',
              href: 'https://example.com',
              type: 'external-link',
            },
          ],
        },
      },
      { ...args, actionIndex: 0 },
      /Only transaction/,
    ],
  ];
  for (const [body, input, expected] of cases) {
    global.fetch = async (_url, options) => {
      assert.equal(options, undefined);
      return json(body);
    };
    const result = await handleBlinkToolCall(
      'executeBlink',
      input,
      'wallet',
      unexpectedSign
    );
    assert.equal(result.success, false);
    assert.match(result.error, expected);
  }
});

test('network errors, bad metadata, POST errors, and malformed transactions are reported', async () => {
  for (const response of [
    () => {
      throw new Error('Offline');
    },
    () => json({}, 503),
    () => json({}),
  ]) {
    global.fetch = response;
    assert.equal(
      (
        await handleBlinkToolCall(
          'getBlinks',
          { actionName: 'coinflip' },
          undefined,
          unexpectedSign
        )
      ).success,
      false
    );
  }
  for (const response of [
    () => json({}, 500),
    () => json({}),
    () => json({ transaction: '' }),
  ]) {
    global.fetch = async (_url, options) =>
      options ? response() : json(metadata);
    assert.equal(
      (
        await handleBlinkToolCall(
          'executeBlink',
          args,
          'wallet',
          unexpectedSign
        )
      ).success,
      false
    );
  }
});

test('wallet rejection or submission failure is returned without retrying', async () => {
  for (const sign of [
    async () => {
      throw new Error('Rejected');
    },
    async () => ({ success: false, error: 'Submission failed' }),
  ]) {
    let posts = 0;
    global.fetch = async (_url, options) => {
      if (options) posts++;
      return json(options ? { transaction: 'transaction' } : metadata);
    };
    const result = await handleBlinkToolCall(
      'executeBlink',
      args,
      'wallet',
      sign
    );
    assert.equal(result.success, false);
    assert.match(result.error, /Rejected|Submission failed/);
    assert.equal(posts, 1);
  }
});
