# Changelog

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
