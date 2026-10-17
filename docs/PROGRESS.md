# Progress

> AI: read this at the start of every session. Update it at the end of every session (keep entries short).

## Current state

- **Current milestone:** M5 Real website, branch `m5-site`
- **Next session:** S12 Storybook, Penpot, release (after Purander does the S11 manual pass and merges the `m5-site` PR)
- **Blockers:** none

## Brand (filled in S1)

- Font family: Inter (fallback stack: system-ui, sans-serif)
- Primary color: #595959 (7.0:1 on white)
- Neutral base: cool slate gray (`color.neutral.*`, 0–950); brand scale is achromatic around #595959 = `color.brand.600`

## Live URLs (filled in as created)

- GitHub: https://github.com/puranderdua8/ui-design-system
- npm: https://www.npmjs.com/package/@puranderdua/ui
- Registry: https://ui-design-system-registry.vercel.app (items at `/r/v0.1.0/{name}.json`; the root path is a 404 by design)
- Site: _tbd_ (Purander creates the Vercel project, root `apps/site`)
- Storybook: _tbd_

## Session checklist

| Session                                  | Milestone | Status |
| ---------------------------------------- | --------- | ------ |
| S1 Kickoff and scaffold                  | M0        | ☑      |
| S2 Token source                          | M1        | ☑      |
| S3 Token build and checks                | M1        | ☑      |
| S4 Tailwind bridge and recipes           | M2        | ☑      |
| S5 Text and Heading                      | M3        | ☑      |
| S6 Button (shadcn intake and adaptation) | M3        | ☑      |
| S7 Package build and publish             | M3        | ☑      |
| S8 Registry build and hosting            | M4        | ☑      |
| S9 Clean-install and update checks       | M4        | ☑      |
| S10 Portfolio site                       | M5        | ☑      |
| S11 QA and accessibility                 | M5        | ☑      |
| S12 Storybook, Penpot, release           | M6        | ☐      |

## Log

<!-- Append one block per session:
### S<n> — <title> — <date>
- Done:
- Decisions:
- Gotchas:
- Next:
-->

### S1 — Kickoff and scaffold — 2026-10-16

- Done: pnpm monorepo, strict TS base, ESLint flat + Prettier, `packages/ui` skeleton, empty tokens/scripts/apps, CI workflow. Local `pnpm check` passes.
- Decisions: D-015 (AI pushes/PRs, Purander merges), D-016 (brand). CLAUDE.md and PLAN.md updated to match.
- Gotchas: pinned TypeScript to ~6.0 because typescript-eslint doesn't support TS 7 yet; `baseUrl` is deprecated in TS 6, so `@/*` uses `paths` only. Local Node is 26; CI uses 22. Neutral base not chosen yet.
- Next: S2 token source. Confirm CI is green on PR `m0-foundation`, then Purander merges.

### S2 — Token source — 2026-10-16

- Done: DTCG source in `tokens/primitives/` (typography, color, dimension) and `tokens/semantic/` (typography, color, control). `scripts/validate-tokens.mjs` checks `$value`/`$type` (own or inherited), alias resolution, and that semantics alias primitives only. 53 primitives, 35 semantic tokens. Added Node globals for `scripts/**/*.mjs` in `eslint.config.mjs`.
- Decisions: D-017 to D-019. Branch `m1-tokens` cut from updated `main`.
- Gotchas: keys can't contain `.` (reference separator), so spacing 1.5 is `space.1-5`. Control height needed 2rem/2.5rem, which the spacing scale lacks, so I added primitive `size.control.{sm,md}`. Added semantic `focus.ring-width` and `focus.ring-offset` (not in the prompt) so Button can use the ring without touching primitives. Contrast not yet checked (S3 `contrast.mjs`); secondary border is brand.500 (#737373).
- Next: S3 Style Dictionary build, `tokens:check`, contrast script, wire into `pnpm check` and CI; open PR `m1-tokens`. Purander still needs to review role names (S2 "Done when").

### S3 — Token build and checks — 2026-10-16

- Done: `scripts/build-tokens.mjs` (Style Dictionary v4) writes `packages/ui/src/styles/generated/tokens.css` (`:root`, `--ds-` prefix, `outputReferences`) and flat `tokens.json`. `scripts/check-tokens.mjs` (validate, rebuild-and-diff, contrast) and `scripts/contrast.mjs`. `tokens:build`/`tokens:check` wired into root scripts, `pnpm check` and therefore CI. All 8 contrast pairs pass (lowest: text.muted 6.63:1, primary 7.00:1), so no token changes.
- Decisions: D-020 to D-022.
- Gotchas: `pnpm add style-dictionary` installs v5; pinned `^4`. pnpm 11 needs `allowBuilds` entries. With `outputReferences`, changing a primitive changes only that CSS line (semantics are `var()` refs); `tokens.json` holds resolved values and shows every dependent changing (verified with brand.600).
- Next: S4 Tailwind bridge and recipes. Open PR `m1-tokens` for Purander to review/merge.

