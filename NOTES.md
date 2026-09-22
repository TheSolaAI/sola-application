# Working notes for issue TheSolaAI/sola-application#157

## What's in this folder

- `handsfree-blinks.patch` — unified diff of all changes, generated with
  `git diff --cached` against a fresh clone of `TheSolaAI/sola-application`
  at commit `eb93533591781b2e7920ad7c488f644b0bceba76` (`main`, pulled
  2026-09-22/23).
- `PR_DESCRIPTION.md` — the PR description, mapping every "Required" bullet
  in the issue to the specific files/functions that satisfy it.
- `src/` — the new/changed files in-place (mirrors the repo's own path
  layout) so they can be diffed or copied directly into a checkout.

To apply: `git apply handsfree-blinks.patch` from the root of a
`sola-application` checkout at (or reasonably close to) the commit above.

## Why this bounty needed real investigation before writing code

The issue text assumes there's "the default way to render blinks" already
in the app. There isn't — `grep -ri blink` across `src/` and across the
`@sola-labs/ai-kit` package (the external npm package that now hosts most
of the AI toolsets that used to live in `src/tools/*`) returns nothing.
Several local `src/tools/*` directories (onChain, token, lulo, nft,
aiProjects) are dead code — nothing outside their own folder imports
them anymore; only `commonToolSet` and `managementToolSet` are still wired
into `src/app/api/chat/route.ts`. Understanding this was necessary to know
*where* a new Blinks toolset should actually live (locally, following the
`commonToolSet`/`managementToolSet` pattern — not inside the external
ai-kit package, which is out of scope for a `sola-application` PR).

## Crowded bounty — please check before reviewing

At the time of this work, GitHub showed **seven** open or closed PRs
already attempting this exact issue (#482, #484, #485, #486, #487, #488,
#489), plus a closed one (#483), going back to at least mid-2026, with
`/attempt #157` comments as recent as 2026-09-20. This PR was built
independently, without reading any of those PRs' diffs, based only on the
issue text and the actual `sola-application` repository conventions.
Whoever reviews this should be aware the bounty is heavily contested and
budget review time accordingly.

## Why no `npm install` / `next build` / `tsc` was run

`sola-application`'s `package.json` has `postinstall: prisma generate` and
`prepare: husky install` (both benign, well-known tooling), but a full
`npm install` also executes the `postinstall`/`prepare` scripts of every
transitive dependency (hundreds of packages). Per this task's constraint
to prefer static analysis and avoid executing untrusted repository/
dependency code, that install was skipped. Every new file was instead
checked by hand against the exact patterns of already-merged sibling files
(`src/tools/onChainToolSet/swapTokens.ts`, `src/tools/commonToolSet/index.ts`,
`src/components/messages/NativeStakeMessageItem.tsx`,
`src/lib/messageRenderer.tsx`, `src/hooks/chat/useChatMessages.ts`) for
type shapes, import paths, and store/hook usage, including the somewhat
unusual `signAndSend` extra-property pattern already present (and
presumably already passing CI) in `swapTokens.ts` and three other existing
tool files.

**Before merging, a maintainer (who has a working local environment)
should run `npm install`, `next build` / `tsc --noEmit`, and `next lint`**
to confirm there are no type errors — this was not independently verified
by this submission and should not be assumed passing.

## Design summary

- `src/tools/blinksToolSet/getBlinkAction.ts` — GET a Blink URL's metadata
  (icon/title/description/actions), SSRF-guarded (https-only, blocks
  literal localhost/private-IP hosts).
- `src/tools/blinksToolSet/executeBlinkAction.ts` — the actual "custom
  function to initiate the action": POSTs `{account: <wallet pubkey>}` to
  the chosen action href, returns the resulting transaction with
  `signAndSend: true`.
- `src/components/messages/BlinkActionMessageItem.tsx` — renders the
  metadata/action list and defines its own `triggerAction` for a manual
  (click) path, doing the same POST → sign → `/api/wallet/sendTransaction`
  sequence client-side with the connected wallet.
- `src/config/ai.ts` — extended so the assistant knows to call
  `getBlinkAction` → `executeBlinkAction` on its own when a Blink is
  single-action/parameter-free (true handsfree), and so Blink requests
  aren't dropped by the toolset-selection step before ever reaching the
  tool-enabled chat endpoint.

This reuses the app's existing `signAndSend: true` → `sign_and_send_tx` →
`handleSignTransaction` → `/api/wallet/sendTransaction` pipeline (already
used by swap/stake/transfer/lulo tools) rather than inventing a parallel
signing mechanism, per the "minimal, reviewable diff" goal.
