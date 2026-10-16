# Progress

> AI: read this at the start of every session. Update it at the end of every session (keep entries short).

## Current state

- **Current milestone:** M0 Foundation, branch `m0-foundation`
- **Next session:** S2
- **Blockers:** none

## Brand (filled in S1)

- Font family: Inter (fallback stack: system-ui, sans-serif)
- Primary color: #595959 (7.0:1 on white)
- Neutral base: _tbd_

## Live URLs (filled in as created)

- GitHub: https://github.com/puranderdua8/ui-design-system
- npm: https://www.npmjs.com/package/@puranderdua/ui
- Registry: _tbd_ (e.g. `https://<registry>.vercel.app/r/v0.1.0/{name}.json`)
- Site: _tbd_
- Storybook: _tbd_

## Session checklist

| Session                                  | Milestone | Status |
| ---------------------------------------- | --------- | ------ |
| S1 Kickoff and scaffold                  | M0        | ☐      |
| S2 Token source                          | M1        | ☐      |
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

## Parking lot (out of scope, later)

-
