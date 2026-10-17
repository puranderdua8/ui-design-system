# Progress

> AI: read this at the start of every session. Update it at the end of every session (keep entries short).

## Current state

- **Current milestone:** M3 Components and package, branch `m3-button`
- **Next session:** S7
- **Blockers:** none

## Brand (filled in S1)

- Font family: Inter (fallback stack: system-ui, sans-serif)
- Primary color: #595959 (7.0:1 on white)
- Neutral base: cool slate gray (`color.neutral.*`, 0–950); brand scale is achromatic around #595959 = `color.brand.600`

## Live URLs (filled in as created)

- GitHub: https://github.com/puranderdua8/ui-design-system
- npm: https://www.npmjs.com/package/@puranderdua/ui
- Registry: _tbd_ (e.g. `https://<registry>.vercel.app/r/v0.1.0/{name}.json`)
- Site: _tbd_
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
| S7 Package build and publish             | M3        | ☐      |
| S8 Registry build and hosting            | M4        | ☐      |
| S9 Clean-install and update checks       | M4        | ☐      |
| S10 Portfolio site                       | M5        | ☐      |
| S11 QA and accessibility                 | M5        | ☐      |
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

## Parking lot (out of scope, later)

- Revisit brand vs neutral tint mismatch (D-025) when Button is built (S6).
