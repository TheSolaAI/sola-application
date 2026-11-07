import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  BlinkActionLink,
  BlinkActionMetadata,
  BlinkActionToolData,
  BlinkExecutionRequest,
  BlinkTransactionResponse,
} from '@/types/blinks';

// Standard Solana Actions HTTP headers required by compliant Blink action servers.
const BLINK_ACTION_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const ExecuteBlinkParameters = z.object({
  actionUrl: z
    .string()
    .describe(
      'The Solana Blink URL, solana-action URI, or dialect interstitial link to inspect or execute.'
    ),
  actionLabel: z
    .string()
    .optional()
    .describe(
      'Optional label of the specific linked action button to trigger handsfree.'
    ),
  actionHref: z
    .string()
    .optional()
    .describe(
      'Optional explicit action href endpoint to execute when a multi-action Blink is targeted.'
    ),
  parameters: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional()
    .describe(
      'Key-value parameter map used to populate template placeholders in parameterized Blink actions.'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'When true, immediately initiates the Blink POST transaction for handsfree signing.'
    ),
});

export type ExecuteBlinkArgs = z.infer<typeof ExecuteBlinkParameters>;

export interface BlinksToolContext extends ToolContext {
  walletPublicKey?: string;
}

export interface ParameterizedUrlInput {
  baseActionUrl: string;
  href?: string;
  parameters?: Record<string, string | number>;
}

/**
 * Unwraps Dialect interstitial URLs and solana-action protocol prefixes into
 * a direct HTTPS endpoint compatible with the Solana Actions specification.
 */
