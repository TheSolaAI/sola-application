export type ParsedBlinkSource =
  | 'game'
  | 'solana-action'
  | 'interstitial'
  | 'action';

export interface ParsedBlinkUrl {
  actionUrl: string;
  source: ParsedBlinkSource;
  gameId?: string;
  title?: string;
}

export type KnownBlinkLookup = (
  value: string
) => { id: string; title: string; url: string } | undefined;

const stripProtocolPrefix = (value: string, prefix: string) =>
  value.toLowerCase().startsWith(prefix) ? value.slice(prefix.length) : value;

export function parseBlinkUrl(
  input: string,
  lookupGame?: KnownBlinkLookup
): ParsedBlinkUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('A Blink URL or game name is required');
  }

  const knownGame = lookupGame?.(trimmed);
  if (knownGame) {
    return {
      actionUrl: knownGame.url,
      source: 'game',
      gameId: knownGame.id,
      title: knownGame.title,
    };
  }

  if (/^solana-action:/i.test(trimmed)) {
    const rest = stripProtocolPrefix(trimmed, 'solana-action:');
    if (!/^https?:\/\//i.test(rest)) {
      throw new Error('A valid Blink action URL is required');
    }
    return {
      actionUrl: rest,
      source: 'solana-action',
    };
  }

  if (/^solana:/i.test(trimmed)) {
    const rest = stripProtocolPrefix(trimmed, 'solana:');
    if (!/^https?:\/\//i.test(rest)) {
      throw new Error('A valid Blink action URL is required');
    }
    return {
      actionUrl: rest,
      source: 'solana-action',
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('A valid Blink action URL is required');
  }

  const interstitial = url.searchParams.get('action');
  if (interstitial) {
    const decoded = decodeURIComponent(interstitial);
    if (/^solana-action:/i.test(decoded)) {
      const rest = stripProtocolPrefix(decoded, 'solana-action:');
      if (!/^https?:\/\//i.test(rest)) {
        throw new Error('A valid Blink action URL is required');
      }
      return {
        actionUrl: rest,
        source: 'interstitial',
      };
    }
    if (/^https?:\/\//i.test(decoded)) {
      return {
        actionUrl: decoded,
        source: 'interstitial',
      };
    }
  }

  return {
    actionUrl: url.toString(),
    source: 'action',
  };
}

export interface ActionJsonRule {
  pathPattern: string;
  apiPath: string;
}

export function applyActionsJsonRules(
  websiteUrl: string,
  rules: ActionJsonRule[]
): string | null {
  const site = new URL(websiteUrl);

  for (const rule of rules) {
    const mapped = mapActionRule(site, rule);
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

const mapActionRule = (site: URL, rule: ActionJsonRule): string | null => {
  const pathname = site.pathname.replace(/\/$/, '') || '/';
  const pattern = rule.pathPattern.replace(/\/$/, '') || '/';

  if (pattern === '/**' || pattern === '*') {
    return resolveApiPath(site, rule.apiPath, pathname);
  }

  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3) || '/';
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length) || '/';
      const apiBase = rule.apiPath.endsWith('/**')
        ? rule.apiPath.slice(0, -3)
        : rule.apiPath;
      return resolveApiPath(site, `${apiBase}${rest}`, '');
    }
    return null;
  }

  if (pathname === pattern) {
    return resolveApiPath(site, rule.apiPath, '');
  }

  return null;
};

const resolveApiPath = (site: URL, apiPath: string, extraPath: string) => {
  const normalizedExtra = extraPath && extraPath !== '/' ? extraPath : '';
  const withExtra = apiPath.includes('**')
    ? apiPath.replace('/**', normalizedExtra || '')
    : `${apiPath}${normalizedExtra}`;

  const resolved = new URL(withExtra, site.origin);
  resolved.search = site.search;
  return resolved.toString();
};
