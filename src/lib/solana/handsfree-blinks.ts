/**
 * Hands-Free Solana Blinks (Blockchain Links / Solana Actions) Executor for Sola AI
 * Bounty: TheSolaAI/sola-application #157 ($70 USD — Make Solana Blinks Interaction Handsfree)
 *
 * Enables Sola AI voice/conversational agents to inspect any Solana Action / Blink URL,
 * match spoken/natural-language intent parameters against `links.actions`, build the
 * unsigned base64 transaction via POST, and trigger hands-free wallet signing & broadcast.
 */

export interface SolanaActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
}

export interface SolanaLinkedAction {
  href: string;
  label: string;
  parameters?: SolanaActionParameter[];
}

export interface SolanaActionGetResponse {
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: SolanaLinkedAction[];
  };
}

export interface SolanaActionPostResponse {
  transaction: string; // base64 serialized transaction
  message?: string;
}

export class HandsfreeBlinkExecutor {
  private readonly fetchImpl: typeof fetch;
  private readonly signAndSendTransaction: (base64Tx: string) => Promise<string>;

  constructor(options: {
    signAndSendTransaction: (base64Tx: string) => Promise<string>;
    fetchImpl?: typeof fetch;
  }) {
    this.signAndSendTransaction = options.signAndSendTransaction;
    this.fetchImpl = options.fetchImpl || globalThis.fetch;
  }

  /**
   * Unwrap `solana-action:` or interstitial dial.to / blink URLs into the raw Action endpoint.
   */
  static resolveActionUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('solana-action:')) {
      return trimmed.slice('solana-action:'.length);
    }
    try {
      const parsed = new URL(trimmed);
      const actionParam = parsed.searchParams.get('action');
      if (actionParam) {
        return HandsfreeBlinkExecutor.resolveActionUrl(decodeURIComponent(actionParam));
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  /**
   * Fetch Solana Action metadata (`GET` with `Accept: application/json`).
   */
  async fetchActionMetadata(blinkUrl: string): Promise<SolanaActionGetResponse> {
    const endpoint = HandsfreeBlinkExecutor.resolveActionUrl(blinkUrl);
    const res = await this.fetchImpl(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Solana Action metadata (${res.status}) from ${endpoint}`);
    }
    return (await res.json()) as SolanaActionGetResponse;
  }

  /**
   * Match a voice/AI intent (e.g. `{ actionLabel: "Swap", params: { amount: "1.5" } }`)
   * against the Blink's `links.actions` templates and interpolate `{param}` placeholders.
   */
  static resolveActionHref(
    baseBlinkUrl: string,
    metadata: SolanaActionGetResponse,
    intent: { actionLabel?: string; params?: Record<string, string | number> } = {}
  ): string {
    const baseEndpoint = HandsfreeBlinkExecutor.resolveActionUrl(baseBlinkUrl);
    const actions = metadata.links?.actions || [];
    if (actions.length === 0) {
      return baseEndpoint;
    }

    const queryLabel = (intent.actionLabel || '').toLowerCase();
    const matched =
      actions.find((a) => a.label.toLowerCase().includes(queryLabel)) || actions[0];

    let href = matched.href;
    const params = intent.params || {};
    for (const [key, val] of Object.entries(params)) {
      href = href.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(String(val)));
    }

    return new URL(href, baseEndpoint).toString();
  }

  /**
   * Execute a Solana Blink 100% hands-free from voice/AI agent parameters:
   * 1. Fetch GET Action metadata
   * 2. Resolve action template & interpolate spoken parameters
   * 3. POST `{ account }` to obtain the base64 Solana transaction
   * 4. Sign & broadcast via `signAndSendTransaction`
   */
  async executeHandsfree(options: {
    blinkUrl: string;
    walletAccount: string;
    actionLabel?: string;
    params?: Record<string, string | number>;
  }): Promise<{
    title: string;
    resolvedPostUrl: string;
    signature: string;
    message?: string;
  }> {
    const metadata = await this.fetchActionMetadata(options.blinkUrl);
    if (metadata.disabled) {
      throw new Error(`Solana Blink "${metadata.title}" is currently disabled`);
    }

    const postUrl = HandsfreeBlinkExecutor.resolveActionHref(options.blinkUrl, metadata, {
      actionLabel: options.actionLabel,
      params: options.params,
    });

    const postRes = await this.fetchImpl(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ account: options.walletAccount }),
    });

    const postData = (await postRes.json().catch(() => ({}))) as SolanaActionPostResponse & { message?: string };
    if (!postRes.ok || !postData.transaction) {
      throw new Error(postData.message || `Solana Action POST failed (${postRes.status})`);
    }

    const signature = await this.signAndSendTransaction(postData.transaction);

    return {
      title: metadata.title,
      resolvedPostUrl: postUrl,
      signature,
      message: postData.message,
    };
  }
}
