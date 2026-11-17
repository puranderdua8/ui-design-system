# Provenance: ToggleGroup

- **Source:** shadcn/ui `new-york-v4` Toggle Group (`registry/new-york-v4/ui/toggle-group.tsx`) in https://github.com/shadcn-ui/ui, built on `@radix-ui/react-toggle-group`. We did not copy its `toggle.tsx` variants; the item carries its own classes.
- **Upstream commit:** not recorded; the registry JSON carries no commit. Re-check with `pnpm upstream:diff` before a release.
- **Fetched:** 2026-11-17 (structure only; the file was adapted, not pasted)
- **License:** MIT (shadcn/ui, © shadcn)
- **Our files:** `packages/ui/src/components/toggle-group.tsx`, `toggle-group.styles.ts`

## Dependencies

| Package                        | Why                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `@radix-ui/react-toggle-group` | `ToggleGroup` primitive from the individual package (D-093; pre-approved in S42) |
| `clsx`, `tailwind-merge`       | via our `cn` (`@/lib/utils`)                                                     |

## Changes from upstream

1. **Colours:** `bg-accent text-accent-foreground` pressed state → `bg-ds-primary text-ds-primary-fg` with `border-ds-primary`; resting `bg-ds-input` with `border-ds-border-control`.
2. **Not colour alone:** a pressed item also gets the strong border width through the `.ds-border-selected` recipe (now also matches `data-state="on"`) and, in forced colours, an outline.
3. **Focus:** `focus-visible:ring-*` → `.ds-focus-ring`. Disabled: `opacity-50` → `disabled.*` tokens.
4. **Removed:** the `variant` and `size` context and the shared `toggleVariants`; the group is one look, one size (`min-h-ds-control-md`, at least 24px). Items sit apart with a gap instead of joined borders.
5. **Props:** `function` → arrow const (D-035); `ref` is a plain prop (D-034); class strings in a plain `toggle-group.styles.ts` (D-070).
6. **Kept:** `"use client"`, `data-slot` names (`toggle-group`, `toggle-group-item`). Arrow-key navigation comes from Radix.