export function resolveBlinkActionUrl(target: { actionUrl: string }): string {
  const trimmed = target.actionUrl.trim();
  if (trimmed.startsWith('solana-action:')) {
    return decodeURIComponent(trimmed.slice('solana-action:'.length));
  }
  if (trimmed.startsWith('blink:')) {
    return decodeURIComponent(trimmed.slice('blink:'.length));
  }

  try {
    const parsed = new URL(trimmed);
    const embeddedAction = parsed.searchParams.get('action');
    if (embeddedAction) {
      return resolveBlinkActionUrl({
        actionUrl: decodeURIComponent(embeddedAction),
      });
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Resolves relative action href paths against the origin of the parent Blink URL
 * and substitutes template placeholders such as {amount} with user parameters.
 */
export function buildParameterizedActionUrl(
  request: ParameterizedUrlInput
): string {
  const normalizedBase = resolveBlinkActionUrl({
    actionUrl: request.baseActionUrl,
  });
  const rawTarget = request.href ?? normalizedBase;
  const parameterEntries = Object.entries(request.parameters ?? {});
  const interpolated = parameterEntries.reduce(
    (acc, [key, value]) =>
      acc.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    rawTarget
  );

  try {
    return new URL(interpolated, normalizedBase).toString();
  } catch {
    return interpolated;
  }
}

/**
 * Queries a Solana Action endpoint via HTTP GET to retrieve its Blink metadata,
 * including available action buttons and required input parameters.
 */
export async function fetchBlinkMetadata(target: {
  actionUrl: string;
}): Promise<BlinkActionMetadata> {
  const endpoint = resolveBlinkActionUrl(target);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: BLINK_ACTION_HEADERS,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Blink metadata (${response.status} ${response.statusText})`
    );
  }

  return (await response.json()) as BlinkActionMetadata;
}

/**
 * Initiates a Solana Action transaction by sending the active wallet public key
 * to the resolved Blink POST endpoint, returning the base64 serialized transaction.
 */
export async function initiateBlinkTransaction(
  request: BlinkExecutionRequest
): Promise<BlinkTransactionResponse> {
  const targetEndpoint = buildParameterizedActionUrl({
    baseActionUrl: request.actionUrl,
    href: request.actionUrl,
    parameters: request.parameters,
  });

  const response = await fetch(targetEndpoint, {
    method: 'POST',
    headers: BLINK_ACTION_HEADERS,
    body: JSON.stringify({ account: request.account }),
  });

  if (!response.ok) {
    throw new Error(
      `Blink action execution failed (${response.status} ${response.statusText})`
    );
  }

  const payload = (await response.json()) as BlinkTransactionResponse;
  if (!payload.transaction) {
    throw new Error('Blink endpoint did not return a signable transaction');
  }

  return payload;
}

/**
 * Selects the best matching action link from Blink metadata using either an
 * explicit href or a case-insensitive label match for voice-driven invocation.
 */
export function selectMatchingBlinkAction(
  metadata: BlinkActionMetadata,
  criteria: { actionHref?: string; actionLabel?: string }
): BlinkActionLink | undefined {
  const actions = metadata.links?.actions ?? [];
  if (criteria.actionHref) {
    return actions.find((item) => item.href === criteria.actionHref);
  }
  if (criteria.actionLabel) {
    const normalizedTarget = criteria.actionLabel.toLowerCase();
    return actions.find((item) =>
      item.label.toLowerCase().includes(normalizedTarget)
    );
  }
  return actions[0];
}

function isReadyForImmediateExecution(
  data: BlinkActionToolData,
  context: BlinksToolContext
): boolean {
  const walletAddress = context.publicKey ?? context.walletPublicKey;
  if (data.autoExecute === false || !walletAddress) {
    return false;
  }
  if (data.metadata.disabled) {
    return false;
  }
  return !/\{[^}]+\}/.test(data.selectedActionHref ?? '');
}

function buildBlinkToolData(
  metadata: BlinkActionMetadata,
  params: ExecuteBlinkArgs
): BlinkActionToolData {
  const normalizedUrl = resolveBlinkActionUrl({ actionUrl: params.actionUrl });
  const matchedLink = selectMatchingBlinkAction(metadata, {
    actionHref: params.actionHref,
    actionLabel: params.actionLabel,
  });
  const candidateHref =
    params.actionHref ?? matchedLink?.href ?? normalizedUrl;
  const resolvedHref = buildParameterizedActionUrl({
    baseActionUrl: normalizedUrl,
    href: candidateHref,
    parameters: params.parameters,
  });

  return {
    actionUrl: normalizedUrl,
    metadata,
    selectedActionHref: resolvedHref,
    selectedActionLabel: matchedLink?.label ?? metadata.label,
    parameters: params.parameters,
    autoExecute: params.autoExecute,
  };
}

async function executeHandsfreeBlinkFlow(
  params: ExecuteBlinkArgs,
  context: BlinksToolContext
): Promise<ToolResult> {
  const metadata = await fetchBlinkMetadata({ actionUrl: params.actionUrl });
  const baseData = buildBlinkToolData(metadata, params);
  const walletAddress = context.publicKey ?? context.walletPublicKey;

  if (!isReadyForImmediateExecution(baseData, context) || !walletAddress) {
    return {
      success: true,
      data: baseData,
      error: undefined,
    };
  }

  const txResponse = await initiateBlinkTransaction({
    actionUrl: baseData.selectedActionHref ?? baseData.actionUrl,
    account: walletAddress,
    parameters: params.parameters,
  });

  return {
    success: true,
    data: {
      ...baseData,
      transactionHash: txResponse.transaction,
      message: txResponse.message,
    },
    error: undefined,
    signAndSend: true,
  } as ToolResult;
}

export function createExecuteBlinkActionTool(context: BlinksToolContext = {}) {
  const executeBlinkActionTool: Tool<typeof ExecuteBlinkParameters, ToolResult> =
    {
      id: 'blinks.executeAction' as const,
      description:
        'Inspects and executes a Solana Blink (Blockchain Link) or Solana Action URL handsfree. Fetches action metadata and initiates the signable Solana transaction automatically when parameters are satisfied.',
      parameters: ExecuteBlinkParameters,
      execute: async (params) => {
        try {
          return await executeHandsfreeBlinkFlow(params, context);
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Unable to execute Solana Blink action',
            data: undefined,
          };
        }
      },
    };

  return executeBlinkActionTool;
}
