# Changelog

## Release 1 wrap-up — 2026-11-14 (site only, no package change)

`@puranderdua/ui` stays at **0.8.0**; nothing here is published to npm. The site's `/playground` can now **export** its theme: the four DTCG files for `tokens/themes/<name>/` (`color`, `dimension`, `effects`, `typography`) and a `<name>.css`, each with Copy and Download, plus Download all. A round-trip test writes an export into a scratch `tokens/themes/custom/` with a scratch resolver and runs `validate-tokens`, `build-tokens` and `contrast`. See `docs/releases/v1.md`.

## 0.8.0 — 2026-11-14

New **accent** colour role: a second voice beside the brand, for selection and highlight, never for the primary action. No API breaks; existing components keep their look except the `Tabs` active marker (below).

**New tokens that custom themes must define** (`validate-tokens` enforces this in this repo):

- `color.accent` scale, 50–900 (same steps as `brand`), in each theme's `color.json`.
- Semantic roles `text.accent` and `accent.border` in `tokens/semantic/color.json`, and `text-accent` and `accent-border` in each of `on-raised`, `on-inverse` and `on-brand` in `tokens/semantic/tone.json`. All `.ds-tone-*` recipes re-point the two vars.

**Migration:** copy the accent scale and tokens from `themes/base` into each custom theme and adjust values until `contrast-pairs.json` passes (200 pairs per theme, was 180: `text.accent` needs 4.5:1 and `accent.border` 3:1 on every tone).

**Added:**

- Themes: Base steel-blue, Corporate teal, Nature terracotta, Quirky coral accent. Quirky's `red` scale is now a crimson (the coral moved to `accent`).
- Tailwind bridge: `text-ds-accent`, `bg-ds-accent-border`, `border-ds-accent-border`.
- `Card` `variant="accent"`: a raised card with an accent outline (featured plan).

**Changed:**

- `Tabs`: the active label uses `text.accent` and the active bar `accent.border` (was `text` and `border.control`). Override with `className` if you want the old look.

## 0.7.0 — 2026-11-13

Three new themes: **Corporate**, **Nature** and **Quirky**, alongside the default **Base**. No component, token-contract or API changes, so there are no breaking changes and no migration steps.

**Added:**

- `themes/corporate.css|json`, `themes/nature.css|json`, `themes/quirky.css|json` (each in the package `exports` next to `themes/base.*`). Every theme defines the full token set and passes the WCAG contrast matrix in `contrast-pairs.json` (180 pairs per theme), and every component story passes axe under each theme.
- Fonts: Corporate uses IBM Plex Sans, Nature uses Fraunces (headings) and Nunito Sans (body), Quirky uses Bricolage Grotesque. Themes name the font in `--ds-font-family-heading|body` but **do not load it**; load the font in your app (for example with `next/font`, see `docs/themes.md`).

**Using a theme:** import `foundations.css` plus exactly one theme, for example `@import "@puranderdua/ui/themes/nature.css";`. To switch at runtime, apply the `vars` of `@puranderdua/ui/themes/<name>.json` as inline custom properties on `<html>` or a `ThemeScope`.

## 0.6.0 — 2026-11-12

Display components: `Card`, `Tabs`, `Banner`. No breaking changes to existing components.

**New tokens that custom themes must define** (`validate-tokens` enforces this in this repo):

- `on-raised.*` in `tokens/semantic/tone.json` (text, muted text, link, focus ring, control border, primary and secondary action roles), used by `.ds-tone-raised`.
- `surface.gradient-start` and `surface.gradient-end` in `tokens/semantic/color.json`, used by `.ds-tone-gradient`. Keep the end at least as dark as the start: the tone reuses the `on-brand` roles (light on dark).

**Migration:** copy these tokens from `themes/base` into each custom theme and adjust values until `contrast-pairs.json` passes. It now checks a `raised` and a `gradient` context (both gradient stops), and a per-theme scrim check for `Banner`.

**Added:**

