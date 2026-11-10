import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
  pattern?: string;
  patternDescription?: string;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: string }>;
}

export interface BlinkLinkedAction {
  href: string;
  label: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkActionGetResponse {
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: BlinkLinkedAction[];
  };
  error?: {
    message: string;
  };
}

export interface BlinkActionPostResponse {
  transaction: string;
  message?: string;
  links?: {
    next?: {
      type: string;
      href?: string;
      action?: BlinkActionGetResponse;
    };
  };
}

export interface BlinkExecutionResult {
  actionUrl: string;
  targetHref: string;
  actionLabel: string;
  account: string;
  transaction: string;
  message?: string;
  metadata?: BlinkActionGetResponse;
  parameters?: Record<string, string | number>;
}

/**
 * Normalizes a Solana Action / Blink URL (including `solana-action:` or `blink:` schemes
 * or embedded `action=` query params) into an HTTPS endpoint URL.
 */
export function resolveActionUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    throw new Error('Blink action URL is required');
  }

  if (trimmed.startsWith('solana-action:')) {
    return decodeURIComponent(trimmed.slice('solana-action:'.length));
  }

  if (trimmed.startsWith('blink:')) {
    return decodeURIComponent(trimmed.slice('blink:'.length));
  }

  const parsed = new URL(trimmed);
  const embeddedAction = parsed.searchParams.get('action');
  if (embeddedAction) {
    return resolveActionUrl(decodeURIComponent(embeddedAction));
  }

  return parsed.toString();
}

/**
 * Returns the normalized list of executable actions from a Blink GET metadata payload.
 */
export function normalizeBlinkActions(
  actionUrl: string,
  metadata: BlinkActionGetResponse
): BlinkLinkedAction[] {
  if (
    metadata.links &&
    Array.isArray(metadata.links.actions) &&
    metadata.links.actions.length > 0
  ) {
    return metadata.links.actions;
  }

  return [
    {
      href: actionUrl,
      label: metadata.label || metadata.title || 'Execute Action',
      parameters: [],
    },
  ];
}

/**
 * Matches a linked action by label (case-insensitive exact or partial match),
 * href, or 1-based / 0-based numeric index for hands-free voice or chat selection.
 */
export function matchBlinkAction(
  actionUrl: string,
  metadata: BlinkActionGetResponse,
  selector?: string | number
): BlinkLinkedAction {
  const actions = normalizeBlinkActions(actionUrl, metadata);
  if (actions.length === 0) {
    throw new Error('No executable actions available on this Blink');
  }

  if (selector === undefined || selector === null || selector === '') {
    return actions[0];
  }

  if (typeof selector === 'number' || /^\d+$/.test(String(selector).trim())) {
    const num = Number(selector);
    if (num >= 1 && num <= actions.length) {
      return actions[num - 1];
    }
    if (num >= 0 && num < actions.length) {
      return actions[num];
    }
  }

  const normalizedQuery = String(selector).trim().toLowerCase();

  const exactLabel = actions.find(
    (a) => a.label.trim().toLowerCase() === normalizedQuery
  );
  if (exactLabel) return exactLabel;

  const exactHref = actions.find(
    (a) => a.href.trim().toLowerCase() === normalizedQuery
  );
  if (exactHref) return exactHref;

  const partialMatch = actions.find(
    (a) =>
      a.label.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(a.label.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  throw new Error(
    `Could not match Blink action "${selector}". Available actions: ${actions
      .map((a) => a.label)
      .join(', ')}`
  );
}

/**
 * Interpolates `{param}` template variables in a Blink action `href` and validates
 * required parameters before initiating the POST request.
 */
export function interpolateActionHref(
  baseActionUrl: string,
  action: BlinkLinkedAction,
  values: Record<string, string | number> = {}
): string {
  const requiredParams = (action.parameters || []).filter((p) => p.required);
  for (const param of requiredParams) {
    const val = values[param.name];
    if (val === undefined || val === null || String(val).trim() === '') {
      throw new Error(
        `Missing required parameter "${param.name}" for Blink action "${action.label}"`
      );
    }
  }

  let targetHref = action.href;
  const usedKeys = new Set<string>();

  targetHref = targetHref.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    usedKeys.add(key);
    const val = values[key];
    if (val === undefined || val === null) {
      throw new Error(
        `Missing template parameter "${key}" for Blink action "${action.label}"`
      );
    }
    return encodeURIComponent(String(val));
  });

  const resolvedUrl = new URL(targetHref, resolveActionUrl(baseActionUrl));
  for (const [key, val] of Object.entries(values)) {
    if (!usedKeys.has(key) && val !== undefined && val !== null && val !== '') {
      resolvedUrl.searchParams.set(key, String(val));
    }
  }

  return resolvedUrl.toString();
}

/**
 * Fetches Solana Action / Blink metadata via GET.
 */
