# Provenance: RadioGroup

- **Source:** shadcn/ui `new-york-v4` RadioGroup, `apps/v4/registry/new-york-v4/ui/radio-group.tsx` in https://github.com/shadcn-ui/ui (fetched from `https://ui.shadcn.com/r/styles/new-york-v4/radio-group.json`)
- **Upstream commit:** `c257f688cf4de7ec10cc1be84cad29cd4631182c` (last commit touching the file, 2026-09-04). Fetched from the public registry JSON, not through the CLI.
- **Fetched:** 2026-10-19
- **License:** MIT (shadcn/ui, © shadcn)
- **Our file:** `packages/ui/src/components/radio-group.tsx`

## Dependencies

| Package                  | Why                                                     |
| ------------------------ | ------------------------------------------------------- |
| `radix-ui`               | `RadioGroup` primitive from the unified package (D-049) |
| `lucide-react`           | `CircleIcon` for the selected dot                       |
| `clsx`, `tailwind-merge` | via our `cn` (`@/lib/utils`)                            |

## Changes from upstream

1. **Group gap:** `gap-3` → `gap-ds-gap-sm`.
2. **Item colours:** `border-input`, `text-primary`, `fill-primary` → `border-ds-border-control` (3:1), `bg-ds-input`, `text-ds-primary`; the dot uses `fill-current`; checked border `border-ds-primary`.
3. **Focus:** `outline-none focus-visible:ring-[3px] ring-ring/50` → `.ds-focus-ring` recipe.
4. **Disabled:** `opacity-50` → `disabled.*` tokens.
5. **Invalid:** `aria-invalid:border-destructive` + ring → `aria-invalid:border-ds-danger-border`.
6. **Removed:** `shadow-xs`, `transition-[color,box-shadow]`, all `dark:` classes.
7. **Added:** `ds-border`, `ds-transition`, hover border from `input.border-hover`.
8. **Indicator:** absolute `top-1/2 left-1/2 -translate-*` centring → `inline-flex items-center justify-center` on the item (no arbitrary or transform utilities).
9. **Icons:** `aria-hidden="true"` on the lucide icon.
10. **Field wiring:** `RadioGroup` reads `useFieldContext()` for `id`, `required`, `aria-invalid`, `aria-describedby` and `aria-labelledby` (the Field's label id, since a `<label for>` cannot name a `div`). Caller props win; describedby is merged. This added `labelId` to the Field context.
11. **Props:** `function` → arrow consts (D-035). Props typed with `ComponentPropsWithoutRef<typeof ...>` plus a `StrictRef` ref (`HTMLDivElement` for the group, `HTMLButtonElement` for items). `className` merged last through `cn`.
12. **Import:** `cn` from `@/lib/utils`.
13. **Kept:** `"use client"`, `data-slot` names (`radio-group`, `radio-group-item`, `radio-group-indicator`), `RadioGroup` and `RadioGroupItem` exports.
