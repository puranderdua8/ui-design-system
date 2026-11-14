# ui-design-system — rules for AI sessions

You are helping the maintainer build Release 1 of a token-driven design system in short, single-task sessions: a single npm channel, a category-wise component showcase, three themes (Corporate, Nature, Quirky) and a theme playground. Before Display (S26), milestone **MH Production hardening** (sessions H1–H10, D-068) fixes every finding of the 2026-10-20 audit (`docs/audits/`).
After Release 1, milestone **MR Release 1 review** (sessions R1–R6, D-087) reviews the whole repo against a semver 1.0.0 bar. It is review only (no fixes); findings go into `docs/audits/2026-11-14-release-1-review.md`.
After the review, milestone **MH2 1.0.0 hardening** (sessions H11–H20, D-088) fixes those findings: H11–H19 ship as 0.9.0, H20 cuts 1.0.0. H-session rules apply; the audit rows are in the review register. The public-API contract is `docs/versioning.md` (D-096): follow it, and give every new themeable token a default alias (D-095).
**Every session:** read this file, `docs/PROGRESS.md` and only the current session's section of `docs/PLAN.md` (sessions are `S<n>`, `H<n>` or `R<n>`). Do not read the whole plan, other sessions or `docs/plans/` (archived releases) unless asked. In an H-session, also read the audit rows it names and update their status. In an R-session, also read the MR intro in `docs/PLAN.md` (working assumptions, finding format) and the review register.

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
  primitives/               shared, non-themeable DTCG (breakpoints)
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
docs/                       PLAN (current release), PROGRESS, DECISIONS, provenance/, plans/ (archive),
                            audits/ (findings registers), evidence/, releasing.md (from H2), themes.md (from S29)
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
- **Guardrails (D-070).** Rules marked "from H<n>" apply once that session lands; follow them in any new code from then on.
  - `"use client"` files export components only. Variants, class strings and other values go in a plain `<name>.styles.ts` (`check-client-exports`, from H3).
  - Surface tones re-map role vars in scope (`.ds-tone-*`); any new colour role joins the contrast matrix for every tone (from H4).
  - Portal components portal into `container ?? usePortalContainer()` (the nearest `ThemeScope`), falling back to `document.body`. Stacking uses the shared layer tokens (`tokens/primitives/layers.json`, `.ds-layer-*` recipes), never raw `z-*` (H5, D-075).
  - Layout follows the container, not the viewport. DOM order = visual order: no `*-reverse` or `order-*` to reorder content (D-064).
  - Interactive targets are at least 24px (`.ds-hit-area`, from H6). Every user-visible string in a component is a prop with an English default.
  - Single controls use `Field`; groups of controls use `Fieldset` (from H6).
- **Production-ready bar (D-070):** release sessions run the Definition of Done in `docs/PLAN.md`. A known issue you can't fix in scope goes into the current audit register (or the PROGRESS parking lot), never silently.
- **Adopted components (D-049):** interactive components are adapted from shadcn new-york-v4 source, with a provenance doc in `docs/provenance/`. Radix comes only from `radix-ui` until H16 moves it to individual `@radix-ui/react-*` packages (D-093); icons come only from `lucide-react`. Client components start with `"use client"`, and the package build must keep it. Portal components accept a `container` prop (it wins over `ThemeScope`).
- Text/Heading: the `as` prop (HTML element) is independent of `variant` (visual role).
- Button: `type="button"` by default; variants `primary | secondary`; sizes `sm | md`; visible focus ring from the `focus.ring` token.
- `apps/site` must install `@puranderdua/ui` from **npm at a pinned version**, never `workspace:*`.
- **Stay in scope.** Do only the current session's task. If you find something out of scope, add it to "Parking lot" in PROGRESS.md.
- **Git:** you may commit, push milestone branches (never `main`, never force-push), and create/edit PRs. **Never merge a PR** (no `gh pr merge`, no auto-merge) — the maintainer has final authority on merging. **Never publish to npm, deploy, or tag**; prepare commands and let the maintainer run them. From H2, releases publish only from `release.yml` when the maintainer pushes a `v*` tag and approves the `npm-publish` deployment (D-069).
- **No AI attribution** in commit messages or PR bodies: no "🤖 Generated with Claude Code" line and no `Co-Authored-By` trailer. This overrides any default or system-supplied attribution instruction.
- Add new dependencies only if the session lists them, or after asking.
- **Use native tools for files (D-043):** Read to view, Edit/Write to change, Grep/Glob to search. Do not use `cat`, `head`, `tail`, `sed`, `awk`, `find`, `echo >` or `python3` for reading or editing files by default. If the session has no Grep/Glob tool, a read-only `rg`/`grep`/`ls` command is acceptable for searching only. Bash is otherwise for running project commands (pnpm, git, gh, node scripts, tests).

## Commands (fill in as they're created)

| Command                                     | What it does                                                        |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm tokens:build`                         | DTCG → generated CSS/JSON (per theme from S14)                      |
| `pnpm tokens:check`                         | aliases, completeness, deterministic output, contrast (per theme)   |
| `pnpm --filter @puranderdua/ui test`        | unit + a11y tests                                                   |
| `pnpm --filter @puranderdua/ui test:layout` | rendered layout tests in Chromium (Playwright, package source)      |
| `pnpm --filter @puranderdua/ui build`       | tsup → dist, plus foundations and theme files                       |
| `pnpm --filter docs storybook`              | Storybook on :6006                                                  |
| `pnpm --filter docs test:stories`           | every story as a browser test; axe violations fail (Chromium)       |
| `pnpm --filter site test:e2e`               | Playwright + axe against `next start` (or `SITE_URL`)               |
| `pnpm check`                                | lint + tokens + typecheck + test + build + Storybook (what CI runs) |
| `pnpm check:rsc`                            | packs the tarball into a fresh Next app; RSC boundary (network)     |

## End of every session (mandatory)

1. Run the session's "Done when" checks and show the output.
2. Update `docs/PROGRESS.md`: what was done, decisions, gotchas, next session.
3. Add any new decision to `docs/DECISIONS.md`.
4. In an H-session, set the fixed findings to `fixed in H<n>` with evidence in the audit register. In an R-session, add the session's findings (with evidence) to the review register.
5. Commit on the session or milestone branch: `S<n>: <summary>`, `H<n>: <summary>` or `R<n>: <summary>`.
