# Styling rules

How to write and consume styles in the design system (Tier 3).

## Rules

1. **No dynamic class names.** Tailwind finds classes by scanning for literal strings. `text-${size}` is never emitted. Use static maps (cva or plain objects) whose values are full class strings.
2. **No arbitrary values for shared decisions.** No `text-[17px]`, `bg-[#123]`, `h-[var(--ds-...)]`. If a value is a design decision, it is a token, mapped in `theme.css`.
3. **`@apply` only inside recipes** (`@layer components` in `theme.css`). Never in component CSS or consumer code.
4. **Semantic tokens only.** `theme.css` maps `--ds-*` semantic variables; it never maps primitives (`--ds-color-brand-600`), and components never reference them.
5. **Tailwind v4 only.** Configuration lives in CSS (`@theme`); there is no `tailwind.config.js`.

## Utility names (from `theme.css`)

| Namespace                 | Utilities                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-ds-*`            | `bg-ds-primary`, `text-ds-primary-fg`, `bg-ds-secondary`, `border-ds-secondary-border`, `text-ds-text`, `text-ds-text-muted`, `bg-ds-canvas`, `border-ds-border`, `bg-ds-disabled`, …        |
| (colour roles, S15)       | `bg-ds-surface-subtle\|raised\|inverse\|brand`, `text-ds-link`, `text-ds-link-hover`, `text-ds-on-brand`, `border-ds-border-strong\|control`                                                 |
|                           | `bg-ds-input`, `border-ds-input-border`, `border-ds-input-border-hover`, `placeholder:text-ds-placeholder`, `text-ds-danger-fg`, `border-ds-danger-border`, `bg-ds-danger-bg`, `bg-ds-scrim` |
| `--text-ds-<role>`        | `text-ds-display\|h1\|h2\|h3\|body\|lead\|caption\|label` (size + line-height + weight + letter-spacing), `text-ds-control-sm\|md`                                                           |
| `--font-ds-*`             | `font-ds-heading`, `font-ds-body`                                                                                                                                                            |
| `--radius-ds-*`           | `rounded-ds-control`, `rounded-ds-card`, `rounded-ds-pill`                                                                                                                                   |
| `--shadow-ds-*`           | `shadow-ds-raised`, `shadow-ds-overlay`                                                                                                                                                      |
| `--ease-ds-*`             | `ease-ds-standard`, `ease-ds-emphasized`                                                                                                                                                     |
| `--container-ds-*`        | `max-w-ds-sm\|md\|lg\|xl`                                                                                                                                                                    |
| `--spacing-ds-control-*`  | `h-ds-control-sm\|md`, `px-ds-control-px-sm\|md`                                                                                                                                             |
| `--spacing-ds-*` (layout) | `gap-ds-gap-xs\|sm\|md\|lg\|xl`, `py-ds-section-sm\|md\|lg`, `px-ds-gutter`, `w-ds-sidebar`                                                                                                  |

Tailwind has no namespace for border width or transition duration, so those two are recipes (below).

## Recipes

- `.ds-type-<role>`: font family (the role's own `--ds-type-<role>-font-family`, heading or body) + the role's size, weight, line-height and letter-spacing in one class. A single utility cannot carry the family and the companions together.
- `.ds-focus-ring`: `:focus-visible` outline from `focus.ring-width`, `focus.ring-offset` and `focus.ring` (no Tailwind namespace exists for outline width/offset).
- `.ds-border`, `.ds-border-strong`: solid border with `border-width.default` / `border-width.strong`. Colour comes from `border-ds-*`.
- `.ds-transition`, `.ds-transition-fast`: colour, shadow, opacity and transform transitions with `motion.duration.normal|fast` and `motion.easing.standard`. Under `prefers-reduced-motion: reduce` the duration is 0s.

Add a recipe only when utilities cannot express the composite.

## Consuming

`foundations.css` contains the `@theme inline` bridge and recipes, with no token values (D-056). It does **not** import Tailwind. Import it once, plus exactly one theme, from the package (D-055):

```css
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@import "@puranderdua/ui/themes/base.css";
@source "../node_modules/@puranderdua/ui/dist";
```

`@source` is needed so Tailwind scans the package's built component classes.

## Build

`pnpm --filter @puranderdua/ui build` writes `theme.css` (bridge + recipes, no token values) to `packages/ui/dist/foundations.css` and copies `generated/themes/*` to `dist/themes/` (`scripts/build-foundations.mjs`). Import one `themes/<name>.css` after `foundations.css` (the playground and Storybook use `themes/base.css`). `pnpm --filter @puranderdua/ui playground:check` builds the throwaway Vite playground and fails if any class it uses is missing from the production CSS.
