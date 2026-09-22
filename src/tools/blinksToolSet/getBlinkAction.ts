import { z } from 'zod';
import { Tool } from 'ai';
import { ToolResult } from '@/types/tool';
import { BlinkAction, BlinkMetadata } from '@/types/blinks';
import { assertSafeActionUrl } from '@/lib/blinks';

const Parameters = z.object({
  url: z
    .string()
    .describe(
      'The Blink (Solana Action) URL shared by the user or embedded in a game, e.g. https://actions.example.com/api/mint'
    ),
});

interface ActionGetResponse {
  icon?: string;
  title?: string;
  description?: string;
  label?: string;
  disabled?: boolean;
  links?: {
    actions?: Array<{
      label: string;
      href: string;
      parameters?: Array<{
        name: string;
        label?: string;
        required?: boolean;
        type?: string;
      }>;
    }>;
  };
}

export function createGetBlinkActionTool() {
  const getBlinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.get' as const,
    description:
      "Loads a Blink (Solana Action) URL and returns its metadata (icon, title, description, and the list of available actions) so it can be rendered and initiated with Sola's own Blink component, instead of the default click-through Blink widget.",
    parameters: Parameters,
    execute: async ({ url }) => {
      let target: URL;
      try {
        target = assertSafeActionUrl(url);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid Blink URL',
          data: undefined,
        };
      }

      try {
        const response = await fetch(target.toString(), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Blink provider responded with status ${response.status}`,
            data: undefined,
          };
        }

        const body = (await response.json()) as ActionGetResponse;

        const actions: BlinkAction[] = body.links?.actions?.length
          ? body.links.actions.map((action) => ({
              label: action.label,
              href: action.href,
              parameters: action.parameters,
            }))
          : [{ label: body.label ?? 'Execute', href: target.toString() }];

        const metadata: BlinkMetadata = {
          kind: 'metadata',
          url: target.toString(),
          icon: body.icon,
          title: body.title ?? 'Blink Action',
          description: body.description,
          disabled: body.disabled ?? false,
          actions,
        };

        return {
          success: true,
          error: undefined,
          data: metadata,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to load the Blink action metadata',
          data: undefined,
        };
      }
    },
  };

  return getBlinkActionTool;
}
