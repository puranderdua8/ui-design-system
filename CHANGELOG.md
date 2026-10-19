# Changelog

## 0.3.0 — 2026-10-19

Added:

- Layout components: `Container`, `Grid`, `Stack`, `Cluster`, `Section`, `Split`, `Sidebar` (typed `as`, static variant maps, responsive, tokens only).
- Tokens `size.item.sm|md|lg` → `layout.item-min.*`, and `.ds-grid-fit-*` recipes for `Grid` auto-fit.
- `Link`: `variant` inline | standalone, `asChild`, `external` (new tab with icon and hidden hint), link colours from `text.link*`.
- Dependency `lucide-react` (icons).

No breaking changes.

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
