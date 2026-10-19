# Release 1 plan: single channel → component showcase → themes → theme playground

Release 0 (v0.1.0, tagged) is archived in [`plans/release-0.md`](plans/release-0.md). This file always holds the current release (D-054).

## Goal (Release 1, done when all are true)

1. **Single channel.** The shadcn registry is gone from the repo and from Vercel. `@puranderdua/ui` on npm is the only source of truth for every component, including Text, Heading and Button (D-055).
2. **Components.** `@puranderdua/ui@0.6.0` on npm ships every component in five categories:
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

## Milestones

| Milestone                                  | Sessions | npm release | Branch → PR      |
| ------------------------------------------ | -------- | ----------- | ---------------- |
| **M7 Single channel + theme-ready tokens** | S13–S17  | 0.2.0       | `m7-foundations` |
| **M8 Layout + Actions**                    | S18–S21  | 0.3.0       | `m8-layout`      |
| **M9 Forms**                               | S22–S25  | 0.4.0       | `m9-forms`       |
| **M10 Display**                            | S26–S28  | 0.5.0       | `m10-display`    |
| **M11 Themes**                             | S29–S32  | 0.6.0       | `m11-themes`     |
| **M12 Theme playground**                   | S33–S35  | (site only) | `m12-playground` |

**Total:** 23 sessions, about 21 hours.

**Order rationale (D-044):** single channel first, so new work isn't built twice. Then the token structure becomes theme-ready, so every component is built once against the final contract. Components and the showcase come next, then themes (values only), then the playground.

**Release rhythm (D-050):** each milestone publishes one npm minor. The release-prep session ends with **you** running `npm publish`. The next session bumps `apps/site` to that exact version and builds that category's showcase page. After merging the milestone PR, you tag `v<version>` on `main` and redeploy the site.

## How to run every session

**Start (paste into a fresh Claude Code session):**

> Read CLAUDE.md and docs/PROGRESS.md, then only the "S<n>" section of docs/PLAN.md. Do only that session's task. Show me a short plan before editing, then implement. Stop when the "Done when" checks pass.

**End:**

> Run the Done-when checks, update PROGRESS.md and DECISIONS.md, and commit as "S<n>: …".

Then `/clear`, or start a new session. On the last session of a milestone, the AI pushes the branch and opens or edits the PR; wait for CI; Purander reviews and merges. The next milestone branch is cut from the updated `main`.

**If a session runs over 60 minutes:** stop, have the AI write the remaining work into PROGRESS.md "Next", commit, and continue in a fresh session.

**Pre-approved dependencies** (only in the session that names them): `radix-ui` (S16), `lucide-react` (S20), `culori` and `vitest` in `apps/site` (S33). Anything else needs asking first.

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
- Portal components (Select) accept a `container` prop, so the playground's scoped preview can theme them.

**Per component, every time:** static variant maps, semantic tokens only, `data-slot`, typed props/refs (D-034), tests (behaviour, keyboard, axe), a Storybook story, an export from `src/index.ts`, and the README component list.

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

## M10 Display → 0.5.0

### S26: Card + Tabs (60 min)

**Prompt:**

> S26. `Card` parts: Card (`variant` outline | raised, using `radius.card`, `elevation.raised`, `surface.raised`), CardMedia, CardHeader, CardTitle (Heading underneath, `as` configurable), CardDescription, CardContent, CardFooter. `Tabs`: adapt shadcn new-york-v4 `tabs` on `radix-ui` (List, Trigger, Content; provenance doc; `activationMode` passthrough); token-only classes. Tests (roving focus, arrow keys, Home/End, axe), stories, exports.

**Done when:** `pnpm check` is green.

### S27: Banner (60 min)

**Prompt:**