### S2/S3 review fixes — 2026-10-16

- Done: PR #2 review. `validate-tokens` now checks alias types, value formats and semantic `$description`s (all semantic tokens described). `contrast.mjs` adds 3:1 pairs (focus ring, secondary border), accepts `#rgb`, uses the 0.04045 threshold, reports bad colours cleanly. `check-tokens` exits with the child's status (no stack traces) and runs `test-token-propagation.mjs`. Build: custom `css/variables-ds` format (no repeated typography comments, `space-1-5` in order).
- Decisions: D-023 to D-026.
- Gotchas: palette split (brand vs neutral) is documented, not changed (D-025). Parking-lot item below.
- Next: S4.

### S4 — Tailwind bridge and recipes — 2026-10-16

- Done: `theme.css` (`@theme inline` bridge for colors, type roles with line-height/weight/letter-spacing companions, `font-ds-sans`, `rounded-ds-control`, control spacing; recipes `.ds-type-<role>`, `.ds-focus-ring`). `scripts/build-foundations.mjs` → `packages/ui/dist/foundations.css` (no Tailwind import). `docs/styling-rules.md`. Playground in `packages/ui/playground/` (Vite+React, throwaway); `playground:check` builds it and greps the CSS for 42 classes; added to `pnpm check`.
- Decisions: D-027, D-028.
- Gotchas: dev deps added to `packages/ui`: tailwindcss, @tailwindcss/vite, vite, @vitejs/plugin-react (needed for the playground). `packages/ui` `build` currently only builds foundations; S7 adds tsup. Playground sits under tsc `include` (no Node types, so config avoids `node:` imports).
- Next: S5 Text and Heading. Open PR `m2-styles` for Purander to merge.

### S5 — Text and Heading — 2026-10-16

- Done: `cn` (`src/lib/utils.ts`), `Text` and `Heading` (cva, forwardRef, exported prop types), `src/index.ts` exports. Vitest + RTL + jsdom + vitest-axe set up (`vitest.config.ts`, `test/setup.ts`). 27 tests pass; `pnpm check` green.
- Decisions: D-029, D-030.
- Gotchas: tailwind-merge needed extending for `text-ds-*` sizes (D-029). Dev deps added: vitest, jsdom, @testing-library/react, @testing-library/dom, vitest-axe, vite-tsconfig-paths; runtime: class-variance-authority, clsx, tailwind-merge. jsdom prints a harmless "HTMLCanvasElement getContext" notice from axe. Vite 8 warns the tsconfig-paths plugin is now redundant. `@radix-ui/react-slot` is left for S6.
- Review follow-up (2026-10-17): applied external review (D-031): JSX, `data-slot`, per-element Text props/refs, tests (31 pass). Not adopted: ref-as-prop (React 18 peer), removing `label` from `Text` (spec).
- Independent PR review (D-032): fixed conflicting caption colours in `textVariants`, added `cn` tests (incl. theme.css drift check), stubbed canvas noise in test setup. 35 tests pass.
- Review round 2 (D-033): React 19 only (no forwardRef), `StrictRef` + ref type tests, `cn` dedupes `ds-type-*`, class lists generated from theme.css. 39 tests pass.
- Next: S6 Button.

### S6 — Button — 2026-10-17

- Done: `button.tsx` adapted from shadcn new-york-v4 (D-036), exported from `index.ts`; `docs/provenance/button.md`; 13 Button tests (keyboard, disabled, type default, focus recipe, sizes, asChild, ref, axe). Added deps `@radix-ui/react-slot`, dev `@testing-library/user-event`. `pnpm check` green (52 tests).
- Decisions: D-036.
- Gotchas: no jest-dom, so tests use plain DOM assertions. `font-medium` kept (no weight token for controls). Button classes (`disabled:*`) are not yet in the playground CSS check; S7's tarball app exercises them. D-025 tint mismatch: primary/secondary look consistent enough in tokens; no change.
- Next: S7 package build and publish.

### S7 — Package build — 2026-10-17

