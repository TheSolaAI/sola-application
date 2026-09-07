import { BlockList, isIP } from 'node:net';

const PRIVATE_IPV4 = new BlockList();
PRIVATE_IPV4.addSubnet('0.0.0.0', 8, 'ipv4');
PRIVATE_IPV4.addSubnet('10.0.0.0', 8, 'ipv4');
PRIVATE_IPV4.addSubnet('100.64.0.0', 10, 'ipv4');
PRIVATE_IPV4.addSubnet('127.0.0.0', 8, 'ipv4');
PRIVATE_IPV4.addSubnet('169.254.0.0', 16, 'ipv4');
PRIVATE_IPV4.addSubnet('172.16.0.0', 12, 'ipv4');
PRIVATE_IPV4.addSubnet('192.0.0.0', 24, 'ipv4');
PRIVATE_IPV4.addSubnet('192.0.2.0', 24, 'ipv4');
PRIVATE_IPV4.addSubnet('192.168.0.0', 16, 'ipv4');
PRIVATE_IPV4.addSubnet('198.18.0.0', 15, 'ipv4');
PRIVATE_IPV4.addSubnet('198.51.100.0', 24, 'ipv4');
PRIVATE_IPV4.addSubnet('203.0.113.0', 24, 'ipv4');
PRIVATE_IPV4.addSubnet('224.0.0.0', 4, 'ipv4');
PRIVATE_IPV4.addSubnet('240.0.0.0', 4, 'ipv4');

const PRIVATE_IPV6 = new BlockList();
PRIVATE_IPV6.addAddress('::', 'ipv6');
PRIVATE_IPV6.addAddress('::1', 'ipv6');
PRIVATE_IPV6.addSubnet('fc00::', 7, 'ipv6');
PRIVATE_IPV6.addSubnet('fe80::', 10, 'ipv6');
PRIVATE_IPV6.addSubnet('ff00::', 8, 'ipv6');
PRIVATE_IPV6.addSubnet('2001:db8::', 32, 'ipv6');

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.',
  'metadata.google.internal',
  'metadata.google.internal.',
  'kubernetes',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

const BLOCKED_HOST_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.localdomain',
];

export class UnsafeBlinkUrlError extends Error {
  constructor(message = 'Unsafe Blink action URL') {
    super(message);
    this.name = 'UnsafeBlinkUrlError';
  }
}

export const normalizeHostname = (hostname: string) => {
  const host = hostname
    .replace(/^\[|\]$/g, '')
    .toLowerCase()
    .replace(/\.$/, '');
  const dottedMapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dottedMapped) {
    return dottedMapped[1];
  }

  const hexMapped = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);
    return `${(high >> 8) & 255}.${high & 255}.${(low >> 8) & 255}.${low & 255}`;
  }

  return host;
};

export const isBlockedIp = (address: string) => {
  const ip = normalizeHostname(address);
  const version = isIP(ip);

  if (version === 4) {
    return PRIVATE_IPV4.check(ip, 'ipv4');
  }

  if (version === 6) {
    return PRIVATE_IPV6.check(ip, 'ipv6');
  }

  return false;
};

export const isBlockedHostname = (hostname: string) => {
  const host = normalizeHostname(hostname);

  if (BLOCKED_HOSTNAMES.has(host)) {
    return true;
  }

  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return true;
  }

  if (isIP(host) && isBlockedIp(host)) {
    return true;
  }

  return false;
};

const isNonCanonicalIpHostname = (hostname: string) => {
  if (isIP(hostname)) return false;
  if (/^\d+$/.test(hostname)) return true;
  if (/^0x[0-9a-f]+$/i.test(hostname)) return true;
  if (/^\d+(?:\.\d+){1,3}$/.test(hostname)) return true;
  if (/(?:^|\.)0[0-7]{2,}(?:\.|$)/.test(hostname)) return true;
  return false;
};

export type LookupAll = (
  hostname: string
) => Promise<Array<{ address: string }>>;

export const parsePublicHttpUrl = (value: string) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new UnsafeBlinkUrlError('Blink action URL is invalid');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeBlinkUrlError('Blink action URL must use http or https');
  }

  if (url.username || url.password) {
    throw new UnsafeBlinkUrlError(
      'Blink action URL must not include credentials'
    );
  }

  const hostname = normalizeHostname(url.hostname);
  if (!hostname) {
    throw new UnsafeBlinkUrlError('Blink action URL is invalid');
  }

  if (isNonCanonicalIpHostname(hostname)) {
    throw new UnsafeBlinkUrlError();
  }

  if (isBlockedHostname(hostname)) {
    throw new UnsafeBlinkUrlError();
  }

  return { url, hostname };
};

export const assertSafeActionUrl = async (
  value: string,
  lookupAll?: LookupAll
) => {
  const { url, hostname } = parsePublicHttpUrl(value);

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new UnsafeBlinkUrlError();
    }
    return url;
  }

  if (!lookupAll) {
    return url;
  }

  const addresses = await lookupAll(hostname);
  if (!addresses.length) {
    throw new UnsafeBlinkUrlError('Unable to resolve Blink action host');
  }

  if (addresses.some(({ address }) => isBlockedIp(address))) {
    throw new UnsafeBlinkUrlError();
  }

  return url;
};
