# Decisions log

Short ADR-style log. One `### D-0NN` section per decision, newest at the bottom. Format: the decision, then `**Why:**`.

### D-001

One monorepo `ui-design-system`, pnpm workspaces. No multi-agent infra, so no `.agents/`, adapters or sync scripts.

**Why:** Solo build with AI assistance; blueprint B0 track dropped.

### D-002

Release 0 scope: Typography (Text, Heading) and Button through all 4 tiers.

**Why:** Same as blueprint v6; breadth comes later.

### D-003

Canonical tokens: DTCG JSON → Style Dictionary v4 → `--ds-*` CSS variables.

**Why:** Portable source of truth, not tied to Tailwind or Penpot.

### D-004

_(Values part superseded by D-056: `foundations.css` no longer carries token values.)_ One published package, **`@puranderdua/ui`**, that also ships `foundations.css` (tokens + `@theme` bridge + recipes). No separate tokens package.

**Why:** Fewer moving parts; one version to pin.

### D-005

Consumers must use Tailwind v4. The package ships CSS source; consumers add `@source` for the package `dist`. No precompiled Tailwind CSS.

**Why:** Avoids clashing base styles; shadcn requires Tailwind anyway.

### D-006

Button adopted from shadcn/ui, adapted to tokens. Variants `primary`, `secondary`; sizes `sm`, `md`. Provenance in `docs/provenance/button.md`.

**Why:** Proven accessible base; still fully owned source.

### D-007

_(Superseded by D-055: registry retired.)_ Registry: static shadcn registry on Vercel; fixed version paths `/r/v0.1.0/` plus `/r/latest/`; namespace `@puranderdua`.

**Why:** Real remote installs; reproducible pins.

### D-008

_(Superseded by D-055: registry retired.)_ `ds-foundations` is a single `foundations.css` file, byte-identical to the package's `foundations.css`. A consumer imports it **once**, from whichever channel it uses. CI checks the two are identical.

**Why:** Prevents tokens being defined twice in a consumer that uses both channels.

### D-009

_(Button part superseded by D-055: the site imports Button from the package.)_ Consumer site: Next.js App Router on Vercel. Text/Heading come from npm `@puranderdua/ui@0.1.0` (pinned). Button comes via `shadcn add @puranderdua/ds-button`. A lint rule bans importing Button from the package in the site.

**Why:** Proves both channels on a real site.

### D-010

Button click outcome on the site: `alert("Button clicked")`.

**Why:** Simple, verifiable outcome; Playwright handles the dialog.

### D-011

_(Registry half dropped by D-055; the package app stays.)_ Clean-install proof is a script (`scripts/clean-install.sh`) that creates a fresh Next app outside the repo, not a permanent fixture app.

**Why:** Cheaper than the blueprint's reverse-path fixture; still proves no monorepo-only shortcuts.

### D-012

Process: branch per milestone, commit per session, PR per milestone, CI must pass before merge.

**Why:** Lightweight stand-in for the blueprint's per-task human approval.

### D-013

Penpot (hosted) is a light visual reference only: imported tokens plus one specimen board. No sync automation.

**Why:** Blueprint parity on intent, minimal cost.

### D-014

If short on time, cut in this order: Penpot → Storybook → clean-install script → update/rollback tests.

**Why:** Agreed cut order.

### D-015

AI may commit, push milestone branches and create/edit PRs; the maintainer alone merges PRs. AI never force-pushes, pushes `main`, tags, deploys or publishes to npm.

**Why:** Faster iteration while keeping final authority over what lands.

### D-016

Primary color `#595959` (neutral gray), font Inter.

**Why:** Brand choice at S1; gray gives ~7:1 on white.

### D-017

Token keys never contain `.`; fractional spacing uses a hyphen (`space.1-5`). Font family is one stack token `font.family.sans`; line-height is unitless.

**Why:** `.` separates alias paths; unitless line-height scales with font size.

### D-018

Added primitive `size.control.{sm,md}` (2rem, 2.5rem) and semantic `focus.ring-width`, `focus.ring-offset`.

**Why:** Control heights aren't on the spacing scale; components may only use semantic tokens.

### D-019

`validate-tokens` enforces: primitives hold raw values, semantics hold aliases to primitives only (no semantic→semantic).

**Why:** Keeps the tier rule mechanical.

### D-020

Style Dictionary pinned to v4 (`^4.4`, `usesDtcg: true`); typography composites expand to per-property vars via `expand.include: ["typography"]`. Generated `tokens.css` and `tokens.json` are committed.

**Why:** v5 is current on npm, but the plan specifies v4. Committed output lets `tokens:check` catch stale builds.

### D-021

`tokens:check` = validate-tokens, rebuild into a temp dir and diff against committed output, then WCAG AA 4.5:1 contrast on resolved colors (text, primary incl. hover/active, secondary incl. hover/active). Contrast needed no token changes.

**Why:** Mechanical, deterministic gate in `pnpm check` and CI.

### D-022

`pnpm-workspace.yaml` `allowBuilds` sets `style-dictionary` and `@bundled-es-modules/glob` to `false`.

**Why:** Neither needs install scripts; stops pnpm 11 failing installs with ERR_PNPM_IGNORED_BUILDS.

### D-023

`validate-tokens` also enforces: alias target `$type` matches the referring token (typography parts: fontSize/letterSpacing→dimension, etc.), primitive value formats (`#rrggbb`, number+rem/em/px, integer weight, finite number), and a `$description` on every semantic token.

**Why:** Wrong-type aliases and malformed values used to pass validation and surface only as broken CSS.

### D-024

Contrast gate also checks 3:1 non-text pairs (focus ring on canvas, secondary border on its three fills). `disabled.*` is exempt and `border.default` is decorative; both are documented in `contrast.mjs`.

**Why:** WCAG 1.4.11; keeps the exemptions explicit instead of silent.

### D-025

Palette roles: `brand` (achromatic, D-016) is for interactive accents (actions, focus, secondary border); `neutral` (cool slate) is for text, surfaces, separators and disabled. The slight tint difference is accepted. Naming: primitives `ring.*` / `border-width.*` are raw metrics; components use semantic `focus.ring-*` and `border.default`.

**Why:** Keeps brand identity grey while text/surfaces stay readable; revisit if Button visuals look inconsistent in S6.

### D-026

`tokens:check` also runs `scripts/test-token-propagation.mjs`: changing a primitive in a temp copy must change exactly that primitive plus its `var()` dependents in `tokens.json`, and only that one line in `tokens.css`. Build uses a custom `css/variables-ds` format: no repeated descriptions on expanded typography vars, space tokens in numeric order.

**Why:** Turns the S3 "changing a primitive changes every dependent" check into a regression test.

### D-027

Bridge maps semantic vars only, with `-ds-` namespaces: `--color-ds-*`, `--text-ds-<role>` (+ `--line-height`/`--font-weight`/`--letter-spacing` companions), `--font-ds-sans`, `--radius-ds-control`, and `--spacing-ds-control-*` for control height/padding (needed so Button avoids arbitrary values).

**Why:** Utilities stay token-backed; `inline` keeps values as `var()` refs.

### D-028

Recipes: `.ds-type-<role>` (family + role composite) and `.ds-focus-ring` (outline width/offset have no Tailwind namespace). `playground:check` is part of `pnpm check`.

**Why:** Composites utilities can't express in one class; mechanical proof the built CSS contains every class.

### D-029

`cn` is `twMerge(clsx())` with `extendTailwindMerge` registering the `text-ds-<role>` font sizes.

**Why:** Without it, tailwind-merge treats `text-ds-body` as a colour and drops it when merged with `text-ds-text-muted`.

### D-030

Text/Heading classes: base `text-ds-text` + `ds-type-<role>` recipe; caption adds `text-ds-text-muted`. Heading default element comes from a static map (`display`→h1); default variant is `h1`. Tests use `vite-tsconfig-paths` as specified, though Vite 8 can do it natively (`resolve.tsconfigPaths`).

**Why:** Recipes already carry size/weight/leading/tracking; map keeps `as` independent of `variant`.

### D-031

Review of Text/Heading (external, 2026-10-17): adopted JSX, `data-slot`, element-specific props/ref types for `Text` (`htmlFor` only on `as="label"`). Superseded in part by D-033 (React 19 only, no `forwardRef`; `cn()` now dedupes `ds-type-*`). `label` stays in `Text`'s `as` (form elements will follow).

**Why:** Idiomatic and typed API without dropping React 18 or the S5 spec.

### D-032

`textVariants` no longer has a shared base colour: each variant carries its own (`text-ds-text` or `text-ds-text-muted`). `cn` has unit tests, including one that fails if a `--text-ds-*` size in `theme.css` is missing from the `tailwind-merge` extension. axe's canvas probe is stubbed in test setup (contrast is covered by `tokens:check`).

**Why:** Raw `textVariants()` output (public export) had two competing colour utilities; the hand-kept size list could silently drift.

### D-033

React 19 only: peer deps `^19`, no `forwardRef`, `ref` is a plain prop. `ref` is typed by `StrictRef` (`src/lib/types.ts`) because React's `RefCallback` is bivariant; type tests (`ref-types.test.tsx`) use `@ts-expect-error`. TypeScript still can't separate p/span/div object refs (identical DOM interfaces, covariant `RefObject`). `cn()` treats `ds-type-*` as one group (later wins, so `className` overrides `variant`) and a recipe replaces earlier loose type utilities. The `text-ds-*` size and `ds-type-*` lists are generated from `theme.css` into `src/lib/generated/ds-classes.ts` by `build-foundations`, with a test that fails if they go stale. `label` stays in `Text`'s `as`.

**Why:** Decisions from the maintainer's review; removes the hand-kept lists and the "use variant not className" caveat.

### D-034

Ref habits (TypeScript cannot separate p/span/div object refs, D-033): (1) type a ref from the same tag passed to `as`, e.g. `createRef<HTMLSpanElement>()` with `as="span"`, `HTMLHeadingElement` for `Heading`; (2) prefer callback refs, which `StrictRef` checks strictly, over object refs. Applies to code, tests, stories and docs.

**Why:** The compiler catches wrong callback refs and some object refs, but not an object ref typed with a different p/span/div-like element.

### D-035

Components are declared as `export const X = (props) => {}`, not `export function X()`.

**Why:** Project style preference (the maintainer); applies to Text, Heading and all later components.

### D-036

_(Slot dependency superseded by D-049: `Slot` comes from `radix-ui`.)_ Button adapted from shadcn `new-york-v4` (provenance in `docs/provenance/button.md`): variants primary and secondary, sizes sm and md, token utilities only, `.ds-focus-ring` for focus, `disabled.*` tokens, `type="button"` default except under `asChild`. Uses `@radix-ui/react-slot` rather than the `radix-ui` umbrella.

**Why:** Smaller dependency; matches the plan's allowed deps.

### D-037

`@puranderdua/ui` 0.1.0 is built with tsup (ESM + `.d.ts`, single entry, react/react-dom/radix external, `@/` resolved by esbuild). No `"use client"` banner: a tarball Next 16 app rendered Text, Heading and Button in a Server Component. `build` runs tsup first (it cleans `dist`), then `build-foundations`. `esbuild` is `false` in `allowBuilds`.

**Why:** Tested rather than assumed; avoids forcing client bundles on server-only consumers.

### D-038

_(Superseded by D-055: registry retired.)_ Registry: `registry.json` is a template (`{{VERSION}}`, `{{REGISTRY_URL}}`) resolved by `scripts/build-registry.mjs` before `shadcn build`. Extra item `ds-types` (`registry:lib`, `lib/types.ts`) because Text, Heading and Button import `@/lib/types`. Components depend on an extra `ds-utils` item (the extended `cn` of D-029 plus its generated class lists, installed over `lib/utils.ts`) instead of shadcn's `utils`: stock tailwind-merge drops Button's `text-ds-primary-fg` next to `text-ds-control-md` (found in PR review). Component files have explicit flat targets `components/ui/<file>` (otherwise the CLI nests the source path). The registry host lives in `registry.config.json` (env `REGISTRY_URL` wins); the build fails on a bad URL and refuses to change an already-built version without `--force`, since `/r/v*` is served as immutable. `apps/registry/public/r/**` is committed (Vercel deploys it as is) and CI checks it is up to date. `shadcn` 4.22.0 is a root dev dependency; its age-policy exclusion (`minimumReleaseAgeExclude`) is a conscious exception.

**Why:** The plan's item list missed the types import; versioned URLs need the version in the manifest; Vercel root has no build step.

### D-039

_(Superseded by D-055: registry retired.)_ Vercel Git deployments are off for the registry project (`git.deploymentEnabled: false` in `apps/registry/vercel.json`). Merging does not change the live registry; the maintainer deploys by hand. Consequence: no Vercel preview checks on PRs.

### D-040