- `Card` (`variant` outline | raised; `as` div, article, section, li, aside) with `CardMedia`, `CardHeader`, `CardTitle` (a `Heading`, `as` configurable), `CardDescription`, `CardContent`, `CardFooter`. Server-safe; `cardVariants` can be called from a Server Component.
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (adapted from shadcn new-york-v4 on `radix-ui`): roving focus, arrow keys, Home/End, `activationMode`, `orientation`, triggers at least 32px. Client component.
- `Banner`: full-screen hero (`height` screen | tall, `align` start | center, `tone` canvas | brand | inverse | gradient, `as`, `container`), a `media` slot under an `overlay.scrim` layer (`scrim` strong | medium), and a `video` prop (`src`, `poster`, muted, looped, inline). The video part is a small client component: under `prefers-reduced-motion` only the poster shows, and a visible pause/play button is always offered (WCAG 2.2.2). `Banner` itself is server-safe.
- Tones `.ds-tone-raised` (a surface that restores the base roles inside an inverse or brand Section) and `.ds-tone-gradient`.

## 0.5.0 — 2026-11-11

Production-hardening release (milestone MH, findings in `docs/audits/2026-10-20-production-readiness.md`).

**Breaking (0.x minor):**

- `Sidebar side="end"` now renders the content first and the aside after it (DOM order is visual order, no `flex-row-reverse`). When the row wraps, the aside is below the content instead of above it.
- `Grid` with `cols` renders a wrapper `div` (the `@container`) around the grid element, so it follows its own width, not the viewport. `as`, `ref`, `role`, `className` and other props stay on the grid; `container.firstElementChild` is no longer the list.
- `Link`: the `focusable` prop is removed; `externalLabel` replaces the hard-coded hint text.
- New tokens that **custom themes must define** (`validate-tokens` enforces this in this repo): the tone roles in `tokens/semantic/tone.json` (`on-inverse.*`, `on-brand.*`, used by `.ds-tone-*`), and `control.target-min` (from primitive `size.target.min`). Layers are shared and not themed, so themes need nothing for them.
- `Section` tones (inverse, brand) re-map role variables through `.ds-tone-*` recipes instead of fixed text classes. Tones do not nest.

**Migration:**

1. Custom themes: copy the `on-inverse.*` and `on-brand.*` tokens and `size.target.min` from `themes/base`, then adjust values until `contrast-pairs.json` passes (it now checks every role in every tone).
2. `Sidebar side="end"`: check any CSS or test that assumed the aside comes first in the DOM; use `sidebarProps` for `aria-label` and `id`.
3. `Grid cols`: update selectors or tests that read the grid as the first child.
4. `Link`: delete `focusable`; pass `externalLabel` to translate "(opens in a new tab)".
5. Replace raw `z-*` utilities on overlays with the `.ds-layer-*` recipes (`cn()` replaces a raw `z-*` with a layer class).

**Added:**

