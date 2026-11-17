# Provenance: AlertDialog

- **Source:** shadcn/ui `new-york-v4` Alert Dialog (`registry/new-york-v4/ui/alert-dialog.tsx`) in https://github.com/shadcn-ui/ui, built on `@radix-ui/react-alert-dialog`.
- **Upstream commit:** not recorded; the registry JSON carries no commit. Re-check with `pnpm upstream:diff` before a release.
- **Fetched:** 2026-11-17 (structure only; the file was adapted, not pasted)
- **License:** MIT (shadcn/ui, © shadcn)
- **Our files:** `packages/ui/src/components/alert-dialog.tsx`, `alert-dialog.styles.ts`

## Dependencies

| Package                        | Why                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `@radix-ui/react-alert-dialog` | `AlertDialog` primitive from the individual package (D-093; pre-approved in S42) |
| `clsx`, `tailwind-merge`       | via our `cn` (`@/lib/utils`)                                                     |

## Changes from upstream

1. **Portal:** upstream wraps the overlay and content in the Radix `Portal`. We use `ScopedPortal` (D-091, D-098): it portals to `document.body` (an explicit `container` wins) and re-applies the nearest `ThemeScope`'s theme, vars and direction plus the raised tone. The scrim and the panel are siblings inside its wrapper.
2. **Layers and scrim:** `z-50` → `.ds-layer-overlay` (scrim) and `.ds-layer-modal` (panel); `bg-black/50` → `bg-ds-scrim` (the `overlay.scrim` role).
3. **Position:** `top-[50%] left-[50%] translate-*` → `inset-0 m-auto h-fit`, so it follows the text direction with no arbitrary values.
4. **Colours and shape:** `bg-background` → `bg-ds-surface-raised`; `border` → `ds-border border-ds-border`; `shadow-lg` → `shadow-ds-overlay`; `rounded-lg` → `rounded-ds-card`; `max-w-lg` → `max-w-ds-sm`.
5. **Buttons:** upstream's `buttonVariants()` on Action and Cancel stays, but Cancel defaults to `secondary`; both take `variant` and `size`. Their `children` are required, so no string is hidden inside the component.
6. **Removed:** the responsive `sm:` text alignment and reverse footer ordering (`flex-col-reverse`), because DOM order is visual order (D-064); the footer is one row that wraps.
7. **Props:** `function` → arrow const (D-035); `ref` is a plain prop typed from the element (D-034); class strings in a plain `alert-dialog.styles.ts` (D-070).
8. **Kept:** `"use client"`, `data-slot` names. Focus trap, focus to Cancel on open, focus return and Escape are Radix behaviour.
