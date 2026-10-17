# Provenance: Button

- **Source:** shadcn/ui `new-york-v4` Button, `apps/v4/registry/new-york-v4/ui/button.tsx` in https://github.com/shadcn-ui/ui (fetched from `https://ui.shadcn.com/r/styles/new-york-v4/button.json`)
- **Upstream commit:** `c257f688cf4de7ec10cc1be84cad29cd4631182c` (last commit touching the file, 2026-09-04). shadcn CLI version not recorded: the file was fetched from the public registry JSON, not through the CLI.
- **Fetched:** 2026-10-17
- **License:** MIT (shadcn/ui, © shadcn)
- **Our file:** `packages/ui/src/components/button.tsx`

## Dependencies

| Package                    | Why                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `class-variance-authority` | variant maps (as upstream)                                                                 |
| `@radix-ui/react-slot`     | `asChild`. Upstream imports `Slot` from the `radix-ui` umbrella; we use the single package |
| `clsx`, `tailwind-merge`   | via our `cn` (`@/lib/utils`)                                                               |

## Changes from upstream

1. **Variants:** `default | destructive | outline | secondary | ghost | link` → `primary | secondary`. Default `primary`.
2. **Sizes:** `default | xs | sm | lg | icon*` → `sm | md`. Default `md`.
3. **Colours, radius, height, padding, font size:** shadcn utilities (`bg-primary`, `rounded-md`, `h-9`, `px-4`, `text-sm`) → `ds` token utilities (`bg-ds-primary`, `rounded-ds-control`, `h-ds-control-md`, `px-ds-control-px-md`, `text-ds-control-md`, `font-ds-sans`). `font-medium` is kept (no control weight token).
4. **States:** hover/active per variant from `action.*` tokens; disabled uses `disabled.*` tokens instead of `opacity-50`.
5. **Focus:** upstream `focus-visible:ring-[3px] ring-ring/50` (arbitrary value, opacity) → `.ds-focus-ring` recipe (outline from `focus.ring*` tokens).
6. **Removed:** dark-mode classes, `aria-invalid` styles, `shadow-xs`, `has-[>svg]` padding tweaks, `[&_svg:not([class*='size-'])]:size-4`.
7. **`type`:** defaults to `"button"` when rendering a real `<button>`; not set under `asChild`.
8. **Props:** `function Button` → arrow const (D-035). `ref` typed via `ElementProps<"button">` (`StrictRef`, D-033/D-034). `className` merged last through `cn`, not passed into `cva`.
9. **Kept:** `asChild`, `data-slot="button"`, `data-variant`, `data-size`, exported `buttonVariants`.
10. **Import:** `cn` from `@/lib/utils` (upstream `@/lib/utils` in app, `cn` in registry JSON).
