# Progress

> AI: read this at the start of every session. Update it at the end of every session (keep entries short).

## Current state

- **Current milestone:** M0 Foundation, branch `m0-foundation`
- **Next session:** S3
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
| S3 Token build and checks                | M1        | ☐      |
| S4 Tailwind bridge and recipes           | M2        | ☐      |
| S5 Text and Heading                      | M3        | ☐      |
| S6 Button (shadcn intake and adaptation) | M3        | ☐      |
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

## Parking lot (out of scope, later)

-
