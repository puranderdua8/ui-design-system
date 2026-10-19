# Provenance: Checkbox

- **Source:** shadcn/ui `new-york-v4` Checkbox, `apps/v4/registry/new-york-v4/ui/checkbox.tsx` in https://github.com/shadcn-ui/ui (fetched from `https://ui.shadcn.com/r/styles/new-york-v4/checkbox.json`)
- **Upstream commit:** `c257f688cf4de7ec10cc1be84cad29cd4631182c` (last commit touching the file, 2026-09-04). Fetched from the public registry JSON, not through the CLI.
- **Fetched:** 2026-10-19
- **License:** MIT (shadcn/ui, © shadcn)
- **Our file:** `packages/ui/src/components/checkbox.tsx`

## Dependencies

| Package                  | Why                                                   |
| ------------------------ | ----------------------------------------------------- |
| `radix-ui`               | `Checkbox` primitive from the unified package (D-049) |
| `lucide-react`           | `CheckIcon`, `MinusIcon` (indeterminate)              |
| `clsx`, `tailwind-merge` | via our `cn` (`@/lib/utils`)                          |

## Changes from upstream

1. **Colours:** `border-input`, `bg-primary`, `text-primary-foreground`, `border-primary` → `border-ds-border-control` (3:1 control boundary), `bg-ds-input`, `bg-ds-primary`, `text-ds-primary-fg`, `border-ds-primary`.
2. **Radius:** `rounded-[4px]` (arbitrary) → `rounded-ds-control`.
3. **Focus:** `outline-none focus-visible:ring-[3px] ring-ring/50` → `.ds-focus-ring` recipe (outline from `focus.ring*`).
4. **Disabled:** `opacity-50` → `disabled.*` tokens (`border-ds-disabled-border`, `bg-ds-disabled`, `text-ds-disabled-fg`).
5. **Invalid:** `aria-invalid:border-destructive` + ring → `aria-invalid:border-ds-danger-border`.
6. **Removed:** `shadow-xs`, `transition-shadow`, all `dark:` classes.
7. **Added:** `ds-border`, `ds-transition` (reduced motion), hover border from `input.border-hover`, an `indeterminate` state (fill and `MinusIcon`), `inline-flex` centring instead of the indicator's `grid place-content-center`.
8. **Icons:** `aria-hidden="true"` on the lucide icons.
9. **Field wiring:** reads `useFieldContext()` for `id`, `required`, `aria-invalid` and `aria-describedby` (caller props win; describedby is merged).
10. **Props:** `function Checkbox` → arrow const (D-035). Props typed with `ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>` plus a `StrictRef<HTMLButtonElement>` ref. `className` merged last through `cn`.
11. **Import:** `cn` from `@/lib/utils` (registry JSON used `cn`).
12. **Kept:** `"use client"`, `data-slot="checkbox"`, `data-slot="checkbox-indicator"`.
