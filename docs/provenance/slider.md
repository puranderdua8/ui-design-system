# Provenance: Slider

- **Source:** shadcn/ui `new-york-v4` Slider, `registry/new-york-v4/ui/slider.tsx` in https://github.com/shadcn-ui/ui (read from `https://ui.shadcn.com/r/styles/new-york-v4/slider.json`)
- **Upstream commit:** not recorded; the registry JSON carries no commit. Re-check with `pnpm upstream:diff` before a release.
- **Fetched:** 2026-11-17
- **License:** MIT (shadcn/ui, © shadcn)
- **Our files:** `packages/ui/src/components/slider.tsx`, `slider.styles.ts`

## Dependencies

| Package                  | Why                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `@radix-ui/react-slider` | `Slider` primitive from the individual package (D-093; upstream uses the unified `radix-ui`) |
| `clsx`, `tailwind-merge` | via our `cn` (`@/lib/utils`)                                                                 |

## Changes from upstream

1. **Colours:** `bg-muted` track → `bg-ds-border-control` (3:1 on every surface); `bg-primary` range → `bg-ds-primary`; thumb `bg-white border-primary` → `bg-ds-input` with `ds-border-strong border-ds-primary`.
2. **Focus:** `ring-ring/50 hover:ring-4 focus-visible:ring-4` → `.ds-focus-ring` recipe; hover is a border colour (`primary-hover`).
3. **Disabled:** `opacity-50` → `disabled.*` tokens.
4. **Target size:** the root is `h-ds-control-sm` (32px) and the thumb has `.ds-hit-area` (at least 24px).
5. **Sizes:** `h-1.5`, `size-4` → `h-ds-gap-xs`, `size-ds-icon-md`. Pill radius from `rounded-ds-pill`.
6. **Removed:** `shadow-sm`, `transition-[color,box-shadow]`, the vertical-orientation classes (horizontal only; `orientation` is not in the prop type).
7. **Added:** a visible value (`showValue`, `formatValue`, an `<output>`); `aria-valuetext` as a string or a function of each thumb's value; `thumbLabels` for a range; `aria-label`, `aria-labelledby` and `aria-describedby` reach each thumb, and a surrounding `Field` supplies the name and description.
8. **Thumbs:** one per value of the controlled or internal value (upstream defaults an unset value to `[min, max]`; ours to `[min]`).
9. **Props:** `function` → arrow const (D-035); `ref` is a plain prop typed `HTMLSpanElement`; class strings in a plain `slider.styles.ts` (D-070).
10. **Kept:** `"use client"`, `data-slot` names (`slider`, `slider-track`, `slider-range`, `slider-thumb`).