_(Registry Button, `ds-foundations` import and the lint ban superseded by D-055.)_ `apps/site` (Next 16.4.2, from create-next-app): `@puranderdua/ui` is pinned `0.1.0` from npm (pnpm still symlinks into `node_modules/.pnpm/@puranderdua+ui@0.1.0…`, which is the registry copy, not `packages/ui`; `link-workspace-packages` is off). Button is the registry copy (`ds-button` via `shadcn add`); an ESLint `no-restricted-imports` rule bans `Button` and `buttonVariants` from the package. `globals.css` imports only `ds-foundations.css` (not the package's), with `@source` on the package dist. Inter comes from `next/font` (`--font-inter`) and overrides `--ds-font-family-sans` after the foundations import. The default shadcn theme and `tw-animate-css` that `shadcn init` writes were removed, along with its unused deps (`@base-ui/react`, `lucide-react`, `cn`, `shadcn`).

**Why:** Keeps the site on design-system tokens only; the lint rule enforces the two-channel split from CLAUDE.md.

### D-041

Site E2E: `@playwright/test` pinned to 1.54.2 (Chromium build 1181, already cached locally) with `@axe-core/playwright` in `apps/site`. `SITE_URL` points the suite at a deployed preview; otherwise Playwright starts `next start --port 3100`. CI installs Chromium and runs `pnpm --filter site test:e2e` against that local server. 200% zoom is emulated as a 640px viewport (CSS `zoom` is not browser zoom).

**Why:** Matches the plan (preview URL via env var, local `next start` in CI) without a browser download.

### D-042

`apps/docs` is Storybook 10 (`@storybook/react-vite` + `@storybook/addon-a11y`, `@tailwindcss/vite`), hand-scaffolded. It consumes `@puranderdua/ui` via `workspace:*` (unlike `apps/site`, it documents the source package) and imports `foundations.css` with `@source` on the package dist; scripts build the package first. The a11y addon runs with `test: "error"`. Telemetry off. `build-storybook` is part of `pnpm check`; `storybook-static` is ignored by git, ESLint and Prettier.

**Why:** Stories show exactly what ships; failing a11y in stories keeps docs honest.

### D-043

AI sessions use the native tools for file work: Read to view files, Edit/Write to change them, Grep/Glob to search. No `cat`, `head`, `tail`, `sed`, `awk`, `find`, `echo >` or `python3` one-liners for reading or editing files by default. If a session has no Grep/Glob tool, a read-only `rg`/`grep`/`ls` command is acceptable for searching only. Bash is otherwise for running project commands (pnpm, git, gh, node scripts, tests).

**Why:** The maintainer's preference (2026-10-19): native tools are reviewable and permission-friendly, and they keep edits exact.

### D-044

Release 1 scope and order: (1) single npm channel, (2) theme-ready token structure, (3) components + showcase by category (Typography, Layout, Forms, Actions, Display), (4) themes Corporate, Nature, Quirky, (5) theme playground. Plan in `docs/PLAN.md` (S13–S35).

**Why:** Building the token contract before components means each component is built once; themes are then values only.

### D-045

The showcase (`/components/*`) and playground (`/playground`) are routes in `apps/site`. The site keeps a pinned npm version (never `workspace:*`), so each category's page follows its npm release.

**Why:** Showcase lives with the portfolio and exercises the real release path.

### D-046

Theme shipping: `foundations.css` = Tailwind bridge + recipes, no values. Each theme ships as `themes/<name>.css` (`:root` vars with references; a consumer imports exactly one) and `themes/<name>.json` (fully resolved flat var map + semantic→primitive alias refs). Live switching (site, Storybook, playground) applies a JSON map as inline CSS vars on `<html>` or a scope element and loads only the active theme. Base (today's grey/Inter) is the default theme. Breakpoints are shared, not themeable.

**Why:** A consumer ships one theme's CSS, yet live switching works. Resolved maps avoid the scoped-`var()` gotcha (a semantic declared on `:root` does not re-resolve when a descendant overrides a primitive). Media queries can't read custom properties.

### D-047

Token manifest `tokens/resolver.json` follows the DTCG Resolver Module 2025.10 shape: a `theme` modifier (base, corporate, nature, quirky) and a `mode` modifier (`light` only; `dark` reserved). `scripts/build-tokens.mjs` resolves it. Dark mode later = add `mode: dark` sources and an extra output per theme, with no component changes.

**Why:** Standard model for themes and modes; Style Dictionary resolver support is unverified, so our build resolves it.

### D-048

Every theme defines every themeable category: colour, typography (heading/body families, sizes, weights, leading, tracking), shape (radius, border widths), elevation (shadows), density (spacing, control and layout sizes) and motion (durations, easings). `validate-tokens` fails if a theme's keys differ from Base's; contrast runs per theme.

**Why:** The maintainer wants each theme fully its own; completeness checks prevent silent fallbacks.

### D-049

Interactive components are adapted from shadcn new-york-v4 source on the unified `radix-ui` package (Button moves its `Slot` there too); icons come from `lucide-react`. Each adopted component gets a provenance doc. Client components carry `"use client"` and the package build must keep it. Portal components accept a `container` prop.

**Why:** Proven accessible primitives; shadcn now imports from `radix-ui` (Feb 2026); scoped previews need portals inside the theme scope.

### D-050

One npm minor per milestone: 0.2.0 (M7), 0.3.0 (M8), 0.4.0 (M9), 0.5.0 (M10), 0.6.0 (M11). The maintainer publishes; the site bumps after each publish; tags go on `main` after the milestone PR merges.

**Why:** Steady, reviewable releases; each showcase page follows its release.

### D-051

Storybook keeps up: each component session adds stories; a theme toolbar (`globalTypes` + a decorator applying the theme's JSON map) switches themes without shipping all theme CSS.

**Why:** Storybook stays the developer reference, and the toolbar uses the same mechanism as the site.

### D-052

Theme playground: high-level knobs (brand, accent, neutral, fonts, radius, border, shadow, density, motion) that generate scales, plus an Advanced panel for any semantic token; live contrast badges using the package's `contrast-pairs.json`; `culori` (site only) for OKLCH maths; export DTCG JSON and CSS; last state kept in localStorage. No share URL.

**Why:** The maintainer's choices; exports round-trip into `tokens/themes/`.

### D-053

Theme direction: the AI drafts Corporate, Nature and Quirky (palettes, fonts, shape, elevation, density, motion) and shows them in a Storybook specimen; the maintainer approves or adjusts before the values are final.

**Why:** Fast first draft; final say stays with the maintainer.

### D-054

`docs/PLAN.md` always holds the current release; finished plans are archived in `docs/plans/` (Release 0 → `docs/plans/release-0.md`).

**Why:** Sessions read one short, current plan.

### D-055

The shadcn registry is retired: the npm package `@puranderdua/ui` is the only source of truth and distribution channel for every component, including Text, Heading and Button. Registry files, scripts, CI steps and the Vercel project are removed in S13; the site imports Button from the package. shadcn remains a source of code to adapt (with provenance), not a channel.

**Why:** The maintainer wants one source of truth for components.

### D-056

From 0.2.0, `foundations.css` no longer carries token values (breaking at 0.x); consumers import `foundations.css` plus one `themes/<name>.css`.

**Why:** Lets a consumer ship exactly one theme (D-046).

### D-057

Vercel Git deployments are off for every app (`git.deploymentEnabled: false` in `apps/site/vercel.json` and `apps/docs/vercel.json`). Merging does not deploy; the maintainer deploys by hand. Generalises D-039.

**Why:** No surprise deploys; deploys are a deliberate step (CLAUDE.md: never deploy).

### D-058

S14 theme pipeline: all existing primitives moved to `tokens/themes/base/`; `tokens/primitives/` holds only shared values (breakpoints), which are validated but not emitted or bridged yet. `build-tokens` resolves `tokens/resolver.json` and writes `generated/themes/<name>.css` + `<name>.json` (`{ vars, refs }`); the old single `tokens.css`/`tokens.json` are removed (no Base alias kept, nothing needs them). Base output is byte-identical to the old `tokens.css` and var-for-var identical to the old `tokens.json`. `scripts/test-second-theme.mjs` (in `tokens:check`) builds a scratch second theme and proves completeness and per-theme contrast fail when they should. `@puranderdua/ui` exports `./themes/*.css` and `./themes/*.json`.

**Why:** Implements D-046 to D-048. Keeping aliases would leave two sources for the same values. Emitting breakpoints as vars is pointless while media queries cannot read them.

### D-059

S15 token categories. Primitives (themeable, `tokens/themes/base/`): `font.family.{heading,body}` (replace `sans`), `color.red.*`, `color.scrim` (8-digit hex allowed), more `space.*`, `size.container.*`, `size.sidebar`, `radius.{lg,full}`, `border-width.{1,2}`, and `effects.json` (`shadow.*`, `duration.*`, `easing.*`). Semantics: colour roles, `radius.{control,card,pill}` (replaces `control.radius`), `border-width.{default,strong}`, `elevation.*`, `motion.*`, `layout.*`. `validate-tokens` accepts `shadow`, `duration` (`"100ms"`), `cubicBezier` (`[x1,y1,x2,y2]`). Contrast pairs live in `tokens/contrast-pairs.json` (dotted semantic names, `min` of `text` 4.5 or `ui` 3), are read per theme by `contrast.mjs` and checked by `validate-tokens`. Bridge: `font-ds-heading|body` replace `font-ds-sans`; `.ds-type-*` read their own family var; Tailwind has no border-width or duration namespace, so `.ds-border*` and `.ds-transition*` are recipes (reduced motion sets duration 0s). `cn()` gets shadow, radius, container, spacing and ease names from `theme.css` via tailwind-merge `theme`.

**Why:** Components need these categories in every theme (D-048); recipes keep arbitrary values out of components; the pairs file is what the playground will read (D-052).

### D-060

0.2.0 package surface: Button imports `Slot` from the unified `radix-ui` package (`Slot.Root`; `@radix-ui/react-slot` removed; tsup keeps `radix-ui` external). `contrast-pairs.json` is shipped in the package (`./contrast-pairs.json` export, copied by `build-foundations`) for the playground (S34). The 0.2.0 CHANGELOG lists the breaking changes (no values in `foundations.css`, `sans` → `body`/`heading` font vars, `control.radius` → `radius.control`, registry retired). Verified with a throwaway Next app that installs the packed tarball.

**Why:** Implements D-049 and D-056; consumers get the contrast contract without cloning the repo.

### D-061

Layout primitives (Container, Grid, Stack, Cluster): `as` is typed per element with the shared `AsProps<Default, Others>` helper (native props and ref type per tag, D-034). Variants are static `Record` maps (gap in `lib/layout.ts`). Grid auto-fit uses new tokens `size.item.*` → `layout.item-min.*` and recipes `.ds-grid-fit-sm|md|lg` in `theme.css`; `cols` is ignored when `minItemWidth` is set. All `cols` maps start at one column on small screens.

**Why:** Arbitrary values are banned, and Tailwind has no namespace for a token-driven `minmax()`, so a recipe keeps the min width in a token.

### D-062

Page layout (Section, Split, Sidebar): no new tokens or recipes. Section tone sets surface and text together from existing contrast-checked pairs (muted text is not used on inverse/brand, so no new pairs). Split uses static `md:` grid classes (1:2 / 2:1 span the wider child over 3 tracks via `[&>:first-child]` variants); `reverse` is visual only from `md`. Sidebar is flex: aside `w-ds-sidebar` (`layout.sidebar-width`) and content `min-w-0 flex-1 min-w-1/2`, `collapseBelow` md|lg, `sidebarAs` aside|nav|div because an `aside` inside `<main>` trips axe. Storybook gained `narrow` (320px) and `desktop` viewports.

### D-063

Link (S20): `variant` inline | standalone. Inline is always underlined (non-colour cue, WCAG 1.4.1); standalone is `font-medium`, underlined on hover and focus-visible. Colours are `text.link` / `text.link-hover` (contrast pairs already listed); focus uses `ds-focus-ring`. `external` sets `target="_blank"` and `rel="noopener noreferrer"`, appends a lucide `ExternalLink` (aria-hidden, `size-4`) and an `sr-only` "(opens in a new tab)" with a real space text node before it. `Slot.Slottable` wraps `children` so `asChild` works with or without the extra nodes. `lucide-react` is a runtime dependency (pre-approved for S20), externalised by tsup because it is in `dependencies`.

### D-064

S16–S21 review fixes. (1) Split and Sidebar follow the width they are given, not the viewport: Split is a wrapping flex row (recipes `.ds-split*`, columns `flex: n 1 0` with `min-width: min(100%, share of item-min.md)`), Sidebar is a wrapping flex row (aside `grow basis-ds-sidebar`, content `grow-999 basis-0 min-w-1/2`). This replaces the `md:`/`lg:` classes, so `Split.reverse` (visual order differs from focus order) and `Sidebar.collapseBelow` are removed (breaking, next minor). Grid `cols` stays viewport-responsive by design; `minItemWidth` is the container-fluid option. (2) `Grid`/`Stack`/`Cluster` add `role="list"` to `ul`/`ol` (Tailwind's reset removes list semantics in Safari VoiceOver); a caller's `role` wins. (3) `Button` and `Link` use `.ds-transition` (reduced motion) and Button uses `.ds-border`. (4) `Link external` keeps a caller's `rel` tokens. (5) Rendered layout is tested in real Chromium (`packages/ui/e2e`, Playwright against a Vite fixture of the package source, in `pnpm check`); jsdom class-name tests stay for static maps and types. `@playwright/test` is a devDependency of `packages/ui`. (6) Showcase demos are real files in `apps/site/src/demos/`; `Example` shows the file it renders, so code and preview cannot drift.

### D-065

Client boundary (S22): the package build keeps `"use client"` by making every `src/components/*.tsx` a tsup entry (splitting on) and an esbuild plugin that turns any import of a component file into an external pointing at that component's output (`./components/x.js` from `index`, `./x.js` between components). Each client component keeps its directive on its own output file; `index.js` and server components carry none; shared code (`cn`, layout maps) goes into plain chunks. Rejected: unbundled output (`bundle: false` leaves the `@/` alias unresolved); marking the single bundle `"use client"` (every component, Text included, would become client code); a post-build string patch (fragile). Client components today: `Field` (context) and `Input` (reads it). `scripts/check-rsc.sh` (`pnpm check:rsc`, needs network) packs the tarball, installs it into a fresh Next 16.4.2 app and checks the directives, `next build`, the SSR markup and the RSC payload (Field and Input are client references, Heading and Text are plain elements). Form wiring: `Field` owns ids (`useId`), `aria-describedby` (description then error), `aria-invalid` and `required` and passes them through context; `Input` works alone too, and its own props win. The error has `role="alert"`; `Label` shows an `aria-hidden` `*` when `required`.

### D-066

Checkbox and RadioGroup (S23), adapted from shadcn new-york-v4 with provenance docs. Control boundary is `border.control` (3:1), checked fill `action.primary`, invalid `feedback.danger-border`, disabled from `disabled.*`; no arbitrary values or shadows. Both read `useFieldContext()` (caller props win, describedby merged). `Field` now also exposes `labelId` (its Label gets `id`), so `RadioGroup` is named with `aria-labelledby` (a `<label for>` cannot name a `div`). Radix prop types are `ComponentPropsWithoutRef<typeof X>` plus a `StrictRef` ref, since `ElementProps` only takes intrinsic tags. Tests: Radix only selects a radio on arrow focus while the key is still held, so the test uses `{ArrowDown>}` and `{/ArrowDown}`. Checkbox and RadioGroup are client components (own `"use client"` output files).

### D-067

Select (S24), adapted from shadcn new-york-v4 (provenance `docs/provenance/select.md`). Trigger reuses the Input classes and sizes sm | md; content is `surface.raised` + `elevation.overlay`; item focus is `surface.subtle` (pairs already in `contrast-pairs.json`). `SelectContent` takes `container` for the Radix Portal. Default `position` is `popper` (upstream `item-aligned`); upstream animation classes dropped (no tw-animate). `Select` reads `required` and `SelectTrigger` reads id, invalid and describedby from `Field`, so the Field label names the trigger. Tests polyfill pointer-capture, `scrollIntoView` and `ResizeObserver` for jsdom; the open-list axe check disables the page-level `region` rule.

### D-068

Production hardening before Display (2026-10-20). A whole-repo production-readiness review after S25 found 5 blockers and 36 other findings (register: `docs/audits/2026-10-20-production-readiness.md`, F01–F41). New milestone **MH Production hardening** (H1–H10) fixes all of them before S26. Sessions are numbered H1–H10 so S26–S35, their branches and every "from S<n>" reference stay valid. MH ships as **0.5.0** (it has breaking changes: Sidebar end DOM order, Grid wrapper, new tokens custom themes must define), so Display moves to 0.6.0 and Themes to 0.7.0; the Release 1 goal becomes 0.7.0. Each H-session uses its own branch and PR. Why: Display, Themes and the playground would otherwise be built on the flawed parts (tone contrast, portal theming, client exports), multiplying the fix cost.

### D-069

Releases publish from CI (supersedes the manual `npm publish` step of D-050; set up in H2). `.github/workflows/release.yml` runs on a `v*` tag pushed by the maintainer, in the GitHub environment `npm-publish` (the maintainer is the required reviewer), checks the tag equals the package version, runs `pnpm check` and `check:rsc`, and publishes with `npm publish --provenance` via npm trusted publishing (OIDC, no long-lived token). The AI still never publishes, tags or deploys; the maintainer authorises each release twice (tag, deployment approval). Why: signed provenance, a reproducible build from `main`, and no npm credentials on a laptop.

### D-070

Production-ready bar (2026-10-20). Every release meets the Definition of Done in `docs/PLAN.md` (lint with hooks/a11y/type-aware rules, client-export check, contrast matrix per theme, tests and layout tests in Chromium/Firefox/WebKit, Storybook a11y tests, `check:rsc`, clean-install, site e2e with security headers, `pnpm audit`, CHANGELOG with migration notes) and the audit register has no open findings. Guardrails for all new work: (1) `"use client"` files export components only, values go in `.styles.ts`; (2) tones re-map roles in scope and contrast is a tone × role matrix; (3) portals use `usePortalContainer()`, stacking uses layer tokens; (4) layout follows the container, not the viewport; (5) DOM order = visual order; (6) targets ≥ 24px; (7) user-visible strings are props with English defaults; (8) groups of controls use `Fieldset`. Why: each guardrail closes a class of bug the audit found, so later sessions can't reintroduce it.

### D-071

Lint and type guardrails (H1, 2026-10-21). (1) `packages/ui/src` and `apps/docs/src` get `eslint-plugin-react-hooks` (recommended), `eslint-plugin-jsx-a11y` (strict) and `@eslint-react/eslint-plugin`; `packages/ui/src` is also type-aware (`tseslint.configs.recommendedTypeChecked` + `@eslint-react` `recommended-type-checked`, `projectService`), `apps/docs/src` uses `recommended-typescript`. No rule is turned off. (2) `renderAs(as, props)` in `src/lib/render-as.tsx` replaces the ten `props as object` casts: Button and Link never needed one (the typed lint rule called it unnecessary), the eight `as` components call the helper. It returns an element, not a component, in JSX (no `createElement`: modern syntax only), because `react-hooks/static-components` rejects a component created during render. The only widening is `as as React.ElementType` inside the helper, covered by `render-as.test.tsx` (compile-time `@ts-expect-error` checks plus run-time checks). (3) `verbatimModuleSyntax` and `exactOptionalPropertyTypes` are on in `tsconfig.base.json` (used by `packages/ui` and `apps/docs`) and needed no source change, so Radix prop types are not a blocker. `apps/site` has its own tsconfig and is unchanged. (4) D-043 is enforced by a PreToolUse hook (`.claude/settings.json` → `.claude/hooks/block-file-bash.mjs`, tests in `block-file-bash.test.mjs`, run with `node --test .claude/hooks/`): it denies `cat`, `sed`, `awk`, `python`/`python3`, `tee`, `head`/`tail` on a file, `echo`/`printf` or any command redirecting into a file, and `node -e` code that uses `fs`; it allows pnpm, git, gh, node scripts and `head`/`tail` as a pipe filter. Why: the audit found the rules were not enforced where the code is written (F03, F31, F32) and a reminder alone did not hold D-043 (F41).

### D-072

CI, supply chain and release workflow (H2, 2026-10-21). (1) `ci.yml`, `release.yml` and `clean-install.yml` use `permissions: contents: read` (release adds `id-token: write` on its job only), actions pinned to full SHAs with a version comment (Dependabot `github-actions` bumps them), `concurrency` and `timeout-minutes`. (2) Dependabot npm runs weekly with minor/patch grouped and ignores `@puranderdua/ui`, because `apps/site` pins the published version on purpose. (3) Playwright is pinned to 1.57.0 in `apps/site` and `packages/ui`, with chromium, firefox and webkit projects, `retries: 0` and `failOnFlakyTests` in CI. WebKit on macOS needs Option+Tab to reach links and buttons, so `e2e/keys.ts` (`tabKey`) uses it only for WebKit on darwin; CI (Linux) uses Tab. (4) `release.yml` publishes only on a `v*` tag in environment `npm-publish` via trusted publishing (`npm publish --provenance --access public`, npm upgraded to ≥ 11.5.1 in the job, no token). The tag guard is `scripts/check-release-tag.sh`, a script so it can be tested locally and is shellchecked. (5) `check-rsc` runs in CI on pushes to `main` and on PRs touching `packages/ui/**` or `scripts/check-rsc.sh` (decided by a `git diff` step, so the required check still reports on other PRs). (6) Local gotcha: Playwright 1.57 browser install hangs under Node 26 (extraction); use Node 22 like CI.

### D-073

Client boundary and form fixes (H3, 2026-11-11). (0) CI runners are pinned to `ubuntu-24.04` in all workflows: `ubuntu-latest` moved to 26.04, which Playwright 1.57 cannot install browsers on, so the `check` job failed on PR #31 before running any test. Move the pin deliberately when Playwright supports the next image. (1) `inputVariants`, `checkboxClasses`, `radioGroupItemClasses` and `selectTriggerVariants` live in plain `input.styles.ts`, `checkbox.styles.ts`, `radio-group.styles.ts` and `select.styles.ts`; the components and `index.ts` import from them and the public API is unchanged. Build: `src/components/*.styles.ts` are tsup entries (so the D-065 plugin's external `./x.styles.js` target exists and every importer shares one file); they carry no directive. (2) `scripts/check-client-exports.mjs` (in `pnpm check` after build, and run by `check-rsc.sh` on the packed `dist`) fails if a built `"use client"` file exports anything that is not PascalCase (component) or `use…` (hook, so `useFieldContext` may stay next to `Field`). Planted `export const plantedVariants` in `input.tsx` fails it. (3) `check-rsc.sh` asserts the directive on field, input, checkbox, radio-group and select and its absence on the server and `.styles` files, and its Server Component page calls every server-safe export and throws if the package gains a value export that is not listed. (4) Invalid vs disabled: `aria-invalid:enabled:` in every control, so a disabled control can never get the danger border whatever the CSS order. Radio: `RadioGroup` is a `group` and the item has `group-aria-invalid:enabled:`. Checkbox renders both icons and `group-data-[state=indeterminate]/checkbox` picks one, so uncontrolled `defaultChecked="indeterminate"` is right. `Field` ignores `description=""`. `useFieldContext` and `FieldContextValue` are public. `exports["."]` gains `default` after `import`. Why: F01 was a build break for every Server Component that used a variants function.

### D-074

Surface tones re-map roles; contrast is a tone × role matrix (H4, 2026-11-11). (1) New semantic file `tokens/semantic/tone.json`: `on-inverse.*` and `on-brand.*` (muted text, link, link-hover, focus ring, control border, action primary and secondary bg/hover/active/fg/border). Aliases to primitives only, so every theme must provide them through the existing colour primitives; no new primitives. Base values: inverse uses white focus ring and primary fill with `neutral.900` label, brand uses white ring/primary fill with `brand.700` label. (2) Recipes `.ds-tone-canvas|subtle|inverse|brand` in `theme.css` set background and `color: var(--ds-text-primary)`; inverse and brand also re-point the role vars (`--ds-text-primary`, `--ds-text-muted`, `--ds-text-link*`, `--ds-focus-ring`, `--ds-border-control`, `--ds-action-*`), so Text, Link, Button, Checkbox and `.ds-focus-ring` follow the tone with no component change. `Section` uses the recipes (`sectionToneClasses` are now the four recipe names); `cn()` treats `ds-tone-*` as one group. (3) `tokens/contrast-pairs.json` keeps fixed `pairs` and gains `contexts` (surface + role → replacement map), `roles` (fg, optional bg, min; bg defaults to the tone surface and both go through the map) and `exclusions` (context, role, reason). `contrast.mjs` expands contexts × roles per theme (126 checks on Base); `validate-tokens` checks the shape (every name is a semantic colour, every map key is used by a role, every exclusion has a reason and names a role without a bg). `scripts/check-tone-recipes.mjs` (in `tokens:check`) fails when a `.ds-tone-*` rule re-points anything other than its context's map. (4) Deliberate exclusions: `input.bg` on canvas and subtle (the fill equals the surface; the boundary is `input.border`, in pairs), and danger feedback on inverse and brand (not re-mapped; put Field errors on canvas, subtle or raised). (5) Known limit: tones do not nest. A canvas or subtle tone inside inverse or brand does not restore the base roles (they only paint the surface), because the base values are overridden on the ancestor. S26 Card must handle this (its raised surface needs a reset), see PROGRESS parking lot. Why: F02, a surface changed but the roles inside it did not, so the focus ring was invisible on brand (1:1) and links were unreadable on inverse.

### D-075

Layer scale and ThemeScope as the portal default (H5, 2026-11-11). (1) Layers: shared, non-themeable `tokens/primitives/layers.json` (`layer.base` 0, `sticky` 100, `dropdown` 200, `overlay` 300, `modal` 400, `toast` 500, `tooltip` 600, `skip-link` 700; type `number`, in the resolver's shared set). `build-tokens` writes them once to `generated/layers.css` (`--ds-layer-*`), not into theme files; `build-foundations` prepends that file to `dist/foundations.css`, so consumers need no extra import. `theme.css` has `.ds-layer-<name>` recipes; `cn()` treats them as one group that also replaces a raw `z-*`. Components use the recipes only (Select: `ds-layer-dropdown`, was `z-50`); the site skip link moves in H9. (2) `ThemeScope` (client, `theme`, `vars`, div props): applies the theme's resolved var map (`themes/<name>.json` `vars`) as inline vars (caller `style` wins), sets `data-ds-theme`, forwards `ref`, and provides its element through context. `usePortalContainer()` returns that element or `null`. `SelectContent` portals into `container ?? usePortalContainer() ?? document.body`, so an explicit prop wins and no scope still works. Dialog, Tooltip and Toast must do the same. Why: F15 and F16, theming was per call site and stacking was hard-coded, which every new overlay would have repeated.

### D-076

Container-first grid, ordered sidebar, target size, Fieldset (H6, 2026-11-11). (1) Supersedes the D-064 consequence that `Sidebar side="end"` reverses the row: it now renders the content first and the aside after it, with no `flex-row-reverse` or `order-*`, so DOM, tab and reading order match what is seen. Stacked, the aside is above the content for `start` and below it for `end`. `sidebarProps` (div props) goes on the aside so each landmark can be named. (2) `Grid cols` follows its container: the column maps use Tailwind v4 container-query variants (`@md:`, `@2xl:` …) and a `cols` Grid renders one extra `div.@container` around the grid (a container query cannot style its own container); `as`, `ref`, `role`, `className` and all other props stay on the inner grid, and `minItemWidth` (auto-fit) needs no wrapper. DOM change, to be listed in the 0.5.0 CHANGELOG (H8). (3) Target size: primitive `size.target.min` (1.5rem, per theme, so density is themeable but must stay at least 24px) → semantic `control.target-min`; `.ds-hit-area` is an invisible `::after` at least that size, centred on the control; Checkbox and RadioGroupItem use it and keep their 16px look. (4) `Field layout="inline"` puts the control, then the label, in one row (DOM order = visual order); description and error stay below. (5) New `Fieldset` (`<fieldset>`, `<legend>`, description, error, `required`, context `legendId`/`invalid`/`required`; description and error are linked from the fieldset itself). `RadioGroup` inside one is named by the legend and takes invalid and required from it; inside only a `Field` it still works but warns in development (its `<label for>` points at a non-labelable `div`). (6) `Link externalLabel` (default "(opens in a new tab)"); the obsolete `focusable="false"` is removed. Why: F10, F11, F12, F17, F26, F30, F37, F38.

### D-077

Storybook a11y is a test, and CSS coverage is read from the build (H7, 2026-11-11). (1) `apps/docs` runs every story as a Vitest browser test (`@storybook/addon-vitest`, `vitest.config.ts`, Playwright Chromium, same Playwright pin as the other packages) through `pnpm --filter docs test:stories`; it is in `pnpm check`, before `build-storybook`, so CI enforces `a11y.test: "error"`. The preview annotations are applied by the addon itself, so there is no `setProjectAnnotations` setup file. A story that opens a Radix Select must close it before its test ends: Radix marks the rest of the page `aria-hidden` while the list is open, so axe reports `aria-hidden-focus` on the trigger (same cause as the site's open-Select test). (2) `playground:check` builds its class list from the string literals in `dist/components/*.js` (every token with a `ds-` utility or recipe, not attribute names), and the playground CSS has `@source "../../dist/components"`, so a class the bridge or recipes cannot generate fails the check without the playground using it. The old hand-written list is gone. (3) `ThemeScope` `vars` is `Record<string, string | number>`, because `themes/<name>.json` contains numbers (font weights) and the documented use (pass the JSON map) did not typecheck. Why: F21, F39.

### D-078

0.5.0 release prep (H8, 2026-11-11). (1) The 0.5.0 CHANGELOG lists as breaking: Sidebar `side="end"` DOM order, the Grid `cols` wrapper element, the removed Link `focusable`, the tone roles and `control.target-min` that custom themes must define, and Section tones through `.ds-tone-*`; each has a Migration step. The `*.styles.ts` move is non-breaking for the barrel. (2) `scripts/clean-install.sh` accepts `TARBALL=<path>` so the Definition of Done can run it against the packed 0.5.0 before it is on npm; without it the script still installs the published version. (3) The package README documents `@source` per layout and a check against the built CSS. Why: F35, F40.

### D-079

Site production readiness (H9, 2026-11-12). (1) CSP uses `script-src 'self' 'unsafe-inline'`, not nonces: a nonce is per request and forces dynamic rendering of an otherwise static site; `'unsafe-eval'` only in dev. (2) `upgrade-insecure-requests` is in the CSP, but WebKit upgrades `http://localhost` to https, so a local `next start` loads no assets. Next fixes the header list at build time, so the Playwright web server runs its own `pnpm build` with `SITE_ALLOW_HTTP=1`, which leaves out that one directive; production builds never set it, and the header test asserts the directive when `baseURL` is https. (3) Demos live in one typed `demos` map; `Example` takes a key and reads the file located from `import.meta.url` (`import.meta.dirname` is undefined under Turbopack; `process.cwd()` depends on where the build runs). (4) A failed signup submit focuses the first `[aria-invalid="true"]` control after `flushSync`; a radio group is not focusable, so its first radio gets focus. Why: F07, F08, F09, F16, F23, F24, F25, F29, F33, F34.

### D-080

Card and Tabs, and the raised tone (S26, 2026-11-12). (1) Tones do not nest (D-074), so a Card that paints `surface.raised` inside an inverse or brand Section would keep that Section's light text. Fix: a fourth tone recipe `.ds-tone-raised` that paints `surface.raised` and re-points the same role vars back to the base look through new semantic tokens `on-raised.*` (`tokens/semantic/tone.json`, 16 tokens aliasing the same primitives as the base roles, so every theme provides them with no new primitive). `contrast-pairs.json` gains the context `raised` (surface `surface.raised`, map to `on-raised.*`), so the whole role matrix runs on it (149 checks on Base), plus `input.border` and `input.border-hover` on `surface.raised` as fixed pairs; `input.bg` on raised is excluded (white on white, the boundary is `input.border`). `Section` keeps its four tones; `raised` is the Card surface, and a test asserts contexts are the Section tones plus `raised`. (2) `Card` is server-safe (no `"use client"`): `variant` `outline` (no fill, border, follows the tone around it) or `raised` (`ds-tone-raised`, `shadow-ds-raised`, `rounded-ds-card`); `as` div, article, section, li or aside; parts `CardMedia` (full bleed, clips to the card radius), `CardHeader`, `CardTitle` (`Heading`, `as` h1 to h6, default h3 / variant h3), `CardDescription` (`Text` caption), `CardContent`, `CardFooter`. Class strings live in `card.styles.ts` and `cardVariants` is exported. Spacing comes from the layout gap tokens, so there is no card-specific padding token. (3) `Tabs` is adapted from shadcn new-york-v4 (`docs/provenance/tabs.md`) with one look only, underline: label (`text-muted`/`text`), marker (`border-control`) and ring are all roles a tone re-maps, so Tabs read on every surface with no prop; upstream's filled `default` list is dropped because it needs a surface tones cannot nest into. Triggers are at least `control.sm` (32px). `activationMode`, `orientation`, `value` and `onValueChange` pass through to Radix; class strings are exported from `tabs.styles.ts`. (4) Radix moves focus after an arrow key on a timer, so browser tests wait with `toBeFocused()` instead of reading `document.activeElement`. (5) `check-rsc.sh` knows the new files: `tabs` is a client file, `card`, `card.styles` and `tabs.styles` are not, a Server Component renders a Card and Tabs, and the new value exports are in its server-safe list. Why: PROGRESS parking lot ("tones do not nest"), the D-070 guardrails (`.styles.ts`, raised surface in the matrix, targets of 24px or more).

### D-081

Banner, the gradient tone and the scrim check (S27, 2026-11-12). (1) `Banner` is a server-safe hero band: `height` screen (`.ds-banner-screen`, `min-height: 100svh`) or tall (`.ds-banner-tall`, 75svh), `align` start or center, `tone` canvas, brand, inverse or gradient, `as` section, div or header, content in a `Container` (`container` prop, default lg). Heights are `min-height` so large text grows the band instead of clipping it, and `svh` so a mobile toolbar does not make it jump; they are two recipes in `theme.css`, not tokens, because DTCG dimensions cannot hold viewport units. (2) New tone `.ds-tone-gradient`: a 135deg gradient from `surface.gradient-start` (brand.600) to `surface.gradient-end` (brand.800), both new semantic tokens aliasing existing primitives (no new primitive; every theme provides them). It re-points the same roles as `brand` through the existing `on-brand.*` tokens, because the gradient is a dark tone. `contrast-pairs.json` gains the context `gradient` with an optional `surfaceEnd`: `contrast.mjs` checks every role that sits on the surface against both stops, and `check-tone-recipes.mjs` expects `background-color` = start and the `linear-gradient` between the two tokens. A theme whose end stop is lighter than its start stop fails, which is why the token description says to keep it at least as dark. `danger` is excluded on gradient for the same reason as on brand (D-074). (3) `media` takes any node (`img`, `picture`, `next/image` with `fill`) in an absolute layer where the direct child is `size-full object-cover`, under a scrim layer (`bg-ds-scrim` at `opacity-100` for `strong` or `opacity-85` for `medium`). `overlay.scrim` has alpha, so it cannot be a pair; `contrast-pairs.json` gains `scrim` (fg `text.inverse`, strengths `strong` 1 and `medium` 0.85) and `contrast.mjs` composites the scrim over pure white, the lightest pixel an image can have, and needs 4.5:1 per theme (Base: 7.23:1 and 4.96:1). Over media the text is light, so the types do not offer `canvas` with `media` or `video` (default tone over media is `inverse`), and `scrim` is only allowed with media. The classes are plain strings in `banner.styles.ts`; a test and a layout test measure the same ratios in a browser. (4) `video` (`{ src, poster, type?, pauseLabel?, playLabel? }`) is the only client part, `banner-video.tsx`: muted, looped, `playsInline`, `aria-hidden` and not focusable (decorative). It reads `prefers-reduced-motion` with `useSyncExternalStore`; the server snapshot is "reduced", so server HTML and the first client render show only the poster and no video starts before hydration or without JavaScript. Under reduced motion the poster stays and there is no button; otherwise a visible secondary `Button` (sm, at least 32px) pauses and resumes (WCAG 2.2.2), its name is the label prop (English defaults "Pause video" and "Play video"), and a blocked autoplay shows "Play video". The scrim, content and button are children of `BannerVideo`, so the button comes last in DOM order and paints above the content without a z-index. (5) `check-rsc.sh` knows the new files (`banner-video` client; `banner` and `banner.styles` not) and renders a Banner with a video from a Server Component: the HTML has the poster and no `<video>`. Why: PLAN S27, D-070 (client files export components only, every user-visible string is a prop, contrast per theme), WCAG 1.4.3, 2.2.2.

### D-082

Theme direction (S29, 2026-11-13). (1) Corporate, Nature and Quirky are registered in `tokens/resolver.json` with Base's exact key set; values are proposals pending the maintainer's Storybook review (S30, S31 finalise). Palettes are OKLCH-built (fixed lightness per step, per-theme hue and chroma, chroma reduced to fit sRGB) and converted to hex; the full contrast matrix (180 checks per theme) passed for all four with no hand adjustment. (2) Font families are written unquoted in the DTCG files (`IBM Plex Sans, system-ui, sans-serif`): Style Dictionary quotes names that contain spaces itself, and a pre-quoted name came out as `'"Nunito Sans"'`, which is invalid CSS. (3) Quirky's coral accent has no semantic role (the contract has brand, neutral, danger only), so coral sits in Quirky's `red` scale; a real accent role is left to the maintainer. (4) Storybook: a `theme` toolbar (`globalTypes`) and a decorator in `.storybook/preview.tsx` wrap each story in `ThemeScope` with `themes/<name>.json` (so portals stay themed); theme fonts load from Google Fonts in `.storybook/preview-head.html`. `Foundations/Theme specimen` has a toolbar-driven story plus one pinned-theme story per theme, so the story test run (axe) covers all four. Why: PLAN S29, D-046 to D-048, D-053. (Item 3 is superseded by D-084.)

### D-083

Playground engine (S33, 2026-11-14). (1) Pure TypeScript in `apps/site/src/playground/` (`resolveState`, `toDtcg`, `toCss`, `evaluateContrast`). It starts from the four shipped `themes/<name>.json` maps and re-resolves every semantic var through their `refs`. Order: knobs rewrite the primitives, overrides apply on top (a primitive takes a literal; a semantic takes a literal or a `--ds-` alias), then everything resolves. An unset knob, or one at its neutral value, is a no-op, so an untouched state equals the starting theme exactly. (2) The theme JSON holds `elevation.*` as literals (D-059), so the engine carries the `elevation.* -> shadow.*` aliases itself and a shadow change flows to them. (3) `toDtcg` returns the four files of a theme folder (primitives only). Semantics are shared by every theme (D-048), so overridden semantic vars cannot live there; they come back as `unrepresentable`, and `toCss` writes them as literals. (4) `accent` has no semantic role (D-082), so it only adds `--ds-color-accent-50..900` primitives that no component reads; whether `validate-tokens` accepts that extra scale in a theme folder is not checked. (5) Ramps are OKLCH with the chosen colour as step 600 (lightness moved into 0.2 to 0.9 if outside) and strictly darker with each step; the neutral knob keeps each step's lightness from the starting theme. (6) `evaluateContrast` ports `scripts/contrast.mjs`; a test runs the script on Base and compares every line. (7) New site dependencies `culori` and dev `vitest`, `@types/culori`; `pnpm --filter site test` is part of `pnpm check`. Why: PLAN S33, D-052.

### D-084

Accent role (A1, 2026-11-14; supersedes D-082 item 3 and the "no accent role" gap noted in D-083). (1) New themeable primitive scale `color.accent` (50–900, same lightness steps as brand) in every theme: Base steel-blue (hue 250, restrained beside the grey brand), Corporate teal (195), Nature terracotta and ochre (55), Quirky coral (38). Quirky's coral moved out of `red` (which is now a crimson, hue 25). (2) Two semantic roles only: `text.accent` (accent.700, text) and `accent.border` (accent.600, 3:1 marker). No `accent.bg` or `accent.fg` yet: nothing in Release 1 fills a surface with the accent, and the accent must never compete with the primary action; add them with the first component that needs a fill. (3) Tones: `on-raised`, `on-inverse` and `on-brand` in `tone.json` each gain `text-accent` and `accent-border`; every `.ds-tone-*` recipe re-points both vars (brand and gradient share `on-brand`); `contrast-pairs.json` gains pairs on canvas, subtle and raised plus the two roles in every context (200 checks per theme, was 180). (4) Components: `Tabs` active label is `text.accent` and the active bar `accent.border` (was `border.control`); `Card` gains `variant="accent"` (raised tone, strong-width `accent.border` outline). Everything else keeps its default look. Link, Checkbox, RadioGroup and Banner stay on brand: their emphasis is an action or a state, not a second voice. (5) Bridge: `text-ds-accent`, `bg-ds-accent-border`, `border-ds-accent-border`. (6) Custom themes must define `color.accent.*` and the six `on-*` accent tokens; ships in 0.8.0 (not published). The site playground's accent knob (generates `--ds-color-accent-50..900`) takes effect once `apps/site` is on 0.8.0. Why: the playground accent knob had nothing to drive; D-046 to D-048, D-074, D-080.

### D-085

Playground UI (S34, 2026-11-14). (1) The site is pinned to 0.8.0, so the engine's accent knob rewrites the shipped `color.accent` scale in place (the S33 insertion after neutral-950 and its test exclusions are gone) and the engine tests compare values with the repo DTCG again. (2) `/playground` is one client page: the state (`start` theme, knobs, overrides) lives in a small external store (`src/playground/store.ts`) read with `useSyncExternalStore`, so the server and first client render use the default state (no hydration mismatch) and localStorage (`ds-playground`) takes over after hydration. Stored state is validated by `parseState`; a value the engine would reject is dropped, and `safeResolve` falls back to the starting theme with a message instead of throwing. (3) The preview is a `ThemeScope` with the resolved map, so Select popovers portal into it without a `container` prop; the page chrome keeps the site theme. `next/font` families are applied the same way as the header switcher (leading family swapped for the font's CSS variable, on every `font-family` var). (4) Choosing a starting theme clears knobs and overrides; Reset returns to the current starting theme. An advanced-panel edit sets a literal that wins over the knobs; its Reset puts the alias back. (5) Controls are package components only (Field, Input, Select, Button); colours and numbers are native `Input` types. Number fields keep a local draft so "0.5" can be typed. (6) The header gains a Playground link, and the sitemap lists `/playground`. Export is S35. Why: PLAN S34, D-052, D-083, D-084.

### D-086

Playground export and Release 1 close (S35, 2026-11-14). (1) Export is the four DTCG files of a theme folder plus `<name>.css`, each with Copy and Download and a Download all; no zip dependency (a zip would add a package for five small files). Pure code in `src/playground/export.ts` (`exportTheme`, `themeSlug`), UI in `export-panel.tsx`. (2) The panel states what an export cannot carry: advanced overrides of semantic tokens (semantics are shared by every theme, D-048) are listed, and a theme that fails contrast is flagged because `tokens:check` will reject it. Export is still allowed in both cases. (3) The accent knob exports cleanly: `validate-tokens` accepts the `color.accent` scale since 0.8.0 (S33 gotcha closed). (4) The round-trip test (`export.test.ts`) runs the repo's own `validate-tokens`, `build-tokens` and `contrast` scripts on a scratch `tokens/` copy with a `custom` theme and a scratch resolver, and compares the built vars and CSS declarations with what the playground resolved. (5) Release 1's package is 0.8.0 (the plan said 0.7.0 before A1 added the accent role); the playground is site-only, so there is no 0.9.0. The GitHub Release for Release 1 goes on the `v0.8.0` tag. Why: PLAN S35, D-052.

### D-087

Release 1 review before more work (2026-11-14). (1) Milestone MR (R1–R6) reviews the whole repo after Release 1: architecture, component API, React, site state, Next.js, performance, packaging, tokens and styling, dark-mode readiness, accessibility beyond axe, testing, security, DX, tooling and process. (2) The bar is semver 1.0.0 for outside consumers on React 19 + Tailwind v4, not only `apps/site`. (3) Review only: findings go into `docs/audits/2026-11-14-release-1-review.md` (`R01…`, kind defect / recommendation / revisit, evidence required); R6 proposes a hardening milestone the maintainer approves. Each R-session opens its own PR on `review-r<n>`, merged by the maintainer before the next session. Changed after R2 (the maintainer, 2026-11-14): R2–R6 and the hardening plan go into one PR (#59, branch `review-r2`); R1 was #58. (4) Recorded decisions are challenged only with concrete evidence (kind `revisit`). (5) Probe tools run through `pnpm dlx` in the scratchpad and are not added as dependencies; Lighthouse and e2e may run against production. (6) Screen-reader checks are a script the maintainer runs.

**Why:** H10's whole-repo pass was a self-review that found nothing new, and Release 1 added Card, Tabs, Banner, four themes, the accent role, the switcher and the playground after it. A 1.0.0 commitment needs an independent, evidence-based review first.

### D-088

MH2 **1.0.0 hardening** (H11–H20, 2026-11-14), approved by the maintainer. It fixes the Release 1 review findings that matter for a semver 1.0.0 (register `docs/audits/2026-11-14-release-1-review.md`). H11–H19 ship as 0.9.0 (breaking changes, with a migration guide); H20 cuts 1.0.0. Release 2 (dark mode) waits for MH2.

**Why:** breaking changes are cheap before 1.0.0 and cost a major release afterwards.

### D-089

Prop renames for 1.0.0 (R10): `container` → `contentWidth`, Sidebar `side` → `sidebarSide`, Banner `align` → `justify`. The old names keep working for one release (0.9.0 → 1.0.0) behind a development warning, then go.

**Why:** the old names clash with the portal `container` prop, the HTML `side` meaning and CSS `align` semantics; renaming after 1.0.0 would be a major release.

### D-090

Token sources and the playground export migrate to the DTCG 2025.10 object form (R21). If the migration is large, H17 splits it into its own session.

**Why:** the resolver already uses the 2025.10 shape; one format avoids labelling ours a draft that outside tools may not read.

### D-091

Overlays (Select, and later Dialog, Tooltip, Toast) portal to `document.body` (or a top layer) and re-apply the nearest scope's theme vars, `data-ds-theme` and tone through a `ScopedPortal`, as Radix Themes does (R22, R08). This replaces the "portal into the nearest `ThemeScope`" default of D-075; the `container` prop still wins and the layer tokens stay.

**Why:** a portal inside a scope can be clipped or mis-positioned by an ancestor with `overflow` or `transform`.

### D-092

Theme CSS gets a mode selector in 1.0.0 (R26), so dark mode is added in a minor release without changing the shape of `themes/<name>.css`. Light only until Release 2.

**Why:** adding the selector later would change what consumers import and override.

### D-093

Radix comes from individual `@radix-ui/react-*` packages, not the `radix-ui` umbrella (R42). This amends D-049 ("Radix comes only from `radix-ui`"). Done in H16.

**Why:** the umbrella installs about 60 `@radix-ui` packages per consumer; individual packages install only what the components use.

### D-094

Production deploys of the site stay manual (R45, D-057). H12 does not add deploy-from-`main`; it adds the e2e smoke against production as a documented step after the maintainer's manual deploy.

**Why:** the maintainer keeps control of what goes live.

### D-095

A new themeable token must have a default alias to an existing primitive, so a custom theme may define it but does not have to; `validate-tokens` warns instead of failing for a token that has a default (R17). This amends D-048's "every themeable token exists in every theme" for tokens with a default.

**Why:** without it every new colour role is a breaking change for custom themes under semver 1.x.

### D-096

The 1.0.0 contract is `docs/versioning.md` (R17): what is public, what counts as breaking, how deprecation works (development warning, one minor of overlap, removal in the next major), and that the package is ESM-only.

**Why:** there was no written contract.

### D-097

Inside a `Field`, the Field's id wins (R06). A control's own `id` is ignored there and logs a development warning that names `<Field id>`. `Field id` is the id of the control inside; `Fieldset id` is the `<fieldset>`'s own id. Controls resolve their wiring through one hook, `useFieldControlProps`, internal for now (not exported from the package index); making it public for outside controls is a 1.0.0 question. `babel-plugin-react-compiler` and `@babel/core` (pinned to 7: the compiler 1.0 does not read Babel 8's AST) are root devDependencies that run `pnpm check:compiler` (R15).

**Why:** the label, description and error all point at one id, so two ids can never disagree; the alternative (Field reading its child's id) needs child inspection that breaks for wrapped controls.

### D-098

How D-091 is implemented (R08, R22, R18, R35, R19). `ScopedPortal` portals to `document.body` (or `container`) and re-applies the nearest `ThemeScope`'s `data-ds-theme`, vars and `dir`, plus `ds-tone-raised`. The tone is always **raised**, not the enclosing Section's: an overlay is a raised surface, so a list opened from an inverse band stays a light list with the base roles. `usePortalContainer()` now returns `document.body` in the browser and `null` only while rendering on the server or hydrating ("render no portal yet"); it no longer returns the scope element, and `ThemeScope` holds no state, so it renders once. `DirectionProvider` wraps Radix's `Direction.Provider` and also records the direction for `ScopedPortal`; `ThemeScope` takes `dir` and does both. Menu highlight is a solid `menu.highlight-bg`/`-fg` pair (default alias to `accent.700` and white), checked against `surface.raised`, `canvas` and `subtle` and for text; the list is always raised, so no dark-tone mapping is added. Forced colours: the Tabs bar is also a border, the highlighted option gets an outline, a disabled option is `GrayText`.

**Why:** a scope-held element made `usePortalContainer` null on first render (R08) and let ancestors clip the list (R22); a Section tone on an overlay would turn the list dark and need a dark-tone highlight pair; a bare Radix provider cannot tell ScopedPortal whether a `dir` was chosen. Breaking for the 0.x consumers of `usePortalContainer`; it goes in the 0.9.0 CHANGELOG (H19).

### D-099

How `Grid` meets R07 and where the public style exports stop (R07, R09). **Grid:** `cols` and `minItemWidth` are a discriminated union. With `minItemWidth` the Grid is one element and takes every prop. With `cols` the outermost element is a `div` wrapper (`@container w-full min-w-0`, because a container query cannot style its own container and a flex parent sizes a `container-type: inline-size` box to zero) that takes `className`, `style` and every `data-*`; `as`, `ref`, `role`, `id`, `aria-*` and the children stay on the grid element inside it. The register suggested putting `ref` on the wrapper too; it stays on the grid element so `as="ul"` keeps a `HTMLUListElement` ref and a list keeps its `role` and name (D-034). **Style exports:** public style exports are `*Variants` cva functions for the five components that stand for a role on another element (Text, Heading, Button, Link, Input); every other class string and cva function is private. A `data-slot` change on an existing part (`CardTitle`, `CardDescription`) is listed in the CHANGELOG as a change, because `docs/versioning.md` makes `data-slot` values public.

**Why:** a wrapper that takes `className` is the only way a `col-span-2` or `self-start` reaches the flex or grid item without a second wrapper in every consumer; moving `ref` there would give a list a div ref. Adding a style export later is not breaking, removing one is.

### D-100

How H17 meets R13, R20, R23, R24 and R28, and what it leaves (D-090, D-092, D-095). **Tokens:** the new semantic tokens alias existing primitives where one fits (`space.*`, `border-width.2`, `font.weight.medium`, `font.line-height.normal`). Three values had no primitive (icon 0.875rem and 1rem, menu min width 8rem), so `size.icon.sm|md` and `size.menu.min` are new primitives in all four themes; a custom theme must define them, which the CHANGELOG states (D-095 has no default mechanism for primitives, and a theme-level default would be a second source of truth). **Print:** `foundations.css` resets the dark tones to the base roles with `unset` and drops their fill, and keeps the fills that carry state with `print-color-adjust: exact`; `check-tone-recipes` ignores the print block. **Mode:** theme CSS is `:root, [data-ds-mode="light"]` with `color-scheme: light`, so dark mode adds a `[data-ds-mode="dark"]` block. **Split:** R21 (DTCG 2025.10) is its own session, H17b, because it rewrites every token source and the playground export; H17 builds on the draft form. **Skew:** the site still installs 0.8.0, so five playground tests that compare against the repo tokens are skipped until the site moves to 0.9.0.

**Why:** a primitive-only addition keeps the tier rule (semantics alias primitives); a mode selector now means dark mode later is additive, not a change to what consumers import; splitting R21 keeps this session reviewable and avoids a conflict on every file in `tokens/`.

### D-101

How H17b carries out D-090 (R21). Token sources and the playground export use the 2025.10 object forms: dimension `{ value, unit: px|rem }`, duration `{ value, unit: ms|s }`, colour `{ colorSpace: "srgb", components, alpha?, hex? }`, shadow layers made of those. The build converts them back to CSS strings in a Style Dictionary preprocessor (`scripts/build-tokens.mjs`, helpers in `scripts/lib/dtcg.mjs`), so Style Dictionary stays on v4 and the generated CSS/JSON are byte-identical. `validate-tokens` rejects the old string forms and checks that a colour's `hex` agrees with its components; only `srgb` is accepted (the contrast check and the playground assume it). **Letter-spacing** is a unitless `number` (a multiple of the font size) and the build writes `em`: 2025.10 has no `em` unit, and `rem` would change every heading (-0.02em of a 48px heading is not -0.02rem). The typography composite's `letterSpacing` therefore aliases a `number`, a deviation from the strict composite type that we accept to keep the output unchanged. The playground engine works on the resolved var map and is untouched; only `output.ts` (the export) changes.

**Why:** one file format that 2025.10 tools can read, with no visual change; a Style Dictionary v5 upgrade can come later and would drop the preprocessor.

### D-102

How H19 tests the environments the standard suites never visit (R37, R38). **Environments:** `packages/ui/e2e/environments.spec.ts` renders every interactive component under a right-to-left page, forced colours, print media and as a direct child of a flex row, a Cluster and a centred Stack. RTL means the documented setup, `<html dir="rtl">` plus `DirectionProvider` (the Radix parts assume `ltr` without it, D-098); forced colours is skipped in WebKit because Playwright does not apply it there. **Hydration:** a unit test renders each client component with `renderToString`, hydrates it in StrictMode and fails on any error, warning or rebuilt node; it also fails when a `"use client"` file has no case, so a new client component cannot skip it. **No screenshot suite:** the register's visual-regression item was built (one Chromium screenshot per story, Linux-only baselines from CI) and then removed at the maintainer's decision. It would not have caught any defect of this review (the stories render in LTR, default media and mostly one theme), overlaps the story a11y gate and the layout suite, and costs binaries in git, a baseline workflow and a regenerate-and-review step on every intentional look change. Revisit with a small curated set (theme specimens plus one story per component) if visual drift becomes a problem. **Coverage:** `@vitest/coverage-v8` reports coverage in the CI run summary and never fails a run. **Axe and class assertions:** jsdom axe runs only for states no story renders (the open Select list, the Banner video under reduced motion). A class assertion stays when the class is the contract (`ds-*` recipes, `data-slot`, a caller's `className`); a state style (disabled, invalid, checked, size, underline, elevation) is checked as the browser computes it.

**Why:** the review's defects (R06, R07, R18, R19, R22, R24, R31) lived in settings no test visited; a class that is present but wrong passed every test (R19).

### D-103

How H20 closes MH2 and ships 1.0.0 (R43, R02, and the rows that stay open). **Release shape:** 0.9.0 was prepared and published first (the package was still 0.8.0 when H20 began), then H20 removes the D-089 names (`container` on `Section` and `Banner`, `align` on `Banner`, `side` on `Sidebar`) and bumps to 1.0.0; nothing else changes in the package API. The 0.9.0 CHANGELOG had omitted H14 and H15 (portals to `body` through `ScopedPortal`, `DirectionProvider`, `menu.highlight-*`, Field `id`), so those were added to its notes after publication and to the migration guide. **R43:** Storybook autodocs through `@storybook/addon-docs@10.6.6` (approved dev dependency), a usage and accessibility note in every story's `docs.description`, `CONTRIBUTING.md`, the package README's "Rules to know", and development warnings for `Split` without two children and `Grid` with both `cols` and `minItemWidth` (`warnOnce`). **R02:** `tailwind-merge` stays; the cost (about 10 KB gzip in a client bundle) is documented in the package README. **Accepted for 1.0.0, with the reason:** (1) **R01 and R30**, the `/` budget: `/` ships 195.4 KB gzip against a 174.3 KB blank page (21.1 KB over; the target was 10 KB). 11 KB of the gap is `tailwind-merge` (R02, kept) and 6.7 KB is the site's own code; closing the rest needs a bundle architecture change for a portfolio page, not a package defect, and the Display video (the largest asset) no longer loads until it is in view. Revisit with a per-route budget in CI if the site grows. (2) **R12**, what is left: each cva default repeats in its `data-variant`/`data-size` fallback; the duplicated logic that could drift (Field wiring, size and align maps) is shared. (3) **R38**, what is left: Tailwind utility assertions for layout and spacing in three unit test files and the hover and active class checks; the computed-style and environment suites cover the behaviour, and a class refactor costs a test edit, not a missed defect. **Handed to Release 2:** R26, R27 and R29 (dark-mode blockers in applying themes, the build and the playground), and what is left of R28 (the literal shadows and the scrim; `color-scheme` is fixed, D-092).

**Why:** 1.0.0 should carry no known defect and no unwritten promise: every register row is fixed, accepted here with a reason, or owned by the next release.

## Release 2: the Builder (S36, 2026-11-16)

D-104 to D-141 are the maintainer's answers in the Release 2 interview and the review that followed; the design they add up to is `docs/builder-spec.md`.

### D-104

Audience: the Builder is for everyone (a solo maker, a designer who does not code, a brand or marketing person, a developer). When a Guided wording or layout choice cannot suit all of them, the least technical person wins; designers and developers get their speed from Studio and "Use it".

**Why:** the maintainer wants one simple process for all; a design for everyone needs a tie-break or it serves no one.

### D-105

Output: tokens work in any stack (CSS variables, a DTCG file, later Tailwind, shadcn and JSON); ready-made components stay React (`@puranderdua/ui`), and the site says so plainly.

**Why:** "any frontend web app" is honest for decisions, not for components; other frameworks would be months of work.

### D-106

Evidence: only the maintainer has used the site so far. Every audience need in the spec is an assumption until a test round says otherwise, and no research result is written before it exists.

**Why:** the site has no analytics and no observed users; invented user data would steer the build wrongly.

### D-107

The site becomes product-first: the home page presents the tool with one action ("Start building"); today's portfolio text moves to `/about`.

**Why:** a go-to tool needs a front door about the tool, not its author.

### D-108

One project, two views: **Guided** (default) and **Studio** (every control and token name). Guided is an expanding step list in one panel, all steps visible with their current choice and one open at a time, not a page per step. Each step still has its own URL.

**Why:** novices need one decision at a time; NN/g notes that wizards hide context and limit creative work, and shadcn/create and tweakcn both keep every choice in view beside the preview.

### D-109

Release 2 covers look and feel only (colour, typography, shape, spacing, depth, motion) on the fixed set of components. No per-component style choices and no choosing of building blocks.

**Why:** it is what the engine supports; the rest needs new package variants.

### D-110

Three ways to start, on one screen: a ready-made look, a brand colour (typed, picked, or taken from an image read in the browser), and three plain questions. No AI-generated start.

**Why:** recognition is easier than specification; AI would need a backend, a paid model and abuse limits.

### D-111

The preview shows real example pages plus an "All components" sheet, instead of only a specimen sheet.

**Why:** people judge a look on a screen they recognise; experts still need every state at a glance.

### D-112

Hand-off for non-technical people: a share link, a printable style guide and a design-tool tokens file (DTCG). A design tool is named in the UI only after its import has been done by hand once. No zip pack.

**Why:** the link doubles as the hand-off to a developer; native DTCG import in Figma could not be confirmed from a primary source.

### D-113

Developer install is one file per stack with at most three lines of instructions. No CLI.

**Why:** a CLI is a new published package to maintain; a file is enough for a theme.

### D-114

Work is saved as named projects in the browser, with undo/redo, duplicate, and file export/import. No accounts and no server.

**Why:** today's single draft is easy to lose; accounts would add auth, a database, a privacy policy and cost.

### D-115

A contrast failure is explained in plain words by cause, shown in the preview and fixable with "Fix it for me" (nearest passing shade). Export stays possible, with the warning shown.

**Why:** a list of token pairs helps no beginner; silently changing a picked colour was rejected because the colour may not appear as chosen.

### D-116

Components pages become a gallery: one page per component, a plain "what it is, use it when", live examples in the visitor's own design system, code on demand with Copy, and a props table. The collapsed code and Copy button ship now as a quick win; the full gallery comes after launch.

**Why:** the Forms page is 66% source code; non-technical readers need the picture first.

### D-117

Teaching aids: plain steps with "why it matters" at launch; a glossary page, "inspect the preview" and a "how it fits together" map after launch. Help sits beside a choice, never over it.

**Why:** the maintainer wants people to understand what they build; NN/g advises keeping help beside the fields.

### D-118

Dark mode comes after the Builder, as Release 3. The Builder is built mode-ready (a reserved `mode` in the state, a reserved slot in the preview toolbar).

**Why:** the usability problem is the pressing one, and dark mode doubles every colour decision. It is also the largest gap against competing builders, so it is revisited at launch.

### D-119

New controls go into the npm package first (D-055 holds), and only the four with a concrete use: RadioCard, Slider, ToggleGroup, AlertDialog. Popover, Tooltip, Accordion, Switch and Dialog wait for a verified need.

**Why:** the first draft listed eight "because a friendlier builder needs them"; four had no use yet, and native `<details>` covers disclosure.

### D-120

The area is called the Builder: nav "Build", URL `/build`. `/playground` stays live until launch, then redirects. The expert view is "Studio".

**Why:** "Playground" suggests experimenting, not producing something real.

### D-121

Guided choices are named picture options with an optional fine-tune slider. Exact numbers live in Studio. Each option takes one dimension from one of the four shipped looks, so the same choice gives the same result whichever look a project started from.

**Why:** multipliers in number boxes ask for recall; the shipped looks' values are already reviewed and checked in CI.

### D-122

Fonts: curated pairings (self-hosted) and "I have my own font" at launch; any Google Font after launch.

**Why:** brand people often have their own font; the full catalogue needs the site's first server route, which should not sit on the path to launch.

### D-123

Export formats: CSS variables, a DTCG file and the package theme at launch; Tailwind v4, shadcn/ui variables and JSON/TypeScript after launch.

**Why:** each format is a maintenance and verification cost; the first three cover any site, design tools and this package.

### D-124

The full Google Fonts catalogue is served through our own site (the server fetches, we serve and cache). Visitors never contact Google, and the CSP keeps `font-src 'self'`.

**Why:** loading from Google sends each visitor's IP address to Google and needs a looser policy. Google's own terms are read at the start of that session.

### D-125

Step order is brand-first: Start, Colour, Typography, Shape, Spacing, Depth and motion, Check, Use it. Depth and motion is optional, and "Use it" is always reachable, because the first choice already gives a complete design system.

**Why:** the most personal decisions first make the preview feel like "mine" quickly; nothing should block someone from leaving with a result.

### D-126

Guided is designed for phones too; Studio is desktop-first but reflows and stays accessible.

**Why:** one decision at a time suits a small screen; a dense expert view does not.

### D-127

Success is measured by usability rounds and cookieless analytics. Rounds report problems by severity (critical, serious, minor), never percentages. The launch gate is no open critical or serious finding.

**Why:** NN/g: small rounds find problems; numbers need at least 20 users, which a round of six cannot give.

### D-128

The tool's own chrome stays in a fixed neutral look. Only previews and examples wear the user's design system, chosen with "Showing examples in" (which replaces the header "Theme" switcher).

**Why:** a risky colour choice must never make the tool itself hard to use; it also separates the tool from the work.

### D-129

Order of work: quick wins on today's pages, the Guided builder, the product home at launch, then Studio, teaching aids and the gallery.

**Why:** five of the ten measured problems need no new component; a launch needs a front door; the rest is re-ordered by test evidence.

### D-130

The maintainer moderates the test rounds with the kit in `docs/research/usability-test-kit.md`: six people per round, two per audience (maker, designer, marketer), after one pilot.

**Why:** NN/g suggests 3 to 4 per distinct group or small frequent rounds; two per group, repeated, fits one moderator.

### D-131

Release 2 is the Builder. Dark mode moves to Release 3; the remaining components and navigation follow. The Release 1 plan is archived in `docs/plans/release-1.md`.

**Why:** the maintainer's priority is that anyone can use the tool.

### D-132

The product keeps the name "UI Design System" for now.

**Why:** the name lives in one place and is cheap to change later; it is an open branding item.

### D-133

The UI keeps British spelling ("colour"); code and token names stay `color`.

**Why:** consistency with every existing page, doc and test string.

### D-134

Analytics is Vercel Web Analytics, with the URL hash removed before any event is sent. The funnel is read from page views of the step URLs.

**Why:** the site is already on Vercel; it is cookieless. On Hobby there are no custom events and one month of data (checked 2026-11-16), so each step needs its own URL and figures are copied monthly into `docs/research/`.

### D-135

The props table reads a generated JSON file shipped in the package, built when the gallery needs it (a later minor).

**Why:** the site installs the published package, so only a shipped file always matches the installed version.

### D-136

The Colour step asks for three things: brand colour, highlight colour (suggested, changeable) and background feel (cool, neutral, warm, tinted). Shades and the error colour are generated.

**Why:** hue in degrees and chroma as a decimal are not beginner decisions.

### D-137

The Typography step asks for a pairing and a text size. First-class weight, line-height and letter-spacing controls are a later "developer mode"; raw token overrides stay in Studio.

**Why:** the maintainer's choice; those are the hardest ideas to explain.

### D-138

The preview's example pages are Landing page, Sign-up form, Settings screen and Article, plus "All components" for anything they do not use. All are built from package components only.

**Why:** they are the screens people picture first, and together they show marketing, forms, an app and reading.

### D-139

Exported files start with a one-line credit comment, and the style guide has a small credit footer.

**Why:** it helps people find the tool and is easy to delete.

### D-140

The Guided builder is built in full before people test it; there is no throwaway prototype. The risk is reduced by testing the quick-wins site first (it carries the new wording and the pinned preview), by the dark launch, and by leaving everything after launch unspecified.

**Why:** the maintainer's choice. Recorded because the review recommended a prototype first.

### D-141

Quick wins go first, on today's pages and with existing components only: a pinned preview, tabs, plain labels, one "use in your app" file, and collapsed code with a Copy button.

**Why:** visitors get a better site within days and most of the work carries into the Builder.

### D-142

Where Release 2's documents live. `docs/PLAN.md` holds goals, working rules and one prompt per session, specified only up to launch (S36 to S63); each later milestone writes its sessions at its own kickoff (rolling wave). `docs/builder-spec.md` holds the product and technical design, the decision list and the review record; a session reads only the sections its prompt names. `docs/research/` holds the test kit and the findings of each round.

**Why:** sessions read one short, current plan (D-054); 34 sessions specified before any user evidence was false precision.

### D-143

Working rules for Release 2: one PR per session (branch `s<n>-<slug>`), no branch older than three sessions; the Builder is dark-launched at an unlinked, `noindex` `/build` while `/playground` stays live; every milestone ends with a deployment and an e2e run against it; an independent, review-only session comes before launch; every PROGRESS entry records the session's start and end time.

**Why:** Release 1's retros: production sat on a 24-day-old build, independent reviews and real-deployment runs were what caught real bugs, 23 feature sessions needed 26 review and hardening sessions, and time per session was never tracked.

### D-144

Anything read from a URL, a file or storage is untrusted. A value is accepted only if it parses under an allow-list grammar for its token type, on load and again in every export; names are plain text with a length limit and a strict character set; nothing imported is written as HTML. The shared view is read-only, labelled as someone else's and never overwrites a local project.

**Why:** today `parseState` accepts any string for any `--ds-*` override and `toCss` writes it raw. That was harmless with one private draft; with share links, a crafted value could add rules to the CSS file a developer downloads.

### D-145

Corrections made in S36 against the approved plan. (1) No screenshot suite is added: D-102 stands (the maintainer built one in H19 and removed it); the plan's "screenshot matrix" came from not having read D-102. Look changes are asserted as computed styles in e2e. (2) R26, R27, R29 and the rest of R28, handed to "Release 2" in D-103, follow dark mode to Release 3. (3) The story files already carry usage and accessibility notes (H20c), so the gallery can reuse them for developers; only the plain "what it is" lines are new. (4) RadioCard has no shadcn source; S41 records how D-049 applies to it.

**Why:** the plan was approved before these facts were checked in the repo; the repo wins.

### D-146

RadioCard (S41) is our own component on the adopted RadioGroup item, not an adaptation of a shadcn file (none exists). It follows the rules for adopted components in spirit: individual `@radix-ui/react-*` package, tokens only, a provenance doc (`docs/provenance/radio-card.md`) that says there is no upstream source. The selected state is a heavier border plus a check mark. Slider (S41) is adapted from shadcn new-york-v4 on `@radix-ui/react-slider`, horizontal only (no `orientation` prop yet). Neither adds a colour role, so no new contrast pair or default alias was needed.

**Why:** D-049 covers adopted components; RadioCard has no source to adopt, and silence would hide that. Vertical Slider has no use in the Builder, so it is left out instead of shipped unstyled.

### D-147

ToggleGroup and AlertDialog (S42) are adapted from shadcn new-york-v4 on `@radix-ui/react-toggle-group` and `@radix-ui/react-alert-dialog` (pre-approved), with provenance docs. AlertDialog renders its scrim and panel through `ScopedPortal` as siblings in its wrapper, not through the Radix `Portal`, so it carries the nearest `ThemeScope`'s theme, vars and direction and a `container` prop wins (D-091, D-098). A pressed ToggleGroup item is a fill plus the strong border width, via the existing `.ds-border-selected` recipe, which now also matches `data-state="on"`. No new colour role: the scrim is `overlay.scrim`, so no contrast pair or default alias changed.

**Why:** the Radix `Portal` would leave the dialog outside the scope's theme; reusing the recipe keeps one rule for "selected is not colour alone".

### D-148

The four Release 2 components (RadioCard, Slider, ToggleGroup, AlertDialog) ship in **1.0.0**, not 1.1.0 (S43, maintainer's decision, 2026-11-17). 1.0.0 was prepared in H20 but never tagged or published (npm shows 0.9.0), so there is no released 1.0.0 to add to. `packages/ui` stays 1.0.0 and the 1.0.0 CHANGELOG entry gains the additions. The later release planned as 1.2.0 (package meta files, M18–M22) becomes **1.1.0**. `docs/versioning.md` still applies from the first release: after 1.0.0 is on npm, additions are minors.

**Why:** a minor on top of an unpublished major would mean publishing two releases back to back with nothing consuming 1.0.0 alone; one first stable release with the controls the Builder needs is simpler, and the site pins it once (S50).

### D-149

Builder copy lives in `apps/site/src/content/builder.ts` as typed data (S44, spec 4.10). A vitest test (`builder.test.ts`) fails on any banned word (whole word, any case) in any string and on any sentence longer than **25 words** (the spec gave no number; 25 keeps one idea per sentence). Placeholders are `{step}` and `{count}` only. Studio copy is not covered. Option names are drafts: T0 has not run, so the vocabulary gate stays open.

**Why:** one reviewable file, a mechanical guard on the plain-language rule, and no component reads it until S51.

### D-150

State v2, projects and history (S45, spec 4.9 and 5.2). `PlaygroundState` gains `mode: "light"` (reserved; any other stored value reads as light), `dims` (which shipped look each of six dimensions takes values from; unlisted dimensions follow `start`, so `{}` is exactly the starting look) and `fonts` (typed font names: plain text from a strict character set, 60 characters). Versions 0 and 1 migrate in place; a version newer than the code is not read. Projects are stored under `ds-projects` (version 1, up to 50, names sanitised the same way); today's `ds-playground` draft becomes "My design system" and is left in storage so a rollback loses nothing. A projects file newer than the code is neither read nor overwritten (edits then live in memory only, status `newer`). Undo and redo are per project, in memory (not saved across reloads), capped at 100 steps; changes that share a `group` (one slider drag) replace the present and count as one step. Storage that is blocked, full or corrupt never throws; the store reports `ok | blocked | full | newer`. `dims` is data only: S46 makes the engine apply it.

**Why:** the Builder needs several named projects and undo, and the stored shape had to be versioned before more fields land. Keeping history out of storage keeps the file small and avoids a second format to migrate.

### D-151

Presets, the three questions and shuffle (S46, spec 4.4). `presets.ts` holds the picture choices; each names one shipped look as the source of one dimension, and `resolveState` applies `dims` before knobs and overrides (`applyDims`), touching only themeable primitives, never roles. Dimension ownership: **type** = font sizes, weights, line heights, letter spacing (not families, which are fonts); **shape** = radii; **spacing** = space, control sizes, icon sizes; **depth** = the two shadows (elevation follows); **motion** = durations and easings. **Outline** Thin/Bold is not a preset: it is the existing border-width fine-tune (1px and 2px), so corners and outline stay independent. **Flat** is the one value no look has: `depth: "flat"` sets both shadows to `0px 0px 0px 0px #00000000` (valid shadow syntax, so every format accepts it). New `typeScale` knob multiplies font sizes with a **12px floor**. Controls keep the 24px floor because the spacing presets come from reviewed looks and `density` already floors control height. The three questions map Mood to the starting look (and so type, depth, motion), Room to spacing and Corners to shape; the reason is the three answer sentences from the content file. Highlight suggestions rotate the brand colour's OKLCH hue (180, 150, 210, 30 degrees) at its lightness. `shuffle` picks a different mix of the five dimensions (always changes at least one), keeps colours, fonts and overrides unless `colours` is true, and clears the fine-tunes of the dimensions it replaces so they do not stack.

**Why:** the same choice must give the same values from any start, and the values must stay ones the repo already reviews and checks.

### D-152

Explain and fix (S47, spec 4.5). `explain.ts` finds the cause of each failing contrast result by tracing both sides through the resolved aliases to the colour they came from. Priority when both sides have a cause: a colour set by hand (any override in the chain) > brand > highlight (accent) > background feel (neutral scale); a pair with none of these (for example white on white, or a scrim) is "other". Sentences and the plain role names live in the content file (`check.causes`, `check.roleNames`); a dark-section role uses its plain role's name, and the example is the first failing pair's foreground name. `fix.ts` moves one cause's colour: brand and highlight by an OKLCH lightness search outward from the current colour (darker first on a tie, hue and chroma kept, within the ramp's 0.2 to 0.9 range, 0.005 steps); background feel by reducing the tint (same hue) in twentieths down to plain grey, because its steps keep their own lightness; a hand-set colour by the same search over 0 to 1, or, when it is an alias or not a colour, by removing the override. It sets `knobs.brand`/`knobs.accent` (so a look with no knob gets one), re-runs the whole check and returns the colour and failures before and after plus the totals. It never mutates the state it is given, so undo is the caller's previous state. A fix that cannot reach zero is applied only if it reduces failures, and the result says how many remain.

**Why:** the person should see causes, not pairs, and a fix must be proven by re-running the same check, not assumed. Searching lightness only keeps the colour recognisably theirs.

### D-153

Value grammar, share link and project file (S48, spec 5.3, D-144). `grammar.ts` holds one allow-list parser per value type (colour, dimension, duration, easing, shadow, font family, number, alias); a value is accepted only if it matches one pattern for its type, and the accepted form is returned canonical. A token's type is read from the **shape of its value in the Base theme** (font families by name), so no key table can drift and every key of every theme is typed; a key that is not a Base token is not a token. Accepted forms are the ones the themes hold: hex `#rgb|#rrggbb|#rrggbbaa` and `rgba()`, `px|rem|em` dimensions (a unit is always written), `ms|s` durations, `cubic-bezier()` with x in 0..1 or an easing keyword, one shadow layer with a hex colour, a font stack of up to eight bare or single-quoted names, a plain number. `scripts/lib/dtcg.mjs` validates the DTCG object forms, not the CSS strings the state holds, so its code is not reused. `parseState` drops, never repairs, an override whose token is unknown or whose value or alias target does not parse. `toCss` and `toDtcg` call `safeValue` on every value and `parseAlias` on every alias, and throw `UnsafeValueError`: a bad value is refused, not skipped, so a file is never written half-clean. `share.ts` encodes `serialiseState` as gzip (`CompressionStream`) then base64url in `#share=`; decoding caps the text at 8,000 characters and the inflated JSON at 64,000 (checked while reading, so a zip bomb stops), then goes through `parseState`; a newer version is `newer`, anything else `invalid`. `project-file.ts` writes `{format: "ds-project", version, name, state}` and reads it with a 100,000-character cap, a format and version check, `sanitiseName` and `parseState`.

**Why:** anything read from a URL, a file or storage is untrusted and ends up in a file the person downloads; one allow-list at the door and again at every exit means a missed path in one place cannot reach a download.

### D-154

CSS-variables and DTCG-file formats (S49, spec 4.6, D-139, D-144). `playground/formats/` holds `credit.ts` (the one-line credit, shared), `css-vars.ts` (`toCssVars`: one `:root` block of every var, resolved to literals, so it works on a plain HTML page without the package) and `dtcg-file.ts` (`toDtcgFile`: one DTCG 2025.10 file; primitives as values, roles as aliases such as `{color.brand.600}`, a role the person set as a value of its own written as a typed value). Both are pure and call `safeValue` on every value, so a value that bypassed the grammar throws `UnsafeValueError`. The credit is a CSS comment and the DTCG root `$description`. A role sits in a group named by the first word of its var (`action.primary-bg`), because the var name does not say where the repo source nests it; a path collision throws. A role value 2025.10 cannot hold (an `em` dimension, a keyword easing) is left out and listed in `unrepresentable`, never written wrong. `output.ts` gained `primitiveSlot` and `literalSlot` (shared with `toDtcg`, which is unchanged), and the theme-folder export and its round-trip test are untouched.

**Why:** one file each for the two audiences who do not use the package; the credit and the grammar are shared so neither format can drift from the other or write an unchecked value.

### D-155

Neutral chrome and an examples scope (S50, spec 4.2, D-128). The site no longer writes a look to `<html>`; the chrome always wears Base. `lib/theme.ts` keeps the chosen look (name and resolved vars) in a small external store, still cached in `ds-theme` (same format and version). `ExamplesScope` (client) is a `ThemeScope` with `data-examples-scope`, read from that store; `Example` wraps its demo frame in it (with `ds-tone-canvas`, so the frame takes the look's own page colour), the code block stays outside. The head script no longer touches `<html>`: it appends one `<style>` rule `[data-examples-scope]{…}` built from the cached map, which stops a reload flashing Base in the examples before hydration. Stored values are untrusted, so the script keeps only `--ds-*` keys with a plain name whose value has no `;{}<>`, double quote or backslash and balanced single quotes. The header switcher reads "Showing examples in" (four looks; projects join in S51). The playground preview already wears its own `ThemeScope` and is unchanged.

**Why:** a risky look must never make the tool itself hard to use (D-128); a style rule on the scope, not an inline style on `<html>`, keeps the first paint right without leaking the look into the chrome.

### D-156

The Builder shell (S51, spec 4.2, 4.3, 4.9, 4.11). `/build` is unlinked and `noindex` (route-group layout metadata), outside the sitemap. Routes: `/build` (project chooser: open, rename, duplicate, delete behind an AlertDialog, new), `/build/[step]` (`dynamicParams = false`, one static page and one `<title>` per step; anything else is a 404) and `/build/studio` (today's `Playground`, unchanged). The step list is an `<ol>` of links in a `nav`, `aria-current="step"` on the open one; the open row holds the step's heading (`h2`, the question), its two sentences, the "why it matters" line and "Next: …" / "Back: …" links. Focus moves to that heading on every step change but not on the first load of the page (a module flag), so the normal tab order from the header still works on arrival. Every row shows the current choice in words (`playground/steps.ts`, pure and tested; a value that matches no picture choice, such as Base's shadows, reads "As in your starting look" instead of naming a wrong choice). The top bar (a labelled region, not pinned, so it never covers a focused control) has the project name edited in place (saved on blur or Enter, Escape undoes), `Guided | Studio` as links (so Back works), Undo, Redo, a status pill and "Use it" (`/build/use`). `store.ts` now exposes the whole projects view and its actions. "Showing examples in" lists the person's projects: the switcher loads them after hydration through a dynamic import of `lib/project-look.ts`, which resolves a project with the engine and applies it through `applyProjectLook` (guarded by the same latest-request counter as the four looks); the stored `ds-theme` value gains an optional `project` id (a plain-id check, same version), so a reload applies the project's cached vars before paint. A project that wears the examples follows its edits; a deleted one falls back to Base. Every new string is in the content file (`shell`).

**Why:** one URL per step keeps Back, deep links and the later funnel; keeping the projects store and the engine out of the header's static bundle keeps the chrome as light as R30 left it.

### D-157

The preview pages (S52, spec 4.8). `Preview` (used by Studio and the Builder shell) now has five tabs built from package components only: Landing page, Sign-up form, Settings screen, Article and All components, plus a ToggleGroup width switch (Phone 24rem, Tablet 48rem, Desktop full). Each page sits in a frame that is a container (`@container`), so the package layout follows the frame, not the window. The pages live in `components/preview/`; a unit test reads their sources and keeps three things true: they import only `@puranderdua/ui`, none writes a landmark element, and "All components" shows exactly the components the other four pages do not use (its own headings, text and stack are scaffolding). The preview adds no landmark: the page owns one labelled `section#preview` after the panel (the shell already had it; Studio now has it too, with the same skip link). The preview title is the only h2 inside it; the pages start at h3. Links and forms never act: the scope calls `preventDefault` on a click inside any anchor and on every submit (capture phase). Tab and width strings are in the content file (`preview`); the example pages' own sample copy stays with the pages, as demo copy did.

**Why:** one frame that follows its own width is how the package already lays out, so Phone needs no second layout; testing the component split keeps "All components" honest as components are added.

### D-158

Start and Colour (S53, spec 4.4 rows 1–2, 4.5). Logic is pure in `playground/start.ts` (tested); the UI is `components/build/{start-step,colour-step,colour-field}.tsx`, shown in the open row of the step list in place of the "on their way" note. **One colour control for every colour:** a text field, a picker beside it, and a readability line under it. A complete 6-digit code applies at once; a short or wrong one waits for blur or Enter and then shows the content file's sentence plus suggestion (`errors.colourInvalid`) and changes nothing. Codes go through the value grammar; `#abc` and a code without `#` are accepted, a colour with transparency is not. **Picture colour:** `readImageColour` draws one image file (type `image/*`, at most 10 MB) on a 64px canvas in the browser and keeps the most characteristic colour (coarse buckets, colourful pixels weigh more, so a white background does not win). Nothing is uploaded or stored, and an e2e test fails on any non-GET request. **Looks:** four RadioCards whose media is a `ThemeScope` thumbnail resolved from the person's state with that look (`withLook` keeps the brand and highlight colours and starts everything else again, as the playground does). **Three questions** use `recommend` and show its reason. **Background feel** maps to the `neutral` tint: Cool and Warm are fixed tints (hue 250, 70), Neutral has none, "Tinted to brand" takes the brand colour's hue and keeps following it when the brand changes (`withBrand`). The feel is read back from the state, so no new field is stored. **Readability line:** brand reads the real main-button pair (`action-primary-fg` on `-bg`), highlight reads accent text on the page, background reads body text on the page; the full check stays with the Check step.

**Why:** one component for every colour keeps the rule "every colour has a text field beside the picker" true by construction; reading the real role pair for the brand line means it agrees with Check, not with a guess about white text.

### D-159

Typography (S54, spec 4.4 row 3, D-122). The step is `components/build/typography-step.tsx`; its logic is pure in `playground/{fonts,state,engine,grammar}.ts`. **Pairings:** three RadioCards (Clean and modern, Classic and warm, Friendly and round), each drawn in its own typefaces and made only of the five fonts the site already self-hosts with `next/font` (`fontPairings`: Clean is Inter with Inter, Classic is Fraunces with Nunito Sans, Friendly is Bricolage Grotesque with Nunito Sans). Choosing one sets the heading and body font knobs together and clears any typed font; the selected card is read back from the resolved families, so Base reads as Clean and modern. **Own font:** `state.fonts` (stored since S45 but unused until now) reaches the engine: `resolveTheme` writes `'Name', <fallbacks of the stack it replaces>` into the heading or body family after the pairing and before overrides, so every export carries the name. The name passes `parseFontName` (letters, numbers, spaces and `. & _ -`, up to 60 characters, the set the grammar's quoted font already allows) when it is typed, when a stored state is read, and again when the engine writes it. **Preview:** `previewVars(vars, fonts)` swaps a typed name for the stack's fallbacks (the labelled stand-in) and a line under the field says so, using `errors.fontMissing`; no font is requested from another origin. A wrong name waits for blur or Enter, then shows `errors.fontInvalid` and keeps the last good name. **Text size:** the three RadioCards are the existing `type` preset (Compact, Standard, Large from Corporate, Base, Nature); choosing one clears the fine-tune. The fine-tune is a package `Slider` on the `typeScale` knob (80 to 130 percent in steps of 5), whose value is said in words (smaller than, standard, larger than standard).

**Why:** letting a person name a font without loading it keeps the promise that nothing leaves our origin while the exported files still carry the real name; applying the typed font after the pairing means the last thing a person chose for a role wins.

### D-160

Shape, Spacing, Depth and motion, and shuffle (S55, spec 4.4 rows 4 to 6, 4.3). The three steps are `components/build/preset-steps.tsx` (`ShapeStep`, `SpacingStep`, `DepthStep`); the choice logic was already in `playground/presets.ts` (S46) and is reused unchanged. **Cards:** each RadioCard takes one dimension from one shipped look (`withPreset`) and clears that dimension's fine-tune, so a choice starts from itself. Card pictures are drawn from the look's own value (`--ds-radius-lg`, `--ds-space-3`, `--ds-shadow-lg`), not from the project, so each card always shows what it would give. **Fine-tunes** are package `Slider`s on the existing knobs (corners 50 to 150 percent, spacing 80 to 130, shadows 25 to 200, speed 50 to 200, outline 1 to 4 px) and say their value in words through `aria-valuetext` ("Rounder than the choice"). Each slider passes a group (`fine-tune-<knob>`), so a drag or a run of keys is one undo step. Outline cards set `borderWidth` to 1 or 2 px. **Play** moves a sample with the project's own `--ds-duration-200` and `--ds-easing-out-strong`; when the device asks for reduced motion the duration is `0s` (the sample jumps) and a line says so. **Try another combination** sits in the top bar with a "Keep my colours" checkbox (ticked by default). It calls `shuffle` once through `setState`, so one Undo restores every dimension. Unticked, it also moves to another starting look and clears the brand, highlight and background feel.

**Why:** drawing cards from the look rather than the project keeps them stable while the person fine-tunes; one `setState` call is what makes a shuffle one undo step.

### D-161

Check (S56, spec 4.5 and 4.11). The step is `components/build/check-step.tsx`; its logic is pure and tested in `playground/check.ts` and `playground/show-me.ts`. It reuses S47's `explain` and `fix` unchanged. **Causes:** one card per cause with the S47 sentence, a drawn sample of one failing pair (hidden from assistive technology; the sentence says it in words), **Show me** and **Fix it for me** (not for "other", which has no colour to move). **Fix** is one `setState`, so Undo restores it whole; the result card (before and after colours, what is left) shows only while the project is still the state the fix made. **Fix all** runs each fixable cause in turn on the state the last one made and is also one `setState`. **Show me** outlines places by what the browser draws, because the preview pages carry no role markers: an element whose text, border or background is the pair's front colour on its back colour, both compared as computed `rgb()`. A MutationObserver keeps the outlines on while the example page changes, and a line says when the open page does not show the pair. The outline uses fixed colours in `globals.css` (`[data-check-flag]`), not tokens, because the preview re-maps every token. **Technical details** is a native `<details>` listing every pair with its ratio and the minimum, failing first. **What you've built** lists the six decisions, each linking to its step. **Live region:** the top bar's status pill no longer has `role="status"`; a separate polite live region speaks the status only after it has stayed the same for 600 ms and differs from the last one spoken, and says nothing on load. A slider drag or a change and back is silent; a lasting change is spoken once. The Builder axe helper takes an exclude list; the Check axe test excludes the preview and the sample, which show a failing pair on purpose.

**Why:** state-in, state-out functions keep a fix one undo step; matching on computed colours finds the places without changing every preview component; debouncing keeps a screen-reader user from hearing every step of a drag.
