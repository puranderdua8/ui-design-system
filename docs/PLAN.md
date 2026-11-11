# Release 1 plan: single channel → component showcase → themes → theme playground

Release 0 (v0.1.0, tagged) is archived in [`plans/release-0.md`](plans/release-0.md). This file always holds the current release (D-054).

## Goal (Release 1, done when all are true)

1. **Single channel.** The shadcn registry is gone from the repo and from Vercel. `@puranderdua/ui` on npm is the only source of truth for every component, including Text, Heading and Button (D-055).
2. **Components.** `@puranderdua/ui@0.7.0` on npm ships every component in five categories:
   - Typography: Text, Heading
   - Layout: Container, Grid, Stack, Cluster, Section, Split, Sidebar
   - Forms: Label, Field, Input, Checkbox, RadioGroup, Select
   - Actions: Button, Link
   - Display: Card, Tabs, Banner
3. **Themes.** Four themes ship: Base (today's grey/Inter, the default), Corporate, Nature and Quirky. Each defines its own colour, typography, shape, elevation, density and motion. A consumer imports `foundations.css` plus **one** `themes/<name>.css` (D-046, D-056).
4. **Showcase.** The portfolio site has `/components` with one page per category. Every component comes from the pinned npm package, and a header switcher changes themes live by loading only the chosen theme.
5. **Playground.** `/playground` tweaks a theme with knobs plus per-token overrides, updates the preview instantly with live contrast badges, remembers edits locally, and exports DTCG JSON and CSS. An exported theme builds and validates in `tokens/themes/`.
6. **Quality.** CI is green: per-theme token validation and contrast, unit and a11y tests, package build, Storybook build, site e2e with axe on every showcase page in every theme.
7. **Docs.** Storybook covers every component and has a theme toolbar. README, CHANGELOG, `docs/themes.md`, release notes and a retro are written.
8. **Ready for dark mode.** Light only, but the token manifest reserves a `mode` modifier, so dark mode later needs only token files (D-047).
9. **Production-ready bar.** Every release meets the [Definition of Done](#definition-of-done-every-release), the guardrails hold, and the audit register (`docs/audits/`) has no open findings (D-070).

## Milestones

| Milestone                                  | Sessions | npm release | Branch → PR      |
| ------------------------------------------ | -------- | ----------- | ---------------- |
| **M7 Single channel + theme-ready tokens** | S13–S17  | 0.2.0       | `m7-foundations` |
| **M8 Layout + Actions**                    | S18–S21  | 0.3.0       | `m8-layout`      |
| **M9 Forms**                               | S22–S25  | 0.4.0       | `m9-forms`       |
| **MH Production hardening**                | H1–H10   | 0.5.0       | `h<n>-<slug>`    |
| **M10 Display**                            | S26–S28  | 0.6.0       | `m10-display`    |
| **M11 Themes**                             | S29–S32  | 0.7.0       | `m11-themes`     |
| **M12 Theme playground**                   | S33–S35  | (site only) | `m12-playground` |

**Total:** 33 sessions, about 31 hours.

**Order rationale (D-044):** single channel first, so new work isn't built twice. Then the token structure becomes theme-ready, so every component is built once against the final contract. Components and the showcase come next, then themes (values only), then the playground.

**Hardening first (D-068):** the production-readiness audit of 2026-10-20 ([register](audits/2026-10-20-production-readiness.md)) found 5 blockers and 36 other findings in M7–M9. MH fixes all of them and adds guardrails before S26, so Display, Themes and the playground are built on a production-ready base. Session numbers S26–S35 are unchanged; MH ships as 0.5.0, so Display moves to 0.6.0 and Themes to 0.7.0.

**Release rhythm (D-050, D-069):** each milestone publishes one npm minor.

1. The release-prep session bumps the version and CHANGELOG and opens the PR. The AI never publishes or tags.
2. **You** merge it, then push the tag `v<version>` on `main` and approve the `npm-publish` deployment.
3. `.github/workflows/release.yml` checks that the tag matches `package.json`, runs `pnpm check` and `check:rsc`, and publishes with npm provenance (trusted publishing, no token).
4. The next session bumps `apps/site` to that exact version and builds that category's showcase page; you redeploy the site after merging.

Until H2 lands the workflow (0.4.0 and earlier), releases were published by hand.

## How to run every session

**Start (paste into a fresh Claude Code session):**

> Read CLAUDE.md and docs/PROGRESS.md, then only the "S<n>" (or "H<n>") section of docs/PLAN.md. Do only that session's task. Show me a short plan before editing, then implement. Stop when the "Done when" checks pass.

**End:**

> Run the Done-when checks, update PROGRESS.md and DECISIONS.md (and, in H-sessions, the audit register), and commit as "S<n>: …" or "H<n>: …".

Then `/clear`, or start a new session. On the last session of a milestone, the AI pushes the branch and opens or edits the PR; wait for CI; Purander reviews and merges. The next milestone branch is cut from the updated `main`.

**If a session runs over 60 minutes:** stop, have the AI write the remaining work into PROGRESS.md "Next", commit, and continue in a fresh session.

**Pre-approved dependencies** (only in the session that names them): `radix-ui` (S16), `lucide-react` (S20), `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` and `@eslint-react/eslint-plugin` (H1, root dev), `@storybook/addon-vitest`, `vitest` and `@vitest/browser-playwright` in `apps/docs` (H7), `culori` and `vitest` in `apps/site` (S33). Version upgrades named in a session (Playwright in H2) are approved too. Anything else needs asking first.

## Cross-cutting design (read once; sessions refer back here)

**Theme model (D-046).**

- Source: shared non-themeable primitives in `tokens/primitives/` (breakpoints); themeable primitives in `tokens/themes/<theme>/*.json`; the role contract in `tokens/semantic/` (aliases only).
- Manifest: `tokens/resolver.json` follows the DTCG Resolver Module 2025.10 (sets + modifiers). It has a `theme` modifier (base | corporate | nature | quirky) and a `mode` modifier (`light` only; `dark` reserved). `scripts/build-tokens.mjs` resolves it; we don't depend on resolver support in Style Dictionary (unverified).
- Two outputs per theme from one source:
  - `generated/themes/<name>.css`: `:root { --ds-*: … }` with references kept. A consumer imports exactly one.
  - `generated/themes/<name>.json`: a **fully resolved** flat var map (`"--ds-text-primary": "#1a1d23"`) plus alias refs (semantic → primitive).
- `foundations.css` = Tailwind bridge + recipes only, no values. This breaks 0.1.0 consumers; accepted at 0.x and documented in the CHANGELOG.
- Live switching (site, Storybook, playground) sets a theme's resolved JSON map as inline CSS vars on `<html>` or a scope element. Every var is resolved, so nothing depends on where `var()` refs were declared, and only the active theme is loaded.
- Breakpoints are not themeable (media queries can't read custom properties).

**Completeness (D-048).** Every theme defines exactly the themeable keys Base defines; `validate-tokens` fails otherwise. Contrast runs per theme.

**Components (D-049).**

- Interactive components are adapted from shadcn new-york-v4 source on the unified `radix-ui` package, each with a provenance doc in `docs/provenance/`. Icons come from `lucide-react`.
- Client components start with `"use client"`, and the package build must keep it.
- Portal components (Select) accept a `container` prop, so the playground's scoped preview can theme them. They default to the nearest `ThemeScope` (`usePortalContainer()`, H5, D-075), then `document.body`, and an explicit `container` still wins.

**Guardrails (D-070).** These came out of the 2026-10-20 audit. Each is enforced by a check where one is listed; the session that introduces it is in brackets.

1. **Client modules export components only.** Variants, class strings and other values live in a plain `<name>.styles.ts` that server code can import. `scripts/check-client-exports.mjs` fails otherwise (H3).
2. **Tones re-map roles in scope.** A surface tone (`.ds-tone-*`) re-points the role vars components use (link, focus ring, actions, control border). Contrast is a generated matrix of every surface/tone × every role, per theme (H4).
3. **Portals and stacking.** Portal components read `usePortalContainer()`; stacking only uses the layer tokens (`.ds-layer-*`, from the shared `tokens/primitives/layers.json`), never raw `z-*` (H5, D-075).
4. **Container-first layout.** Layout components respond to the width they are given (flex wrapping or container queries), never the viewport (D-064, H6).
5. **DOM order = visual order.** No `*-reverse` or `order-*` to reorder content (D-064, H6).
6. **Targets ≥ 24px.** Every interactive control has at least a 24px target (`control.target-min` + `.ds-hit-area`) (H6).
7. **No hard-coded strings.** Every user-visible string in a component is a prop with an English default (H6).
8. **Groups use `Fieldset`.** Single controls use `Field`; groups of controls (RadioGroup, checkbox lists) use `Fieldset` (`<fieldset>`/`<legend>`) (H6).

**Per component, every time:** static variant maps, semantic tokens only, `data-slot`, typed props/refs (D-034), tests (behaviour, keyboard, axe), a Storybook story, an export from `src/index.ts`, and the README component list. Plus the guardrails: exported variants in a `.styles.ts`, any new colour role in the contrast matrix for every tone, `usePortalContainer` for portals, a hit area for small controls, string props, layout tests passing in Chromium, Firefox and WebKit, and the story's Storybook a11y test passing.

### Definition of Done (every release)

A release-prep session (and H10) shows all of these before the PR is opened:

- `pnpm check` green: lint (hooks, a11y, type-aware), `check-client-exports`, tokens (completeness, contrast matrix per theme), typecheck, unit + axe tests, layout tests in three browsers, package build, playground CSS coverage, Storybook build with a11y tests.
- `pnpm check:rsc` green against the packed tarball (every client component, every server-safe export called from a Server Component).
- `scripts/clean-install.sh` green against the tarball.
- Site e2e green in Chromium, Firefox and WebKit, including axe, 320px, 200% zoom and the security-header test.
- `pnpm audit --prod --audit-level high` clean.
- CHANGELOG with every breaking change and a migration note; READMEs and the component list current.
- The audit register has no `open` findings for the release's scope.

---

## M7 Single channel + theme-ready tokens → 0.2.0

### S13: Remove the registry (45 min)

**Prompt:**

> S13. Retire the shadcn registry (D-055); npm is the only channel.
>
> - Delete: `registry.json`, `registry.config.json`, `scripts/build-registry.mjs`, `scripts/check-parity.mjs`, `apps/registry/`, `docs/registry.md`.
> - Root `package.json`: drop the `registry:*` scripts and their `pnpm check` steps, and the `shadcn` devDependency. Drop the shadcn-related `minimumReleaseAgeExclude` entries in `pnpm-workspace.yaml`.
> - CI: drop the "Committed registry output is up to date" step.
> - `scripts/clean-install.sh`: keep only the package app (B), and update the workflow and docs. Regenerate the evidence file only if the script ran end to end.
> - `apps/site`: import `Button` from `@puranderdua/ui` (0.1.0 already exports it) and `@puranderdua/ui/foundations.css` in `globals.css` (keep `@source` and the Inter mapping). Delete `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/lib/types.ts`, `src/lib/generated/`, `src/styles/ds-foundations.css`, and the ESLint `no-restricted-imports` ban. Remove the now-unused site deps (`@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`).
> - Check `packages/ui/README.md`, root README, `docs/styling-rules.md` and `.prettierignore`/ESLint ignores for registry leftovers.

**You do:** pause or delete the Vercel project `ui-design-system-registry` (your call; nothing depends on it after this session).
**Done when:** `pnpm check` and `pnpm --filter site test:e2e` are green. A Grep for `registry` only hits CHANGELOG, `docs/plans/release-0.md`, `docs/releases/v0.1.0.md`, `docs/evidence/`, DECISIONS and PROGRESS.

### S14: Theme architecture (60 min)

**Prompt:**

> S14. Make the token pipeline theme-aware (see "Cross-cutting design").
>
> - Move themeable primitives (colour, font family/size/weight/line-height/letter-spacing, space, size, radius, border-width, ring) into `tokens/themes/base/*.json` with unchanged values. Keep only non-themeable values in `tokens/primitives/`. Add shared breakpoints matching Tailwind's defaults; they are not bridged yet.
> - Add `tokens/resolver.json` (DTCG Resolver 2025.10 shape: `theme` modifier with `base`; `mode` modifier with `light`, `dark` reserved).
> - `build-tokens.mjs`: for each theme (× mode `light`) build `packages/ui/src/styles/generated/themes/<name>.css` (`:root`, `outputReferences`) and `themes/<name>.json` (`{ vars: { "--ds-…": resolved }, refs: { "--ds-semantic": "--ds-primitive" } }`). Drop the old single `tokens.css`/`tokens.json`, or keep them as Base aliases only if a script still needs them; decide and record.
> - `build-foundations.mjs`: `foundations.css` = `theme.css` only (bridge + recipes, no values); copy the theme CSS/JSON to `dist/themes/`. Playground and Storybook import `themes/base.css` as well.
> - `validate-tokens`: every theme defines exactly Base's themeable keys (completeness, D-048); semantics alias primitives only.
> - `check-tokens`, `test-token-propagation`, `contrast` run per theme.
> - A unit/script test builds a temporary second theme (scratch copy) and shows it validates, builds and gets checked for contrast.

**Done when:** `pnpm check` is green. Base resolved values equal today's `tokens.json` (show the diff check). The temporary theme test passes.

### S15: New token categories and semantic roles (60 min)

**Prompt:**

> S15. Add the themeable categories every new component needs; Base values reproduce today's look or sensible neutral defaults.
>
> - **Typography:** `font.family.{heading,body}`; type roles use heading (display, h1–h3) or body; `.ds-type-*` recipes read each role's own family var instead of `font-ds-sans`.
> - **Elevation:** shadow tokens `elevation.{raised,overlay}` (DTCG `shadow`).
> - **Motion:** `motion.duration.{fast,normal}`, `motion.easing.{standard,emphasized}` (DTCG `duration`, `cubicBezier`); a recipe or bridge entry so components use them, and `prefers-reduced-motion` respected.
> - **Shape:** `radius.{control,card,pill}` roles, `border-width.{default,strong}`.
> - **Density / layout:** extend `space.*` (8, 12, 16, 24 …), `layout.gap.{xs,sm,md,lg,xl}`, `layout.section-padding.{sm,md,lg}`, `layout.gutter`, `layout.container.{sm,md,lg,xl}` widths, `layout.sidebar-width`.
> - **Colour roles:** `surface.{subtle,raised,inverse,brand}`, `text.{link,link-hover,on-brand}`, `border.{strong,control}`, `input.{bg,border,border-hover,placeholder}`, `feedback.danger.{fg,border,bg}`, `overlay.scrim`.
> - Move the contrast pairs to `tokens/contrast-pairs.json`. `contrast.mjs` reads it per theme. Add input border 3:1, danger text 4.5:1, link 4.5:1, text on surface.subtle/brand/inverse.
> - `validate-tokens` learns `shadow`, `duration`, `cubicBezier`.
> - `theme.css` bridge: `--shadow-ds-*`, `--container-ds-*`, `--spacing-ds-*` (layout), `--radius-ds-*`, `--ease-ds-*`, new colours. Extend `ds-classes` generation and the `cn` tailwind-merge config wherever a new `ds-` class could be misgrouped (check `shadow-ds-*` and `text-ds-link`). Add the new classes to `playground:check`.

**Done when:** `pnpm check` is green; every contrast pair passes for Base; `playground:check` finds the new classes.

### S16: 0.2.0 release prep (45 min)

**You do first:** approve `radix-ui` (pre-approved here).

**Prompt:**

> S16. Prepare `@puranderdua/ui@0.2.0`.
>
> - Button: `Slot` from `radix-ui` instead of `@radix-ui/react-slot`; update `docs/provenance/button.md`; tests stay green.
> - `package.json` `exports`: `.`, `./foundations.css`, `./themes/*.css`, `./themes/*.json`, `./contrast-pairs.json`, `./package.json`; `files` and `sideEffects` updated.
> - Package README: install, Tailwind setup = `@import "tailwindcss"; @import "@puranderdua/ui/foundations.css"; @import "@puranderdua/ui/themes/base.css"; @source …`, theme list, live-switching note (JSON maps).
> - Version 0.2.0. CHANGELOG: breaking (foundations has no values; import a theme), registry retired, new tokens.
> - `pnpm pack`, then a throwaway Next app in the scratchpad: install the tarball, render Text/Heading/Button with foundations + base theme, `next build`, and check the built CSS has the tokens. Do NOT publish.

**You do:** `cd packages/ui && npm publish --access public`; check `npm view @puranderdua/ui version` shows 0.2.0.
**Done when:** the tarball app builds and npm shows 0.2.0.

### S17: Showcase shell (60 min)

**Prompt:**

> S17. Start the showcase in `apps/site` (D-045).
>
> - Bump `@puranderdua/ui` to `0.2.0` (pinned). `globals.css` imports foundations + `themes/base.css`.
> - Routes: `/components` (category index with short descriptions) and `/components/[category]` (`generateStaticParams` for typography, layout, forms, actions, display).
> - A shared `Example` component: live preview, code snippet (static string next to the example; no runtime parsing), npm import line.
> - Pages: Typography (every Text/Heading variant, `as` vs variant) and Actions (Button variants × sizes × disabled, asChild link). Other categories show a "Coming in 0.x" state.
> - Site header nav: Home, Components (later Playground).
> - E2E: axe 0 violations and heading order on `/components` and each built category page; 320px has no horizontal scroll.

**Done when:** site build and e2e are green; record in PROGRESS that the package upgrade path 0.1.0 → 0.2.0 worked (parking-lot item). Push and open PR `m7-foundations` (Purander merges and redeploys the site).

---

## M8 Layout + Actions → 0.3.0

### S18: Container, Grid, Stack, Cluster (60 min)

**Prompt:**

> S18. In `packages/ui` add layout components (arrow consts, `as` prop with a typed element union, static variant maps, layout tokens only):
>
> - `Container`: `size` sm | md | lg | xl | full (container tokens), horizontal gutter.
> - `Grid`: `cols` 1 | 2 | 3 | 4 | 6 | 12 with responsive static maps (stack on small screens), `minItemWidth` auto-fit mode from a token, `gap`.
> - `Stack`: vertical, `gap`, `align`.
> - `Cluster`: wrapping row, `gap`, `justify`, `align`.
>
> Tests (element, classes, no dynamic classes, axe), stories, exports.

**Done when:** `pnpm check` is green.

### S19: Section, Split, Sidebar (60 min)

**Prompt:**

> S19. Add `Section` (full-width band: `tone` canvas | subtle | inverse | brand, `padding` sm | md | lg, optional inner Container size; text colours follow the tone), `Split` (two columns; `ratio` 1:1 | 1:2 | 2:1; `reverse`; stacks under `md`; `align`) and `Sidebar` (aside + content; `side` start | end; width token; collapses under a breakpoint; content keeps a minimum width). Tests, stories, exports. Add contrast pairs for text on each Section tone if not already covered.

**Done when:** `pnpm check` is green; stories show each layout at 320px and desktop.

### S20: Link + 0.3.0 prep (50 min)

**You do first:** approve `lucide-react` (pre-approved here).

**Prompt:**

> S20. Add `Link`: `variant` inline | standalone, `asChild` (for `next/link`, via `radix-ui` Slot), `external` adds `target="_blank" rel="noopener noreferrer"`, a lucide `ExternalLink` icon (aria-hidden) and visually hidden "(opens in a new tab)"; link colours from `text.link*`; focus ring recipe; underline rules (inline always underlined). Tests (asChild, external, keyboard, axe), story, export. Then release prep: version 0.3.0, CHANGELOG, README component list, tarball check. Do NOT publish.

**You do:** `npm publish`; check 0.3.0.
**Done when:** tests are green and npm shows 0.3.0.

### S21: Showcase Layout + Actions (45 min)

**Prompt:**

> S21. Site → `@puranderdua/ui@0.3.0`. Build the Layout page (each layout with a visible demo frame and code) and add Link (inline, standalone, external, with `next/link` via asChild) to the Actions page. Use package layout components for the site's own page structure where they fit. E2E: layout page has no horizontal scroll at 320px; Link is reachable and activates by keyboard; axe clean.

**Done when:** site build and e2e are green. Push and open PR `m8-layout`.

---

## M9 Forms → 0.4.0

### S22: Client boundary + Label, Field, Input (60 min)

**Prompt:**

> S22. First, the client boundary: make the package build keep `"use client"` on client components (tsup multiple entries or a directive-preserving esbuild plugin; research and record the choice). Prove it with a throwaway Next app (tarball): a Server Component page imports Text (stays server) and a client component (works). Then add `Label` (wraps Text label role), `Field` (label + control + description + error; ids via `useId`, `aria-describedby`, `aria-invalid`, `required` marker) and `Input` (sizes sm | md from control tokens, `input.*` tokens, invalid state from `feedback.danger`, disabled from `disabled.*`, focus ring). Tests (labels associated, description/error announced, axe), stories, exports.

**Done when:** `pnpm check` is green and the RSC tarball check passes.

### S23: Checkbox + RadioGroup (60 min)

**Prompt:**

> S23. Adapt shadcn new-york-v4 `checkbox` and `radio-group` (import from `radix-ui`, icons from `lucide-react`) into `packages/ui`; provenance docs (`docs/provenance/checkbox.md`, `radio-group.md`) with source URL, date, license and every change. Token-only classes (control border 3:1, checked fill from action.primary, focus ring, disabled, invalid). `"use client"`. Tests: Space toggles, arrow keys move in the group, labels via Field/Label, disabled, axe. Stories, exports.

**Done when:** `pnpm check` is green.

### S24: Select (60 min)

**Prompt:**

> S24. Adapt shadcn new-york-v4 `select` (Trigger, Value, Content, Item, Group, Label, Separator, scroll buttons) on `radix-ui` with lucide icons; provenance doc. Sizes sm | md like Input; `SelectContent` accepts `container` (passed to the Radix Portal) so it renders inside a themed scope; content uses `surface.raised` + `elevation.overlay`. Tests: open with keyboard, arrow/typeahead selection, Escape closes, label association, axe. Stories, exports.

**Done when:** `pnpm check` is green.

### S25: 0.4.0 + showcase Forms (60 min)

**Prompt:**

> S25. Release prep 0.4.0 (CHANGELOG, README, tarball RSC check). Do NOT publish. **After Purander publishes:** site → 0.4.0; Forms page: each control's states, plus a demo form (Field + Input/Select/Checkbox/RadioGroup) with client-side validation messages. E2E: keyboard operation of each control, error messages announced (`aria-describedby`), axe clean.

**You do:** `npm publish` 0.4.0 partway through the session (the AI pauses for it).
**Done when:** npm shows 0.4.0; site build and e2e are green. Push and open PR `m9-forms`.

---

## MH Production hardening → 0.5.0

Fixes every finding in [`docs/audits/2026-10-20-production-readiness.md`](audits/2026-10-20-production-readiness.md) (F01–F41) and adds the guardrails (D-068, D-070). Each session cuts `h<n>-<slug>` from synced `main`, opens its own PR, and sets its findings to `fixed in H<n>` in the register with evidence. Write a failing test first for every bug fix.

### H1: Lint and type guardrails (60 min)

**Prompt:**

> H1 (F03, F31, F32, F41). Make the library's lint and types catch React, hooks and a11y mistakes.
>
> - Root `eslint.config.mjs`: for `packages/ui/src` and `apps/docs/src` add `eslint-plugin-react-hooks` (recommended), `eslint-plugin-jsx-a11y` (strict) and `@eslint-react/eslint-plugin`; for `packages/ui/src` switch to typed linting (`tseslint.configs.recommendedTypeChecked` with `projectService`). Fix every finding; record any rule turned off and why.
> - One typed polymorphic helper in `src/lib/` (e.g. `renderAs`) replaces the `props as object` casts in the ten components; the single remaining cast lives in the helper, covered by a type test.
> - `tsconfig.base.json`: `verbatimModuleSyntax: true`. Try `exactOptionalPropertyTypes`; adopt it or record why not (Radix prop types).
> - Enforce D-043: a project PreToolUse hook in `.claude/settings.json` that blocks Bash commands reading or editing files with `cat`, `head`, `tail`, `sed`, `awk`, `echo >` or `python3` (allow-list pnpm, git, gh, node scripts). Show it blocking one command.

**Done when:** `pnpm check` is green. A deliberate hooks violation (conditional `useId`) and an a11y violation (`<div onClick>`) each fail lint (shown, then reverted).

### H2: CI, supply chain and release workflow (60 min)

**Prompt:**

> H2 (F04, F05, F06, F20, F22, F36 in CI).
>
> - `ci.yml`: `permissions: contents: read`; every action pinned to a full commit SHA with a `# vX.Y.Z` comment; `concurrency` (cancel in progress per ref); `timeout-minutes` per job; a `pnpm audit --prod --audit-level high` step; a `check-rsc` job for PRs that touch `packages/ui/**` or `scripts/check-rsc.sh`.
> - `.github/dependabot.yml`: npm (weekly, grouped minor/patch, `apps/site` excluded from `@puranderdua/ui` bumps) and github-actions.
> - Upgrade Playwright to ≥1.55.1 in `apps/site` and `packages/ui` (same pin). Add Firefox and WebKit projects to both `playwright.config.ts`; CI installs all three browsers. CI: `retries: 0` (or `failOnFlakyTests: true`) so a flake fails the run.
> - `.github/workflows/release.yml`: on push of tags `v*`; job in environment `npm-publish`; `permissions: contents: read, id-token: write`; fails unless the tag equals `packages/ui/package.json` version; `pnpm install --frozen-lockfile`, `pnpm check`, `check:rsc`, then `npm publish --provenance --access public` from `packages/ui`. No npm token (trusted publishing).
> - `docs/releasing.md`: one-time setup (npm trusted publisher for this repo and workflow, GitHub environment `npm-publish` with Purander as required reviewer) and the release flow from PLAN "Release rhythm".

**You do:** create the `npm-publish` environment (required reviewer: you; tags `v*` only) and add the trusted publisher on npmjs.com, following `docs/releasing.md`.
**Done when:** CI is green in all three browsers; `release.yml` passes `actionlint` and its version-mismatch guard is shown failing locally (e.g. with `act` or a script dry-run), without publishing.

### H3: Client boundary and form bug fixes (60 min)

**Prompt:**

> H3 (F01, F13, F14, F18, F19, F27, F28, F36 script).
>
> - Move `inputVariants`, `checkboxClasses`, `radioGroupItemClasses`, `selectTriggerVariants` into plain `input.styles.ts`, `checkbox.styles.ts`, `radio-group.styles.ts`, `select.styles.ts` (no directive); components and `index.ts` import from them. Update the tsup plugin if `.styles.ts` files need to be entries or shared chunks (record which, D-065).
> - New `scripts/check-client-exports.mjs` in `pnpm check` (after build): every export of a `dist` file that starts with `"use client"` must be a component (PascalCase function). Show it failing on a planted variant export.
> - `scripts/check-rsc.sh`: assert the directive on every client component, and add a Server Component page that imports the whole public API and calls every server-safe export (`*Variants`, `*Classes`, `cn`).
> - Radio invalid style via the group (a `group`/`data-invalid` selector on the item). Checkbox: render both icons and show them from `data-state` (works uncontrolled). Field ignores `""` descriptions like it ignores `""` errors. Disabled wins over invalid (`disabled:` border after `aria-invalid:`, or `aria-invalid:enabled:`).
> - Export `useFieldContext` (and its type). `package.json` `exports["."]` gets a `default` condition after `import`.
> - Tests for each fix, written to fail first.

**Done when:** `pnpm check` and `pnpm check:rsc` are green; the planted export fails `check-client-exports`.

### H4: Tone-aware tokens and contrast matrix (60 min)

**Prompt:**

> H4 (F02). Make a surface tone change the roles inside it, and check every tone × role.
>
> - Semantic roles per tone: for `inverse` and `brand`, link, link-hover, focus ring, action primary/secondary (bg, fg, border, hover, active), control border and muted text (e.g. `on-inverse.*`, `on-brand.*`). Base values that pass; every theme must define them (completeness).
> - Recipes `.ds-tone-canvas|subtle|inverse|brand` in `theme.css` set the surface and re-point the role vars (`--ds-text-link`, `--ds-focus-ring`, `--ds-action-*` …) inside the scope. `Section` uses them instead of plain bg/text classes. `.ds-focus-ring` keeps reading the role var, so it follows the tone.
> - `tokens/contrast-pairs.json` gains `contexts` (each tone's surface and its re-mapped roles) and `roles` (fg role, min); `contrast.mjs` expands contexts × roles per theme; `validate-tokens` checks the shape. List deliberate exclusions with a reason.
> - Layout test (Chromium/Firefox/WebKit): inside each tone, the computed focus-ring colour and link colour meet their minimum against the computed background.
> - D-entry.

**Done when:** `pnpm check` is green; the F02 values are re-measured and recorded in the register.

### H5: Overlay foundation (60 min)

**Prompt:**

> H5 (F15, F16). Give portals and stacking one shared foundation before Display adds more overlays.
>
> - Layers: shared, non-themeable `tokens/primitives/layers.json` (base, sticky, dropdown, overlay, modal, toast, tooltip, skip-link) built into foundations as `--ds-layer-*` with `.ds-layer-*` recipes. Replace `z-50` in Select and `z-10` in the site skip link (site in H9).
> - `ThemeScope` (client): applies a theme's resolved var map as inline vars on its element, sets `data-ds-theme`, and provides itself as the portal container through context. `usePortalContainer()` hook exported. `SelectContent` defaults `container` to it; an explicit prop wins; with no scope it falls back to `document.body`.
> - Tests: Select inside a `ThemeScope` portals into the scope and its content reads the scoped vars; explicit `container` overrides; no scope still works.
> - D-entry (layers, ThemeScope); update the portal rule in CLAUDE.md and PLAN "Cross-cutting design".

**Done when:** `pnpm check` is green.

### H6: Component API and accessibility (60 min)

**Prompt:**

> H6 (F10, F11, F12, F17, F26, F30, F37, F38).
>
> - `Sidebar`: for `side="end"`, render the aside after the content (no `flex-row-reverse`), so DOM order = visual order; when it wraps, the aside goes below. New `sidebarProps` (aria-label, id …) on the aside. Update D-064 consequences in a new D-entry.
> - `Grid`: `cols` follows the container (Tailwind v4 container queries; an outer `@container` element, `as`/`ref`/`role` stay on the inner grid). Document the DOM change.
> - Target size: token `control.target-min` (24px, themeable density) and a `.ds-hit-area` recipe (an invisible `::after` that extends the target); Checkbox and RadioGroupItem use it. Layout test measures the hit area.
> - `Field layout="stacked" | "inline"` (inline: control, then label on one row; description and error below).
> - New `Fieldset` (`<fieldset>` + `<legend>` + description + error + context: `describedBy`, `invalid`, `required`). `RadioGroup` reads it (named by the legend, no `aria-labelledby` needed). Field + RadioGroup is documented as wrong and warns in development.
> - `Link`: `externalLabel` prop (default "(opens in a new tab)"); remove `focusable="false"`.
> - Tests (unit, layout in three browsers), stories, exports, README component list.

**Done when:** `pnpm check` is green.

### H7: Storybook a11y gate and CSS coverage (60 min)

**Prompt:**

> H7 (F21, F39).
>
> - `apps/docs`: `@storybook/addon-vitest` with Vitest browser mode (Playwright Chromium) so every story's a11y test runs; `a11y.test: "error"` now fails `pnpm check` and CI. Fix any violations at the right tier.
> - `playground:check`: build the class list from `dist/components/*.js` (every `ds-` utility and recipe the package uses) and assert each one is in the playground's built CSS, so coverage no longer depends on the playground using a class.
> - Stories: ThemeScope (portal inside a scope), Fieldset, Field inline, Section tones with links and buttons.
> - Remove "axe in Storybook CI" from the parking lot.

**Done when:** `pnpm check` is green and a story with a planted violation fails it (shown, then reverted).

### H8: 0.5.0 release prep (50 min)

**Prompt:**

> H8 (F35, F40). Release prep `@puranderdua/ui@0.5.0`. Do NOT publish or tag.
>
> - Version 0.5.0; `package.json` description lists the categories.
> - CHANGELOG 0.5.0: **Breaking** (Sidebar `side="end"` DOM order and wrap position, Grid wrapper element, new tone, layer and target-size tokens that custom themes must define, `.styles.ts` move is non-breaking for the barrel) with a **Migration** section; Added (ThemeScope, usePortalContainer, Fieldset, Field inline, Link `externalLabel`, `useFieldContext`, layers); Fixed (F01, F13, F14, F27, F28).
> - READMEs: ThemeScope and portals, Fieldset vs Field, `@source` alternatives (path per package manager, how to verify with the built CSS).
> - Run the full [Definition of Done](#definition-of-done-every-release) against the tarball.

**You do:** merge the PR, push tag `v0.5.0` on `main`, approve the `npm-publish` deployment. Check `npm view @puranderdua/ui version` shows 0.5.0 and the npm page shows provenance.
**Done when:** the Definition of Done is green and npm shows 0.5.0 with provenance.

### H9: Site production readiness on 0.5.0 (60 min)

**Prompt:**

> H9 (F07, F08, F09, F23, F24, F25, F29, F33, F34; the site half of F16).
>
> - Pin `@puranderdua/ui@0.5.0` (and its `minimumReleaseAgeExclude` entry); `@types/node ^22`. The Display category now says "Coming in 0.6" (`src/lib/categories.ts`). Adopt the 0.5.0 changes on the showcase (Fieldset for the RadioGroup demos, inline Field for the terms checkbox, Sidebar demo).
> - `next.config.ts`: `poweredByHeader: false` and `headers()` for every route: CSP that works with static pages (`default-src 'self'`; `script-src 'self' 'unsafe-inline'`, recording why nonces are not used: they force dynamic rendering; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`), `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation off), `X-Content-Type-Options: nosniff`.
> - `not-found.tsx`, `error.tsx` (client, with retry), `metadataBase` from `NEXT_PUBLIC_SITE_URL` (default the live URL), `opengraph-image.tsx` (`next/og`), `robots.ts`, `sitemap.ts` (home, `/components`, every category).
> - Layout: a site `<footer>` outside `<main>` (contentinfo); header shows the current page visually (`aria-[current=page]:` style); `isCurrent` matches the exact path or a `/`-separated prefix. Skip link uses `.ds-layer-skip-link`.
> - Home: built from `Container`, `Stack`, `Cluster`, tokens only; `<section>` instead of `<article>`; "Get in touch" is `Button asChild` + `Link external` to https://github.com/puranderdua8.
> - Demo registry: one typed map `demos` (`name → component`); `Example` takes `demo: DemoName` and reads the file from the name, resolved relative to the module (not `process.cwd()`), so name and component can't drift.
> - Signup demo: an always-present live region filled on success; focus the first invalid control after a failed submit; clear a field's error when it changes.
> - E2E (three browsers): security headers present on `/` and a category page; 404 page; `robots.txt` and `sitemap.xml`; CTA link attributes; signup focus moves to the first error.

**You do:** redeploy the site; run `SITE_URL=<prod> pnpm --filter site test:e2e`.
**Done when:** site build and e2e are green locally and against production.

### H10: Production-readiness sign-off (60 min)

**Prompt:**

> H10. Close the audit.
>
> - Walk every row of the audit register: re-verify each finding with evidence (command output, test name, measured value) and set its final status. Nothing stays `open`; anything not fixed needs Purander's agreement and a D-entry (`accepted`).
> - Re-run the review on the whole repo (React, TS, a11y, security, semantic HTML, architecture, system design). New findings get new F-IDs and are fixed now or accepted with a D-entry.
> - Run the full [Definition of Done](#definition-of-done-every-release) plus site e2e against production; write `docs/evidence/production-readiness-<date>.md`.
> - MH retro in PROGRESS (time per session, what broke, which guardrail caught what).

**You do:** review the evidence and sign off in PROGRESS.
**Done when:** the register has no `open` rows and Purander's sign-off is recorded. S26 starts after this.

---

## M10 Display → 0.6.0

### S26: Card + Tabs (60 min)

**Prompt:**

> S26. `Card` parts: Card (`variant` outline | raised, using `radius.card`, `elevation.raised`, `surface.raised`), CardMedia, CardHeader, CardTitle (Heading underneath, `as` configurable), CardDescription, CardContent, CardFooter. `Tabs`: adapt shadcn new-york-v4 `tabs` on `radix-ui` (List, Trigger, Content; provenance doc; `activationMode` passthrough); token-only classes. Follow the guardrails (D-070): exported variants in `.styles.ts`, Card `raised` surface in the contrast matrix, Tabs triggers ≥ 24px. Tests (roving focus, arrow keys, Home/End, axe; three browsers), stories, exports.

**Done when:** `pnpm check` is green.

### S27: Banner (60 min)

**Prompt:**

> S27. `Banner` (full-screen hero):
>
> - `height` screen (100svh) | tall; `align` start | center.
> - `tone` canvas | brand | inverse | gradient, using the `.ds-tone-*` recipes from H4 (gradient: a new tone recipe built from brand tokens, added to the contrast matrix).
> - `media` slot for any `<img>`/`next/image` (object-cover) with an `overlay.scrim` layer whose strength keeps text readable; document the contrast assumption.
> - `video` (src + poster): muted, loop, playsInline. A small client part shows only the poster under `prefers-reduced-motion` and offers a visible pause/play button (WCAG 2.2.2).
> - Content slot for Heading/Text/Button.
>
> Tests (structure, reduced-motion branch with a mocked `matchMedia`, pause button, axe), stories, exports.

**Done when:** `pnpm check` is green.

### S28: 0.6.0 + showcase Display + hardening (60 min)

**Prompt:**

> S28. Release prep 0.6.0 and the [Definition of Done](#definition-of-done-every-release). Do NOT publish or tag. **After the release workflow publishes:** site → 0.6.0; Display page (Card grid, Tabs, Banner variants including video with a small committed or remote sample). Polish the `/components` index (counts, links). Extend `clean-install.sh` to render one form and one display component. E2E/axe across all showcase pages; 320px and 200% zoom checks on Display.

**You do:** partway through the session, merge the release-prep PR, push tag `v0.6.0` and approve the `npm-publish` deployment (D-069).
**Done when:** npm shows 0.6.0 with provenance; site build and e2e are green; clean-install passes. Push and open PR `m10-display`.

---

## M11 Themes → 0.7.0

### S29: Theme direction (60 min)

**Prompt:**

> S29. Propose Corporate, Nature and Quirky (D-053). For each, write `tokens/themes/<name>/*.json` with every themeable key:
>
> - Palettes as OKLCH-built 50–950 scales, converted to hex.
> - Heading and body fonts (free Google Fonts).
> - Radius, border widths, shadows, density (space, control sizes), motion.
>
> Starting directions:
>
> - **Corporate:** navy/blue, IBM Plex Sans, small radius, crisp shadows, compact.
> - **Nature:** forest/moss with earth neutrals, Fraunces headings + Nunito Sans body, soft radius, diffuse shadows, relaxed spacing, gentle motion.
> - **Quirky:** violet + coral accent, Bricolage Grotesque, pill/large radius, offset hard shadows, bouncy easing.
>
> Add to `resolver.json`. Storybook: a theme toolbar (`globalTypes` + a decorator that wraps the story in `ThemeScope` with `themes/<name>.json`, so portals stay themed; Storybook loads the theme fonts) and a "Theme specimen" story with every category. Write `docs/themes.md` (rationale, fonts and how consumers load them, contrast table). The full contrast matrix (every tone × role) must pass for all four themes.

**You do:** review in Storybook (local), then approve or list adjustments in PROGRESS.md.
**Done when:** `pnpm check` is green for four themes; your feedback is recorded.

### S30: Corporate + Nature final (50 min)

**Prompt:**

> S30. Apply Purander's feedback to Corporate and Nature. Re-run contrast; check every component story in both themes (a11y addon); update `docs/themes.md` with the final values and font-loading snippets (`next/font`, plain `<link>`).

**Done when:** `pnpm check` is green; both themes are signed off in PROGRESS.

### S31: Quirky + theme QA (50 min)

**Prompt:**

> S31. Finalise Quirky from feedback. Do a visual and a11y pass of every story in all four themes; fix at the right tier (theme token → semantic → recipe → component). Record any component that needed a change and why.

**Done when:** `pnpm check` is green; all four themes are signed off.

### S32: 0.7.0 + site theme switcher (60 min)

**Prompt:**

> S32. Release prep 0.7.0 (CHANGELOG, README theme section, tarball check importing a non-Base theme, the [Definition of Done](#definition-of-done-every-release)). Do NOT publish or tag. **After the release workflow publishes:**
>
> - Site → 0.7.0. A header theme switcher (client): `import()` the chosen `@puranderdua/ui/themes/<name>.json` (one chunk per theme; only the active one loads) and apply its vars on `<html>`.
> - Remember the choice and cache the map in localStorage. An inline `<head>` script applies the cached map before paint (no flash).
> - `next/font` for every theme font, `preload: false` for non-default ones, mapped through the theme's font-family vars.
> - E2E: axe 0 violations on every showcase page × 4 themes; switching updates a known token's computed value; reload keeps the theme.

**You do:** partway through the session, merge the release-prep PR, push tag `v0.7.0` and approve the `npm-publish` deployment (D-069).
**Done when:** npm shows 0.7.0 with provenance; site e2e is green across themes. Push and open PR `m11-themes`.

---

## M12 Theme playground (site only)

### S33: Playground engine (60 min)

**You do first:** approve `culori` and `vitest` for `apps/site` (pre-approved here).

**Prompt:**

> S33. Pure TypeScript engine in `apps/site/src/playground/` (no UI yet):
>
> - State = starting theme (one of the four JSON maps) + knobs + per-token overrides.
> - Knobs: brand colour, accent colour, neutral tint/chroma, heading font, body font (from a curated list of loaded fonts), radius scale, border width, shadow strength, density, motion speed.
> - Generators: `culori` OKLCH ramps → hex scales; density and radius scale the dimension primitives; shadow strength scales alpha/blur.
> - Re-resolve semantics through the theme JSON's `refs`; overrides win.
> - Outputs: resolved var map; a DTCG theme document shaped like `tokens/themes/<name>/`; a CSS string shaped like `themes/<name>.css`.
> - Contrast: evaluate `@puranderdua/ui/contrast-pairs.json` on the resolved map.
>
> Vitest unit tests: ramps are monotonic in lightness, an unchanged state equals the starting theme, overrides win, contrast results match `scripts/contrast.mjs` for Base.

**Done when:** site unit tests and `pnpm check` are green.

### S34: Playground UI (60 min)

**Prompt:**

> S34. `/playground` page (client):
>
> - Knob panel built from package form components.
> - Advanced panel listing every semantic token grouped by category, with colour/dimension inputs.
> - Preview = a `ThemeScope` with the resolved vars, rendering the showcase examples; portals (Select) land inside it via `usePortalContainer`, so popovers stay themed without per-call `container` props.
> - Contrast badges per pair (pass/fail with ratio).
> - Start-from-theme picker, reset, and localStorage persistence of the last state.
> - Every change updates the preview without a reload.
>
> E2E: changing the brand colour changes the preview's primary button background; reload keeps the edit; axe clean on the page chrome.

**Done when:** site e2e is green.

### S35: Export + Release 1 wrap-up (60 min)

**Prompt:**

> S35. Export: download/copy DTCG JSON and CSS from the playground. Round-trip test: write an exported theme to a scratch copy of `tokens/themes/custom/`, add it to a scratch resolver, and confirm `build-tokens`, `validate-tokens` (completeness) and contrast pass. Docs: root README (themes, showcase, playground links), CHANGELOG, `docs/releases/v1.md` (scope, evidence, known gaps), and a Release 1 retro in PROGRESS.md (time per session, what broke, next slice: dark mode).

**You do:** review and merge PR `m12-playground`, redeploy the site, and create a GitHub Release for Release 1 (on the `v0.7.0` tag).
**Done when:** every Goal item at the top of this file is checked.

---

## After Release 1

| Release | Adds                                                                    |
| ------- | ----------------------------------------------------------------------- |
| 2       | Dark mode per theme (`mode: dark` sources; switcher gets a mode toggle) |
| 3       | Textarea, Switch, Dialog, Toast, Tooltip                                |
| 4       | Navigation (Navbar, Breadcrumb, Pagination), playground share URL       |