export async function fetchBlinkMetadata(
  rawUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<{
  actionUrl: string;
  metadata: BlinkActionGetResponse;
  actions: BlinkLinkedAction[];
}> {
  const actionUrl = resolveActionUrl(rawUrl);
  const response = await fetchImpl(actionUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Blink metadata (${response.status} ${response.statusText})`
    );
  }

  const metadata = (await response.json()) as BlinkActionGetResponse;
  const actions = normalizeBlinkActions(actionUrl, metadata);

  return {
    actionUrl,
    metadata,
    actions,
  };
}

/**
 * Custom initiator function that resolves a Blink action, interpolates parameters,
 * and sends the POST request with the user's Solana account to obtain a signable transaction.
 */
export async function initiateBlinkAction(options: {
  actionUrl: string;
  account: string;
  actionSelector?: string | number;
  parameters?: Record<string, string | number>;
  metadata?: BlinkActionGetResponse;
  fetchImpl?: typeof fetch;
}): Promise<BlinkExecutionResult> {
  const {
    actionUrl: rawUrl,
    account,
    actionSelector,
    parameters = {},
    fetchImpl = fetch,
  } = options;

  if (!account || !account.trim()) {
    throw new Error('Wallet public key (account) is required to execute a Blink');
  }

  const resolvedBaseUrl = resolveActionUrl(rawUrl);
  const metadata =
    options.metadata ||
    (await fetchBlinkMetadata(resolvedBaseUrl, fetchImpl)).metadata;

  if (metadata.disabled) {
    throw new Error(
      metadata.error?.message || `Blink "${metadata.title}" is currently disabled`
    );
  }

  const matchedAction = matchBlinkAction(
    resolvedBaseUrl,
    metadata,
    actionSelector
  );
  const targetHref = interpolateActionHref(
    resolvedBaseUrl,
    matchedAction,
    parameters
  );

  const postResponse = await fetchImpl(targetHref, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      account: account.trim(),
    }),
  });

  if (!postResponse.ok) {
    throw new Error(
      `Blink action execution failed (${postResponse.status} ${postResponse.statusText})`
    );
  }

  const payload = (await postResponse.json()) as BlinkActionPostResponse;
  if (!payload || !payload.transaction) {
    throw new Error('Blink endpoint did not return a serialized transaction');
  }

  return {
    actionUrl: resolvedBaseUrl,
    targetHref,
    actionLabel: matchedAction.label,
    account: account.trim(),
    transaction: payload.transaction,
    message: payload.message,
    metadata,
    parameters,
  };
}

const InspectBlinkParameters = z.object({
  actionUrl: z
    .string()
    .describe('The Solana Action / Blink URL to inspect and render.'),
});

const ExecuteBlinkParameters = z.object({
  actionUrl: z
    .string()
    .describe('The Solana Action / Blink URL to execute hands-free.'),
  actionSelector: z
    .string()
    .optional()
    .describe(
      'Label, href, or 1-based index of the Blink action to trigger (defaults to the primary action).'
    ),
  parameters: z
    .record(z.union([z.string(), z.number()]))
    .optional()
    .describe(
      'Key-value map of action parameters (e.g. amount, choice, target) for parameterized Blinks.'
    ),
});

export function createInspectBlinkTool(_context: ToolContext) {
  const inspectBlinkTool: Tool<typeof InspectBlinkParameters, ToolResult> = {
    id: 'blinks.inspectBlink' as const,
    description:
      'Fetches metadata and available actions for a Solana Blink (Blockchain Action) URL and renders the interactive hands-free Blink component.',
    parameters: InspectBlinkParameters,
    execute: async ({ actionUrl }) => {
      try {
        const {
          actionUrl: resolvedUrl,
          metadata,
          actions,
        } = await fetchBlinkMetadata(actionUrl);

        return {
          success: true,
          data: {
            mode: 'inspect',
            actionUrl: resolvedUrl,
            metadata,
            actions,
          },
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: `Unable to load Blink metadata: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          data: undefined,
        };
      }
    },
  };

  return inspectBlinkTool;
}

export function createExecuteBlinkActionTool(context: ToolContext) {
  const executeBlinkActionTool: Tool<typeof ExecuteBlinkParameters, ToolResult> =
    {
      id: 'blinks.executeBlinkAction' as const,
      description:
        'Initiates a Solana Blink (Blockchain Action) hands-free by matching the requested action label or index, filling parameters, and returning a serialized transaction ready for signing.',
      parameters: ExecuteBlinkParameters,
      execute: async ({ actionUrl, actionSelector, parameters }) => {
        if (!context.publicKey) {
          return {
            success: false,
            error: 'No wallet public key provided',
            data: undefined,
          };
        }

        try {
          const result = await initiateBlinkAction({
            actionUrl,
            account: context.publicKey,
            actionSelector,
            parameters,
          });

          return {
            success: true,
            data: {
              mode: 'execute',
              ...result,
              actions: normalizeBlinkActions(
                result.actionUrl,
                result.metadata!
              ),
            },
            error: undefined,
            signAndSend: true,
          };
        } catch (error) {
          return {
            success: false,
            error: `Unable to execute Blink action: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            data: undefined,
          };
        }
      },
    };

  return executeBlinkActionTool;
}