> S27. `Banner` (full-screen hero):
>
> - `height` screen (100svh) | tall; `align` start | center.
> - `tone` canvas | brand | inverse | gradient (gradient recipe built from brand tokens).
> - `media` slot for any `<img>`/`next/image` (object-cover) with an `overlay.scrim` layer whose strength keeps text readable; document the contrast assumption.
> - `video` (src + poster): muted, loop, playsInline. A small client part shows only the poster under `prefers-reduced-motion` and offers a visible pause/play button (WCAG 2.2.2).
> - Content slot for Heading/Text/Button.
>
> Tests (structure, reduced-motion branch with a mocked `matchMedia`, pause button, axe), stories, exports.

**Done when:** `pnpm check` is green.

### S28: 0.5.0 + showcase Display + hardening (60 min)

**Prompt:**

> S28. Release prep 0.5.0. Do NOT publish. **After Purander publishes:** site → 0.5.0; Display page (Card grid, Tabs, Banner variants including video with a small committed or remote sample). Polish the `/components` index (counts, links). Extend `clean-install.sh` to render one form and one display component. E2E/axe across all showcase pages; 320px and 200% zoom checks on Display.

**You do:** `npm publish` 0.5.0 partway through the session.
**Done when:** npm shows 0.5.0; site build and e2e are green; clean-install passes. Push and open PR `m10-display`.

---

## M11 Themes → 0.6.0

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
> Add to `resolver.json`. Storybook: a theme toolbar (`globalTypes` + a decorator that applies `themes/<name>.json` as inline vars on the story root; Storybook loads the theme fonts) and a "Theme specimen" story with every category. Write `docs/themes.md` (rationale, fonts and how consumers load them, contrast table). Contrast must pass for all four themes.

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

### S32: 0.6.0 + site theme switcher (60 min)

**Prompt:**

> S32. Release prep 0.6.0 (CHANGELOG, README theme section, tarball check importing a non-Base theme). Do NOT publish. **After Purander publishes:**
>
> - Site → 0.6.0. A header theme switcher (client): `import()` the chosen `@puranderdua/ui/themes/<name>.json` (one chunk per theme; only the active one loads) and apply its vars on `<html>`.
> - Remember the choice and cache the map in localStorage. An inline `<head>` script applies the cached map before paint (no flash).
> - `next/font` for every theme font, `preload: false` for non-default ones, mapped through the theme's font-family vars.
> - E2E: axe 0 violations on every showcase page × 4 themes; switching updates a known token's computed value; reload keeps the theme.

**You do:** `npm publish` 0.6.0 partway through the session.
**Done when:** npm shows 0.6.0; site e2e is green across themes. Push and open PR `m11-themes`.

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
> - Preview = a scope element with the resolved vars inline, rendering the showcase examples. Select gets `container` so popovers stay themed.
> - Contrast badges per pair (pass/fail with ratio).
> - Start-from-theme picker, reset, and localStorage persistence of the last state.
> - Every change updates the preview without a reload.
>
> E2E: changing the brand colour changes the preview's primary button background; reload keeps the edit; axe clean on the page chrome.

**Done when:** site e2e is green.

### S35: Export + Release 1 wrap-up (60 min)

**Prompt:**

> S35. Export: download/copy DTCG JSON and CSS from the playground. Round-trip test: write an exported theme to a scratch copy of `tokens/themes/custom/`, add it to a scratch resolver, and confirm `build-tokens`, `validate-tokens` (completeness) and contrast pass. Docs: root README (themes, showcase, playground links), CHANGELOG, `docs/releases/v1.md` (scope, evidence, known gaps), and a Release 1 retro in PROGRESS.md (time per session, what broke, next slice: dark mode).

**You do:** review and merge PR `m12-playground`, redeploy the site, and create a GitHub Release for Release 1 (on the `v0.6.0` tag).
**Done when:** every Goal item at the top of this file is checked.

---

## After Release 1

| Release | Adds                                                                    |
| ------- | ----------------------------------------------------------------------- |
| 2       | Dark mode per theme (`mode: dark` sources; switcher gets a mode toggle) |
| 3       | Textarea, Switch, Dialog, Toast, Tooltip                                |
| 4       | Navigation (Navbar, Breadcrumb, Pagination), playground share URL       |