- `ThemeScope` (applies a theme's vars to a subtree and is the portal container) and `usePortalContainer()`. `SelectContent` portals into the nearest scope (`container` still wins), falling back to `document.body`.
- Layer scale (`--ds-layer-*`, `.ds-layer-*`) shipped in `foundations.css`.
- Tone-aware roles and the `.ds-tone-canvas|subtle|inverse|brand` recipes; `contrast-pairs.json` gains contexts, roles and exclusions.
- `Fieldset` and `useFieldsetContext` (group of controls: `<fieldset>` + `<legend>`, description, error, required); `RadioGroup` reads it.
- `Field layout="inline"` (control first, label beside it, for a Checkbox).
- `Link externalLabel`; `useFieldContext` is exported; a `default` export condition.
- `.ds-hit-area`: Checkbox and RadioGroupItem keep a 16px visual with a 24px target.
- `Sidebar sidebarProps`.

**Fixed:**

- F01: `inputVariants`, `checkboxClasses`, `radioGroupItemClasses` and `selectTriggerVariants` can be called from a Server Component (moved to `*.styles.ts`; the barrel is unchanged).
- F13: `RadioGroup` invalid state comes through the group.
- F14: Checkbox icons follow `data-state`.
- F27: `Field description=""` no longer renders an empty described-by.
- F28: `aria-invalid` styles no longer override disabled (`aria-invalid:enabled:`).
- F02: focus ring and text on inverse and brand surfaces meet contrast.

## 0.4.0 — 2026-10-20

Added (forms):

- `Label`, `Field` (label, control, description, error, required marker; ids via `useId`, `aria-describedby`, `aria-invalid`) and `Input` (sm | md).
- `Checkbox` (checked, indeterminate, invalid, disabled) and `RadioGroup` + `RadioGroupItem`, adapted from shadcn/ui new-york-v4 on `radix-ui`.
- `Select` with `SelectTrigger` (sm | md), `SelectValue`, `SelectContent` (`container` prop for the Radix Portal), `SelectGroup`, `SelectLabel`, `SelectItem`, `SelectSeparator` and scroll buttons, adapted from shadcn/ui new-york-v4.
- Form controls read the nearest `Field` for their id, `required`, invalid state and description.
- The build keeps `"use client"` on client components (one entry per component), so Server Components can import `Text`, `Heading`, `Field`, `Input` and the rest directly (D-065).

Breaking (0.x minor), both only in 0.3.0 for a few days:

- `Split`: the `reverse` prop is removed. Reordering columns visually breaks the keyboard focus order; reorder the children instead.
- `Sidebar`: the `collapseBelow` prop is removed. `Split` and `Sidebar` now wrap by the width of their container instead of the viewport, so they also stack correctly inside a narrow card, sidebar or dialog. Put horizontal padding on an inner element of a `Split` column so the 1:2 and 2:1 ratios stay exact.

Changed:

- `Grid`, `Stack` and `Cluster` set `role="list"` when rendered as `ul` or `ol` (Safari + VoiceOver drops list semantics after the Tailwind reset).
- `Button` and `Link` use the `.ds-transition` recipe, so they respect `prefers-reduced-motion`; `Button` uses `.ds-border`.
- `Link external` keeps a caller's `rel` tokens (for example `nofollow`) and adds `noopener noreferrer`.

## 0.3.0 — 2026-10-19

Added:

- Layout components: `Container`, `Grid`, `Stack`, `Cluster`, `Section`, `Split`, `Sidebar` (typed `as`, static variant maps, responsive, tokens only).
- Tokens `size.item.sm|md|lg` → `layout.item-min.*`, and `.ds-grid-fit-*` recipes for `Grid` auto-fit.
- `Link`: `variant` inline | standalone, `asChild`, `external` (new tab with icon and hidden hint), link colours from `text.link*`.
- Dependency `lucide-react` (icons).

No breaking changes to the components from 0.2.0. Custom themes written against 0.2.0 must add the three `layout.item-min.*` tokens (`validate-tokens` enforces this for themes in this repo).

## 0.2.0 — 2026-10-19

Breaking (0.x minor):

- `foundations.css` no longer carries token values. Import one theme as well: `@import "@puranderdua/ui/themes/base.css";` (D-056).
- `--ds-font-family-sans` and the `font-ds-sans` utility are gone; use `--ds-font-family-body` / `font-ds-body` (and `heading`).
- `control.radius` is replaced by `radius.control` (`--ds-radius-control`).
- The shadcn registry (`@puranderdua`, `ds-*` items) is retired. Install the npm package instead (D-055).

Added:

- Themes: `themes/<name>.css` and a resolved `themes/<name>.json` map for live switching; `base` is the only theme so far.
- Tokens and utilities for heading/body font families, elevation (shadows), motion (durations, easings), radius and border-width roles, layout (gaps, section padding, gutter, containers, sidebar) and colour roles (surface, text, border, input, feedback, overlay). New recipes `.ds-border*` and `.ds-transition*`.
- `contrast-pairs.json` export (44 WCAG pairs checked per theme).
- Package exports: `./themes/*.css`, `./themes/*.json`, `./contrast-pairs.json`.

Changed:

- `Button` takes `Slot` from the unified `radix-ui` package (dependency `radix-ui` replaces `@radix-ui/react-slot`); behaviour is unchanged.

## 0.1.0 — 2026-10-17

First release.

- `@puranderdua/ui`: `Text`, `Heading`, `Button` (React 19, Tailwind v4) and `foundations.css`, with typed props and exports.
- Token pipeline: DTCG primitives and semantics, built to CSS variables and JSON, with alias, duplicate, determinism and contrast checks.
- shadcn registry (`@puranderdua`): `ds-foundations`, `ds-types`, `ds-utils`, `ds-typography`, `ds-button` at `/r/v0.1.0/`.
- Portfolio site (`apps/site`), Playwright and axe tests, and Storybook (`apps/docs`).
