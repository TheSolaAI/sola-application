import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertSafeActionUrl,
  isBlockedHostname,
  isBlockedIp,
  parsePublicHttpUrl,
} from './ssrf.ts';

describe('isBlockedIp', () => {
  it('blocks loopback, private, link-local, and metadata ranges', () => {
    assert.equal(isBlockedIp('127.0.0.1'), true);
    assert.equal(isBlockedIp('10.0.0.8'), true);
    assert.equal(isBlockedIp('192.168.1.1'), true);
    assert.equal(isBlockedIp('169.254.169.254'), true);
    assert.equal(isBlockedIp('172.16.5.1'), true);
    assert.equal(isBlockedIp('0.0.0.0'), true);
    assert.equal(isBlockedIp('100.64.0.1'), true);
    assert.equal(isBlockedIp('::1'), true);
    assert.equal(isBlockedIp('::ffff:127.0.0.1'), true);
    assert.equal(isBlockedIp('::ffff:7f00:1'), true);
  });

  it('allows public addresses', () => {
    assert.equal(isBlockedIp('8.8.8.8'), false);
    assert.equal(isBlockedIp('1.1.1.1'), false);
  });
});

describe('isBlockedHostname', () => {
  it('blocks localhost and internal names, not 10.example.com', () => {
    assert.equal(isBlockedHostname('localhost'), true);
    assert.equal(isBlockedHostname('metadata.google.internal'), true);
    assert.equal(isBlockedHostname('foo.local'), true);
    assert.equal(isBlockedHostname('10.example.com'), false);
    assert.equal(isBlockedHostname('127.foo.com'), false);
  });
});

describe('parsePublicHttpUrl', () => {
  it('rejects credentials, non-http schemes, and private hosts', () => {
    assert.throws(() => parsePublicHttpUrl('file:///etc/passwd'));
    assert.throws(() => parsePublicHttpUrl('javascript:alert(1)'));
    assert.throws(() => parsePublicHttpUrl('http://user:pass@example.com'));
    assert.throws(() => parsePublicHttpUrl('http://127.0.0.1/secret'));
    assert.throws(() => parsePublicHttpUrl('http://[::1]/'));
    assert.throws(() => parsePublicHttpUrl('http://2130706433/'));
    assert.throws(() => parsePublicHttpUrl('http://127.1/'));
    assert.throws(() => parsePublicHttpUrl('http://0x7f000001/'));
  });

  it('accepts public https URLs', () => {
    const { hostname } = parsePublicHttpUrl(
      'https://flip.sendarcade.fun/api/actions/website'
    );
    assert.equal(hostname, 'flip.sendarcade.fun');
  });
});

describe('assertSafeActionUrl', () => {
  it('rejects DNS results that resolve to a private address', async () => {
    await assert.rejects(
      () =>
        assertSafeActionUrl('https://evil.example', async () => [
          { address: '127.0.0.1' },
        ]),
      /Unsafe Blink action URL/
    );
  });

  it('allows DNS results that resolve only to public addresses', async () => {
    const url = await assertSafeActionUrl(
      'https://flip.sendarcade.fun/api/actions/website',
      async () => [{ address: '1.1.1.1' }]
    );
    assert.equal(url.hostname, 'flip.sendarcade.fun');
  });
});
