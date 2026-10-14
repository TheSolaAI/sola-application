import { z } from 'zod';
import type { ToolResult } from '../../types/tool';

// The games supported by the original Blinks integration.
export const BLINK_GAMES = {
  snake: 'https://snakes.sendarcade.fun/api/actions/game',
  coinflip: 'https://flip.sendarcade.fun/api/actions/website',
  rockpaperscissors:
    'https://rps.catoff.xyz/api/actions/create-rock-paper-scissors?clusterurl=mainnet',
} as const;

export const getBlinksParameters = z.object({
  actionName: z.enum(['coinflip', 'snake', 'rockpaperscissors']),
});

export const executeBlinkParameters = getBlinksParameters.extend({
  actionIndex: z
    .number()
    .int()
    .nonnegative()
    .describe('Zero-based action index returned by getBlinks'),
  parameters: z
    .record(z.string())
    .describe('Parameter names and values supplied by the user'),
});

const linkedActionSchema = z.object({
  type: z.string().optional(),
  label: z.string(),
  href: z.string(),
  parameters: z
    .array(
      z
        .object({
          name: z.string(),
          label: z.string().optional(),
          required: z.boolean().optional(),
        })
        .passthrough()
    )
    .optional(),
});

const blinkSchema = z.object({
  title: z.string(),
  description: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
  error: z.object({ message: z.string() }).optional(),
  links: z.object({ actions: z.array(linkedActionSchema) }).optional(),
});

export interface BlinkData {
  actionName: z.infer<typeof getBlinksParameters>['actionName'];
  url: string;
  title: string;
  description: string;
  disabled?: boolean;
  error?: { message: string };
  actions: z.infer<typeof linkedActionSchema>[];
}

export async function getBlink(args: unknown): Promise<BlinkData> {
  const { actionName } = getBlinksParameters.parse(args);
  const url = BLINK_GAMES[actionName];
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Unable to load Blink (${response.status})`);
  const blink = blinkSchema.parse(await response.json());
  return {
    actionName,
    url,
    title: blink.title,
    description: blink.description,
    disabled: blink.disabled,
    error: blink.error,
    actions: blink.links?.actions ?? [{ label: blink.label, href: url }],
  };
}

export async function executeBlink(
  args: unknown,
  account: string | undefined,
  signTransaction: (args: { transactionHash: string }) => Promise<ToolResult>
): Promise<ToolResult> {
  const input = executeBlinkParameters.parse(args);
  if (!account) throw new Error('Please connect your wallet');
  const blink = await getBlink(input);
  if (blink.disabled || blink.error) {
    throw new Error(blink.error?.message || 'This Blink is disabled');
  }
  const action = blink.actions[input.actionIndex];
  if (!action) throw new Error('Invalid Blink action index');
  if (action.type && action.type !== 'transaction') {
    throw new Error('Only transaction Blink actions are supported');
  }
  for (const parameter of action.parameters ?? []) {
    if (parameter.required && !input.parameters[parameter.name]?.trim()) {
      throw new Error(`Missing parameter: ${parameter.name}`);
    }
  }
  const href = action.href.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = input.parameters[name];
    if (!value?.trim()) throw new Error(`Missing parameter: ${name}`);
    return encodeURIComponent(value);
  });
  const url = new URL(href, blink.url);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Invalid Blink action URL');
  }
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account }),
  });
  if (!response.ok) throw new Error(`Blink action failed (${response.status})`);
  const transaction = z
    .object({
      transaction: z.string().min(1),
    })
    .parse(await response.json());
  // Reuse the application's wallet approval and submission flow.
  return signTransaction({ transactionHash: transaction.transaction });
}

export async function handleBlinkToolCall(
  toolName: 'getBlinks' | 'executeBlink',
  args: unknown,
  account: string | undefined,
  signTransaction: (args: { transactionHash: string }) => Promise<ToolResult>
): Promise<ToolResult> {
  try {
    if (toolName === 'getBlinks') {
      return { success: true, data: await getBlink(args) };
    }
    return await executeBlink(args, account, signTransaction);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Blink action failed',
    };
  }
}
