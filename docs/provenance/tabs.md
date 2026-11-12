# Provenance: Tabs

- **Source:** shadcn/ui `new-york-v4` Tabs, `apps/v4/registry/new-york-v4/ui/tabs.tsx` in https://github.com/shadcn-ui/ui (read from the `main` branch with `gh api` on 2026-11-12)
- **Upstream commit:** `c257f688cf4de7ec10cc1be84cad29cd4631182c` (last commit that touched the file, 2026-09-04); the same tree as Button, Checkbox, RadioGroup and Select.
- **Fetched:** 2026-11-12
- **License:** MIT (shadcn/ui, © shadcn)
- **Our files:** `packages/ui/src/components/tabs.tsx` (components) and `tabs.styles.ts` (class strings, so Server Components can import them without crossing the client boundary, D-070)

## Dependencies

| Package                  | Why                                       |
| ------------------------ | ----------------------------------------- |
| `radix-ui`               | `Tabs` primitive from the unified package |
| `clsx`, `tailwind-merge` | via our `cn` (`@/lib/utils`)              |

## Changes from upstream

1. **One look: underline tabs.** Upstream has `tabsListVariants` with `default` (a filled `bg-muted` pill list, active trigger on `bg-background`) and `line`. Only the underline look is kept and `tabsListVariants` is not exported. Why: every colour it uses is a role a surface tone re-maps (`text`, `text-muted`, `border-control`, focus ring), so the tabs read on canvas, subtle, raised, inverse and brand surfaces with no prop. A filled list would need a surface of its own that tones do not nest into (D-074, D-080). Tests and the layout suite check labels, marker and focus ring on a light and a dark tone.
2. **Colours:** `text-muted-foreground`, `text-foreground/60`, `hover:text-foreground`, `data-[state=active]:text-foreground` → `text-ds-text-muted`, `hover:text-ds-text`, `data-[state=active]:text-ds-text`. The `after` marker `bg-foreground` → `bg-ds-border-control` (3:1 on every tone). The list border `border-ds-border`. All `dark:*` classes removed (dark mode is Release 2, D-047).
3. **Focus:** `focus-visible:border-ring ring-[3px] ring-ring/50 outline-1 outline-ring` → the `.ds-focus-ring` recipe, on triggers and on the panel (Radix gives a panel without focusable content `tabindex="0"`, so it needs a visible ring too).
4. **Size:** `h-9` list height, `h-[calc(100%-1px)]` trigger, `px-2 py-1`, `text-sm` → `min-h-ds-control-sm` (32px, at least the 24px target size, D-076), `px-ds-control-px-md`, `text-ds-control-md`. `rounded-lg`/`rounded-md` → `rounded-ds-control`. `font-ds-body` added.
5. **Disabled:** `disabled:opacity-50` → `disabled:text-ds-disabled-fg`.
6. **Layout:** `gap-2` → `gap-ds-gap-sm` (root) and `gap-ds-gap-xs` (list); `p-[3px]` and `after:bottom-[-5px]` (arbitrary values) → no list padding and `after:-bottom-px`; `after:-right-1` → logical `after:-end-px` and `border-e` for the vertical list. The horizontal list scrolls (`overflow-x-auto`) instead of overflowing a narrow container.
7. **Motion:** `transition-all` / `transition-opacity` → `.ds-transition` (reduced motion) plus `after:transition-opacity`.
8. **Props:** `function X` → arrow consts (D-035). Props typed with `ComponentPropsWithoutRef<typeof Primitive>` plus a `StrictRef` ref (`HTMLDivElement` for root, list and panel, `HTMLButtonElement` for a trigger); `className` merged last through `cn`. `activationMode`, `value`, `defaultValue`, `onValueChange`, `orientation` and `dir` pass straight through to Radix.
9. **Import:** `cn` from `@/lib/utils`; `class-variance-authority` is no longer needed here.
10. **Kept:** `"use client"`, `orientation` mirrored to `data-orientation` on the root, every `data-slot`, the `[&_svg]` rules.