- Done: tsup (`tsup.config.ts`), `package.json` 0.1.0 (`exports` for `.` and `./foundations.css`, `files`, `sideEffects`, `publishConfig`, repository, keywords), README with install + Tailwind setup. `pnpm pack` tarball contains dist (css, js, map, d.ts), package.json, README. Throwaway Next 16 app (outside the repo, in the session scratchpad) installed the tarball, rendered Text/Heading/Button in a Server Component, and `next build` passed; built CSS contained the Button classes (hover, `disabled:`, focus ring, control sizes).
- Decisions: D-037.
- Gotchas: tsup `clean` wipes `dist`, so `build` runs tsup before `build-foundations`. `esbuild` set to `false` in `allowBuilds`. peerDeps are `^19` (plan said `>=18`; CLAUDE.md/D-033 win). The README `@source` path depends on where the consumer's CSS file sits.
- Published by Purander on 2026-10-17: `@puranderdua/ui@0.1.0`. The first publish failed with E404 "Scope not found" because the `puranderdua` npm org did not exist (the npm user is `puranderdua8`); creating the free org fixed it. `npm view @puranderdua/ui version` returned 404 for a short while after publishing, then 0.1.0 (registry propagation). `npm view ui version` is an unrelated package.
- Next: S8 registry build and hosting.

### S8 — Registry build and hosting — 2026-10-17

- Done: `registry.json` (template; items `ds-foundations`, `ds-types`, `ds-typography`, `ds-button`), `scripts/build-registry.mjs` (`pnpm registry:build` → `public/r/v0.1.0` + `public/r/latest`), `scripts/check-parity.mjs` (`pnpm registry:check`), `apps/registry/vercel.json` (output `public`, CORS and cache headers), `docs/registry.md`. Both scripts are in `pnpm check`. Built `ds-button.json` contains `@/lib/utils` and `@/lib/types` imports.
- Decisions: D-038.
- Gotchas: added the `ds-types` item (not in the plan) because components import `@/lib/types`. The registry host is not known yet, so the default is `https://puranderdua-registry.vercel.app`; after creating the Vercel project run `REGISTRY_URL=<url> pnpm registry:build` and commit the output. Standard shadcn `utils` lacks the `ds-*` tailwind-merge extension (see `docs/registry.md`). Not yet verified in a real consumer (S9).
- PR #6 review fixes: explicit `components/ui/<file>` targets (CLI nested the source path otherwise); new `ds-utils` item (stock `cn` dropped Button's text colour); `registry.config.json` host with URL validation; no silent overwrite of a built version (`--force`); build in a temp dir with `try/finally`; parity compares every file to its source and checks targets; CI fails on a stale `public/r`; `vercel.json` version pattern tightened. Verified with `shadcn add` from a local copy of the registry (7 files, correct paths and rewritten imports).
- Resolved: deployed to Vercel on 2026-10-17 (project `ui-design-system-registry`, root `apps/registry`, preset Other). `registry.config.json` now holds the real host and the output was rebuilt with `--force` (the first deploy served the placeholder dependency URLs, so installs would have failed). Note: v0.1.0 content changed after its first deploy; the immutable cache header (1 year) means nobody should have fetched it yet, but if anyone did, bump to 0.1.1 next time.
- Next: S9 clean-install.

### S9 — Clean-install and update checks — 2026-10-17

- Done: `scripts/clean-install.sh`, pinned (create-next-app 16.4.2, shadcn 4.22.0, package 0.1.0). App A: init → registry → add ds-typography + ds-button → page, plus a `/package` route. App B: package only, using `@puranderdua/ui/foundations.css`. Both are built, served with `next start`, fetched and checked (markup, built CSS, axe with 0 violations). The overwrite check asserts the prompt text and that the local edit survives; `--overwrite` then restores the registry copy. `EVIDENCE=<file>` writes the sanitized log (`docs/evidence/clean-install-2026-10-17.md`, Prettier-checked). Manual workflow `clean-install.yml` (read-only permissions); CI runs shellcheck on `scripts/*.sh`.
- PR review fixes: independent package test (app B), `grep -q` pipefail/SIGPIPE flake removed (files instead of pipes), prompt asserted, docs note on the init-time overwrite prompts, pins, HTTP + axe checks, workflow permissions, stale S8 note fixed. Vercel Git deployments disabled in `apps/registry/vercel.json` (D-039).
- Decisions: D-039.
- Gotchas: `shadcn init` writes a stock button.tsx and utils.ts, so the first `add` needs `--overwrite`. The package route needs `@source` for `node_modules/@puranderdua/ui/dist`. BSD sed lacks `0,/re/`, so CSS edits use node. axe's colour-contrast rule is off (jsdom has no layout); contrast is covered by `tokens:check`. The workflow has not been run on GitHub (Linux/Node 22).
- Next: S10 portfolio site. Purander reviews and merges the S9 PR, then deploys the registry by hand if needed.

