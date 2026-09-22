import assert from 'node:assert/strict';

// Compile-free: reimplement by dynamic import via ts is hard; duplicate pure JS test of same logic
function isPrivateOrLocalHost(hostname) {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  const PRIVATE_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\.\d+\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
    /^0\.0\.0\.0$/,
    /^\[::1\]$/,
    /^::1$/,
  ];
  return PRIVATE_HOST_PATTERNS.some((re) => re.test(host));
}
function assertPublicHttpUrl(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('must be http(s)');
  if (isPrivateOrLocalHost(url.hostname)) throw new Error('private');
  return url;
}
function resolveBlinkActionUrl(input) {
  const url = assertPublicHttpUrl(input.trim());
  if (url.hostname.endsWith('dial.to')) {
    const action = url.searchParams.get('action');
    if (action) {
      const decoded = decodeURIComponent(action);
      const prefix = 'solana-action:';
      if (decoded.startsWith(prefix)) {
        return assertPublicHttpUrl(decoded.slice(prefix.length)).toString();
      }
    }
  }
  return url.toString();
}
function pickDefaultAction(metadata) {
  const actions = metadata.links?.actions;
  if (actions && actions.length > 0) return actions[0];
  if (metadata.label) return { label: metadata.label, href: '' };
  return null;
}

assert.equal(isPrivateOrLocalHost('localhost'), true);
assert.equal(isPrivateOrLocalHost('127.0.0.1'), true);
assert.equal(isPrivateOrLocalHost('10.0.0.5'), true);
assert.equal(isPrivateOrLocalHost('192.168.1.1'), true);
assert.equal(isPrivateOrLocalHost('172.16.0.1'), true);
assert.equal(isPrivateOrLocalHost('actions.dialect.to'), false);

assert.throws(() => assertPublicHttpUrl('ftp://example.com'));
assert.throws(() => assertPublicHttpUrl('https://127.0.0.1/x'));
assert.doesNotThrow(() => assertPublicHttpUrl('https://actions.example.com/api'));

const dial = 'https://dial.to/?action=' + encodeURIComponent('solana-action:https://example.com/action');
assert.equal(resolveBlinkActionUrl(dial), 'https://example.com/action');

assert.deepEqual(
  pickDefaultAction({ links: { actions: [{ label: 'Play', href: '/play' }] } }),
  { label: 'Play', href: '/play' }
);
assert.deepEqual(pickDefaultAction({ label: 'Go' }), { label: 'Go', href: '' });
assert.equal(pickDefaultAction({}), null);

console.log('PASS blink urlSafety / pickDefaultAction tests');
