# Provenance: Select

- **Source:** shadcn/ui `new-york-v4` Select, `apps/v4/registry/new-york-v4/ui/select.tsx` in https://github.com/shadcn-ui/ui (fetched from `https://ui.shadcn.com/r/styles/new-york-v4/select.json`)
- **Upstream commit:** not looked up for this file; fetched from the public registry JSON, not through the CLI. Same upstream tree as Button, Checkbox and RadioGroup (`c257f68`).
- **Fetched:** 2026-10-20
- **License:** MIT (shadcn/ui, © shadcn)
- **Our file:** `packages/ui/src/components/select.tsx`

## Dependencies

| Package                    | Why                                                 |
| -------------------------- | --------------------------------------------------- |
| `radix-ui`                 | `Select` primitive from the unified package (D-049) |
| `lucide-react`             | `CheckIcon`, `ChevronDownIcon`, `ChevronUpIcon`     |
| `class-variance-authority` | trigger `size` variants (as `Input`)                |
| `clsx`, `tailwind-merge`   | via our `cn` (`@/lib/utils`)                        |

## Changes from upstream

1. **Trigger colours and shape:** `border-input`, `bg-transparent`, `dark:*`, `rounded-md`, `shadow-xs` → the same classes as `Input`: `ds-border`, `border-ds-input-border`, hover `border-ds-input-border-hover`, `bg-ds-input`, `text-ds-text`, `rounded-ds-control`. Placeholder: `data-[placeholder]:text-muted-foreground` → `text-ds-placeholder`.
2. **Sizes:** `size: "sm" | "default"` (`h-8` / `h-9`) → `sm | md` via cva from the control tokens (`h-ds-control-*`, `px-ds-control-px-*`, `text-ds-control-*`). `w-fit` → `w-full`.
3. **Focus:** `outline-none focus-visible:ring-[3px] ring-ring/50` → `.ds-focus-ring` recipe.
4. **Disabled:** `opacity-50` → `disabled.*` tokens (trigger) and `data-[disabled]:text-ds-disabled-fg` (item).
5. **Invalid:** `aria-invalid:border-destructive ring-destructive/20` → `aria-invalid:border-ds-danger-border`.
6. **Content:** `bg-popover text-popover-foreground border shadow-md rounded-md` → `bg-ds-surface-raised text-ds-text ds-border border-ds-border shadow-ds-overlay rounded-ds-control`. `min-w-[8rem]` (arbitrary) → `min-w-32`.
7. **Position:** default `position` changed from `item-aligned` to `popper` (list sits below the trigger and matches its width; `item-aligned` overlays the trigger and needs layout APIs jsdom lacks). Both are still accepted.
8. **Animation:** removed the `animate-in/out`, `fade`, `zoom`, `slide-in` classes (they come from `tw-animate-css`, which this package does not ship).
9. **Item:** `focus:bg-accent focus:text-accent-foreground` → `focus:bg-ds-surface-subtle focus:text-ds-text` (pair listed in `contrast-pairs.json`); `rounded-sm` → `rounded-ds-control`; `right-2`/`pr-8`/`pl-2` → logical `end-2`/`pe-8`/`ps-2`; `text-sm` → `text-ds-control-md`.
10. **Label and separator:** `text-muted-foreground` → `text-ds-text-muted`; `bg-border` → `bg-ds-border`; `text-xs` → `text-ds-control-sm`.
11. **Icons:** `opacity-50` / `text-muted-foreground` on icons → `text-ds-text-muted`; `aria-hidden="true"` on every lucide icon.
12. **Added `container`:** `SelectContent` takes `container` and passes it to `SelectPrimitive.Portal`, so the list can render inside a themed scope (CLAUDE.md, portal components).
13. **Field wiring:** `Select` reads `useFieldContext()` for `required`; `SelectTrigger` for `id`, `aria-invalid` and `aria-describedby` (caller props win, describedby is merged). The Field's `<label for>` therefore names the trigger.
14. **Props:** `function X` → arrow consts (D-035). Props typed with `ComponentPropsWithoutRef<typeof Primitive>` plus a `StrictRef` ref; `className` merged last through `cn`. `SelectScrollUpButton`/`SelectScrollDownButton` share `SelectScrollButtonProps`.
15. **Import:** `cn` from `@/lib/utils`.
16. **Kept:** `"use client"`, all `data-slot` attributes, the `[&_svg]:pointer-events-none [&_svg]:shrink-0` and `line-clamp-1` value rules.
