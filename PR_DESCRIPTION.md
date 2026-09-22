# feat: make Blinks interaction handsfree (#157)

## Summary

Sola AI had no Blink-specific code at all yet (`grep -ri blink` across `src/`
and the `@sola-labs/ai-kit` package returns nothing) — any Blink URL a user
pasted fell through to the app's generic default renderer
(`messageRenderer.tsx`'s `default:` case, which just `JSON.stringify`s the
raw tool data). That's the "default way to render blinks" the issue refers
to: no custom UI, and no way for Sola AI to initiate a Blink action itself.

This PR adds Sola's own Blink component and a pair of AI tools that let the
assistant load and initiate a Blink (Solana Action) directly, without a
user needing to click through a third-party widget.

## Changes mapped to the issue's requirements

**"Implement an own functional component that has custom defined functions
to initiate the actions for the blinks."**
- `src/components/messages/BlinkActionMessageItem.tsx` — a new functional
  component that renders a Blink's icon/title/description and its
  available actions, and defines its own `triggerAction` function that
  builds the action's transaction (POST to the action href with the
  connected wallet's `account`), signs it with the connected wallet
  (`useWalletHandler`), and sends it via the app's existing
  `/api/wallet/sendTransaction` endpoint — the same signing path already
  used by `useChatMessages.ts` for every other transaction in the app. No
  third-party Blink widget/iframe is involved.

**"Extend the blinks ai config tool to trigger the custom functions."**
- `src/tools/blinksToolSet/` (new) — `getBlinkAction` (loads a Blink URL's
  metadata) and `executeBlinkAction` (the custom function that actually
  initiates an action: POSTs to the action's endpoint and returns a
  transaction). Wired into `src/app/api/chat/route.ts` alongside the
  existing always-on `generalTools`/`managementTools`.
- `src/config/ai.ts` — extended `TOOL_HANDLER_PRIME_DIRECTIVE` (the
  assistant's tool-use config) with a "Blinks hands-free flow" trigger:
  when the user shares a Blink URL, call `getBlinkAction`, and if there's
  a single unambiguous action, call `executeBlinkAction` immediately
  instead of asking the user to click anything. `executeBlinkAction`
  returns `signAndSend: true`, reusing the app's existing generic
  `sign_and_send_tx` auto-trigger (already used by swap/stake/transfer) so
  the transaction is signed and sent automatically — genuinely handsfree.
  Also extended the toolset-selector prompt
  (`getToolSetSelectorPrimeDirective`) so Blink requests are routed
  through to the tool-enabled assistant instead of being answered as a
  plain text fallback.

## Other files touched

- `src/lib/messageRenderer.tsx` — routes `getBlinkAction` and
  `executeBlinkAction` tool results to `BlinkActionMessageItem`.
- `src/lib/blinks.ts` (new) — shared helpers: `assertSafeActionUrl`
  (rejects non-https and obviously-internal hosts before the server makes
  a request to a user-supplied URL), `resolveActionHref`,
  `applyActionParameters`.
- `src/types/blinks.ts` (new) — `BlinkAction`, `BlinkMetadata`,
  `BlinkPreparedAction` types.

## Existing click-based flows

Nothing in the default `SimpleMessageItem`/`messageRenderer.tsx` fallback
path, `route.ts`'s existing tool merging, or any other tool/component was
modified — only additive cases/imports/merges. Every other message type's
rendering is unchanged.

## Known scope boundaries (called out rather than silently skipped)

- `BlinkActionMessageItem`'s manual click path runs the action with no
  extra parameters; the AI-driven `executeBlinkAction` tool does accept a
  `parameters` map (the assistant can ask the user for values
  conversationally). A generic dynamic parameter-input form in the
  component would be a reasonable follow-up but felt like scope creep for
  this bounty.
- `assertSafeActionUrl`'s host check is a literal hostname/IP guard
  (blocks `localhost`, loopback, RFC1918 ranges, `https:`-only) against
  obviously-internal targets — it is not full DNS-rebinding protection.
- Multi-step/chained actions (`links.next` in the Actions spec) are not
  auto-chained; `executeBlinkAction` returns the immediate result, and the
  assistant can call it again for a follow-up step within its existing
  `maxSteps: 8` tool loop.

## Verification performed

- Cloned `TheSolaAI/sola-application` and confirmed there is no existing
  Blink code anywhere in the app or in the `@sola-labs/ai-kit` package
  (inspected via `npm pack`, no `npm install`/build was run against the
  untrusted repo — see notes).
- Traced the existing handsfree pattern end-to-end (`swapTokens.ts` →
  `signAndSend: true` → `TOOL_HANDLER_PRIME_DIRECTIVE`'s existing trigger →
  `sign_and_send_tx` → `useChatMessages.ts`'s `handleSignTransaction` →
  `/api/wallet/sendTransaction`) and reused it exactly for
  `executeBlinkAction`, instead of inventing a parallel mechanism.
- Manually reviewed every new/changed file against the exact conventions
  of sibling files (`swapTokens.ts`, `commonToolSet/index.ts`,
  `NativeStakeMessageItem.tsx`, `messageRenderer.tsx`) for type shapes,
  import paths, and store usage.
- Did not run `npm install`/`next build`/`tsc` — see `NOTES.md` for why,
  and for what a maintainer should run before merging.