### S10 — Portfolio site — 2026-10-17

- Done: `apps/site` (create-next-app 16.4.2, App Router, Tailwind v4). Package `@puranderdua/ui` pinned `0.1.0` from npm; `shadcn init` + `@puranderdua` registry at `/r/v0.1.0`, `shadcn add @puranderdua/ds-button` (brings ds-foundations, ds-utils, ds-types). `globals.css` imports `../styles/ds-foundations.css` only, plus `@source` for the package dist; Inter via `next/font` mapped onto `--ds-font-family-sans`. Page: Heading display h1, lead Text, caption, h2/h3 long-form section, client `Cta` with registry Button primary (`alert("Button clicked")`) and secondary (anchor via `asChild`). Heading/Text from the package, Button from the registry copy. ESLint bans `Button`/`buttonVariants` from the package (checked with a throwaway file). `pnpm check` green (after the PR review fix below); site lint, typecheck and build run through it.
- Verified: `next start` in the browser pane, clicking the primary button fires the alert "Button clicked"; Inter applied; 320px viewport has no horizontal scroll (scrollWidth 320).
- Decisions: D-040.
- Gotchas: pnpm links the npm package through `node_modules/.pnpm` (always a symlink); the real check is that it is not `packages/ui`. create-next-app brings its own `pnpm-workspace.yaml`/lockfile/AGENTS.md (removed) and `cacheComponents`/`partialPrefetching` flags (dropped, page is static). `shadcn init` writes a stock theme and extra deps (removed). Root `pnpm-workspace.yaml` gained `allowBuilds` for sharp/unrs-resolver and a `minimumReleaseAgeExclude` entry for `@puranderdua/ui@0.1.0` (pnpm added it automatically, fresh release). Next sets `settings.next.rootDir` in the site ESLint config so root `eslint .` doesn't warn about a missing pages dir. Copy on the page is placeholder-quality; Purander should edit it.
- PR #9 review (independent session): `LayoutProps` is a global that Next generates only during a build, so `tsc` failed on a clean checkout (and `pnpm check` was red until `1c10c44`); layout/page are now typed explicitly arrow-function consts. `components.json` style set to `new-york` (matches D-036; `base-nova` would pull `@base-ui/react` back in on a later `shadcn add`). The `no-restricted-imports` ban also catches `import * as DS` (tested).
- Vercel setup (Purander): project root `apps/site`, framework Next.js, "Include files outside the root directory" on, install at the repo root, env `ENABLE_EXPERIMENTAL_COREPACK=1` (so Vercel honours `packageManager: pnpm@11.22.0`; otherwise it may pick pnpm 9/10 and ignore `allowBuilds`/`minimumReleaseAgeExclude`). Node default is fine (`engines >=22`).
- Next: Purander merges PR #9, creates the Vercel project and deploys; then S11 Playwright/axe.

### S11 — QA and accessibility — 2026-10-17

- Done: Playwright 1.54.2 + `@axe-core/playwright` in `apps/site` (`playwright.config.ts`, `e2e/smoke.spec.ts`, `pnpm --filter site test:e2e`). Six tests, all green locally against `next start`: one h1 and heading order, primary Button by keyboard (Tab focus, outline present, Enter shows "Button clicked" via `page.once('dialog')`), secondary link goes to `#approach`, axe 0 violations (colour-contrast on, real browser), 320px no horizontal scroll, 200% zoom (640px viewport) readable. No site/component/token fixes were needed. CI installs Chromium and runs the suite; `.gitignore` covers reports.
- Decisions: D-041.
- Gotchas: `SITE_URL=<preview>` runs the same suite against a deployed site; not run against Vercel yet because the site is not deployed. `pnpm lint` shows Prettier warnings only for the git-excluded `.claude/worktrees/` checkout (not in CI). Every other `pnpm check` step passes when run directly.
- Manual pass (Purander, to record): keyboard-only walk-through and browser zoom at 200%. Done 2026-10-17: Tab order and focus ring look right; 200% zoom breaks nothing and adds no scroll. Browser and the Enter-key alert were not reported.
- Next: Purander merges the PR. Then S12.

## Parking lot (out of scope, later)

- Revisit brand vs neutral tint mismatch (D-025) when Button is built (S6).
- Update-path checks for the registry: build a v0.1.1, point a consumer at it and confirm `shadcn add` shows the change and an edited file is kept (S9 only covers re-adding the same version).
- Update-path check for the package: consumer upgrades `@puranderdua/ui` 0.1.0 to a newer release and still builds.
