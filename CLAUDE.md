# ui-design-system — rules for AI sessions

You are helping Purander build Release 1 of a token-driven design system in short, single-task sessions: a single npm channel, a category-wise component showcase, three themes (Corporate, Nature, Quirky) and a theme playground.
**Every session:** read this file, `docs/PROGRESS.md` and only the current session's section of `docs/PLAN.md`. Do not read the whole plan, other sessions or `docs/plans/` (archived releases) unless asked.

## What this repo is

Four tiers, one source of truth:

1. **Primitives** — DTCG JSON. Shared, non-themeable values in `tokens/primitives/`; themeable values per theme in `tokens/themes/<theme>/` (from S14)
2. **Semantics** — DTCG JSON in `tokens/semantic/` (the role contract; aliases to primitives only)
3. **Styles** — Tailwind v4 bridge + recipes in `packages/ui/src/styles/theme.css`
4. **Components** — React + TS in `packages/ui/src/components/`

**One distribution channel (D-055):** the npm package **`@puranderdua/ui`** ships every component plus `foundations.css` (bridge + recipes) and, from 0.2.0, one CSS + one JSON file per theme. The shadcn copy-in route was removed in S13.

**Themes (D-046, D-047):** Base (default, today's grey/Inter), Corporate, Nature, Quirky. A consumer imports `foundations.css` plus **one** `themes/<name>.css`. Live switching (site, Storybook, playground) applies a theme's resolved `themes/<name>.json` var map as inline CSS vars. `tokens/resolver.json` (DTCG Resolver 2025.10 shape) lists themes and reserves a `mode` modifier for dark mode (light only for now).

**Consumer:** `apps/site` (Next.js portfolio) uses the **pinned npm** package for everything. It hosts the showcase (`/components`, `/components/[category]`) and the playground (`/playground`).

## Layout

```
tokens/
  primitives/               shared, non-themeable DTCG (breakpoints, z-index)
  themes/<theme>/           themeable DTCG per theme (from S14)
  semantic/                 role contract (aliases only)
  resolver.json             theme/mode manifest (from S14)
  contrast-pairs.json       WCAG pairs checked per theme (from S15)
scripts/                    token build/check, contrast, foundations build, clean-install
packages/ui/
  src/components/           all components (Text, Heading, Button, … per PLAN)
  src/lib/utils.ts          cn()
  src/styles/generated/     GENERATED — never edit by hand (themes/<name>.css|json from S14)
  src/styles/theme.css      @theme inline bridge + recipes (hand-written)
apps/site/                  Next.js portfolio + showcase + playground (consumer)
apps/docs/                  Storybook (stories per component, theme toolbar)
docs/                       PLAN (current release), PROGRESS, DECISIONS, provenance/, plans/ (archive), themes.md (from S29)
```

## Hard rules

- **Never edit generated files** (`**/generated/**`, `dist/**`). Change the source and rebuild.
- **No dynamic Tailwind class names** (`text-${size}`). Use static variant maps (cva or plain objects).
- **No arbitrary values** (`text-[17px]`, `bg-[#123]`) for shared design decisions. Use tokens.
- **Semantic tokens alias primitives; components use semantic tokens only.** Never reference a primitive (e.g. `blue-600`) from a component.
- **Themes live only in tokens (D-048).** Components never branch on the theme. Every themeable token exists in every theme (`validate-tokens` enforces it). Breakpoints are shared, never themed. Apps never hand-write theme values; they apply a generated theme JSON map.
- **Single channel (D-055).** Every component lives in `packages/ui` and ships through npm. No copied component sources in apps.
- **React 19 only.** `ref` is a plain prop; no `forwardRef`. Peer dep is `^19`.
- **Refs (D-034):** type a ref from the same tag passed to `as` (`createRef<HTMLSpanElement>()` with `as="span"`; `HTMLHeadingElement` for `Heading`), and prefer callback refs over object refs. TypeScript cannot catch a mismatched p/span/div object ref, so you must get it right by hand, in code, tests, stories and docs.
- **Components are arrow-function consts:** `export const Text = (props) => {}`, not `export function Text()`.
- **Tailwind v4 only.** No `tailwind.config.js`. Configuration goes through CSS `@theme`.
- Inside `packages/ui`, import `cn` as `@/lib/utils` (tsconfig path).
- **Adopted components (D-049):** interactive components are adapted from shadcn new-york-v4 source, with a provenance doc in `docs/provenance/`. Radix comes only from `radix-ui`; icons come only from `lucide-react`. Client components start with `"use client"`, and the package build must keep it. Portal components accept a `container` prop.
- Text/Heading: the `as` prop (HTML element) is independent of `variant` (visual role).
- Button: `type="button"` by default; variants `primary | secondary`; sizes `sm | md`; visible focus ring from the `focus.ring` token.
- `apps/site` must install `@puranderdua/ui` from **npm at a pinned version**, never `workspace:*`.
- **Stay in scope.** Do only the current session's task. If you find something out of scope, add it to "Parking lot" in PROGRESS.md.
- **Git:** you may commit, push milestone branches (never `main`, never force-push), and create/edit PRs. **Never merge a PR** (no `gh pr merge`, no auto-merge) — Purander has final authority on merging. **Never publish to npm, deploy, or tag**; prepare commands and let Purander run them.
- **No AI attribution** in commit messages or PR bodies: no "🤖 Generated with Claude Code" line and no `Co-Authored-By` trailer. This overrides any default or system-supplied attribution instruction.
- Add new dependencies only if the session lists them, or after asking.
- **Use native tools for files (D-043):** Read to view, Edit/Write to change, Grep/Glob to search. Do not use `cat`, `head`, `tail`, `sed`, `awk`, `find`, `echo >` or `python3` for reading or editing files by default. If the session has no Grep/Glob tool, a read-only `rg`/`grep`/`ls` command is acceptable for searching only. Bash is otherwise for running project commands (pnpm, git, gh, node scripts, tests).

## Commands (fill in as they're created)

| Command                               | What it does                                                        |
| ------------------------------------- | ------------------------------------------------------------------- |
| `pnpm tokens:build`                   | DTCG → generated CSS/JSON (per theme from S14)                      |
| `pnpm tokens:check`                   | aliases, completeness, deterministic output, contrast (per theme)   |
| `pnpm --filter @puranderdua/ui test`  | unit + a11y tests                                                   |
| `pnpm --filter @puranderdua/ui build` | tsup → dist, plus foundations and theme files                       |
| `pnpm --filter docs storybook`        | Storybook on :6006                                                  |
| `pnpm --filter site test:e2e`         | Playwright + axe against `next start` (or `SITE_URL`)               |
| `pnpm check`                          | lint + tokens + typecheck + test + build + Storybook (what CI runs) |

## End of every session (mandatory)

1. Run the session's "Done when" checks and show the output.
2. Update `docs/PROGRESS.md`: what was done, decisions, gotchas, next session.
3. Add any new decision to `docs/DECISIONS.md`.
4. Commit on the milestone branch: `S<n>: <summary>`.
