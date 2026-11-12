# @puranderdua/ui

Token-driven React components: `Text`, `Heading`, `Button`, `Link` and the layout set (`Container`, `Grid`, `Stack`, `Cluster`, `Section`, `Split`, `Sidebar`) and the form set (`Label`, `Field`, `Fieldset`, `Input`, `Checkbox`, `RadioGroup`, `Select`) and the display set (`Card`, `Tabs`, `Banner`). React 19 and Tailwind CSS v4 only.

## Install

```bash
npm install @puranderdua/ui react react-dom tailwindcss
```

## Tailwind setup

Import Tailwind first, then the foundations (theme bridge and recipes, no token values), then exactly one theme (the token values), and tell Tailwind to scan the package so it generates the component classes. In your global CSS (adjust the `@source` path to where your CSS file lives):

```css
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@import "@puranderdua/ui/themes/base.css";
@source "../node_modules/@puranderdua/ui/dist";
```

The `@source` path is relative to the CSS file that contains it, and the package's location depends on your package manager's layout:

| Setup                                | `@source` (CSS file in `src/`)                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| npm, yarn classic, pnpm (single app) | `../node_modules/@puranderdua/ui/dist`                                                 |
| Monorepo, dependencies hoisted       | the path to the root `node_modules`, e.g. `../../../node_modules/@puranderdua/ui/dist` |
| Yarn Plug'n'Play (no `node_modules`) | use `nodeLinker: node-modules`; there is no folder to scan otherwise                   |
| Package in the same workspace        | `../../packages/ui/dist` (build it first)                                              |

You can also point `@source` at the whole package folder (`@source "../node_modules/@puranderdua/ui"`): it scans a little more but survives a change in the `dist` layout.

**Verify it worked.** Build your app and search the built CSS for a class only the package uses, for example `ds-focus-ring` or `text-ds-control-md`. If it is missing, the `@source` path points at the wrong folder (Tailwind does not warn about a path that matches nothing).

```bash
grep -l "ds-focus-ring" .next/static/css/*.css   # Next.js; use your build output folder
```

## Themes

| Theme  | Import                            | Status          |
| ------ | --------------------------------- | --------------- |
| `base` | `@puranderdua/ui/themes/base.css` | shipped (0.2.0) |

Corporate, Nature and Quirky are planned (0.6.0). Import exactly one theme CSS file; that is all a consumer ships.

**Live switching** (a theme switcher, Storybook, a playground): every theme also ships as `@puranderdua/ui/themes/<name>.json`, a fully resolved map `{ vars, refs }`. Apply `vars` as inline CSS custom properties on `<html>` (or a scope element) to switch themes without loading another stylesheet. `@puranderdua/ui/contrast-pairs.json` lists the WCAG pairs each theme must pass.

## Use

```tsx
import { Button, Heading, Text } from "@puranderdua/ui";

export const Hero = () => (
  <section>
    <Heading variant="h1">Hello</Heading>
    <Text variant="lead">A design system built from tokens.</Text>
    <Button variant="primary" size="md">
      Get started
    </Button>
  </section>
);
```

- `Text`: `variant` body | lead | caption | label; `as` p | span | div | label.
- `Heading`: `variant` display | h1 | h2 | h3; `as` h1 to h6.
- `Button`: `variant` primary | secondary; `size` sm | md; `asChild`; `type="button"` by default.
- `Link`: `variant` inline (always underlined) | standalone (underlined on hover and focus); `asChild` (for `next/link`); `external` adds `target="_blank"`, `rel="noopener noreferrer"`, an icon and a hidden hint, "(opens in a new tab)" by default; set `externalLabel` to translate it.

Layout (0.3.0), all with a typed `as`. `Grid`, `Stack` and `Cluster` add `role="list"` to a `ul` or `ol`:

- `Container`: `size` sm to xl | full; `gutter`.
- `Grid`: `cols` or `minItemWidth` (auto-fit); `gap`. Both follow the Grid's own width (container queries), not the viewport. A `cols` Grid renders a wrapper `div` (the `@container`) around the grid; `as`, `ref`, `role`, `className` and other props stay on the grid itself.
- `Stack`: vertical flow with `gap`, `align`. `Cluster`: wrapping row with `gap`, `justify`, `align`.
- `Section`: `tone` canvas | subtle | inverse | brand; padding from tokens; optional inner `Container`.
- `Split`: two columns 1:1, 1:2 or 2:1; stacks when its container is too narrow (not the viewport). Put padding on an inner element so the ratio stays exact.
- `Sidebar`: `sidebar` slot, `side`; the content wraps below the aside when it would be narrower than half the row. DOM order is visual order: for `side="end"` the content comes first and the aside after it (stacked, the aside is below). `sidebarProps` goes on the aside (`aria-label`, `id`); name each aside when a page has more than one.

Forms (0.4.0). The controls are client components; a Server Component page can still import them:

- `Field`: wraps one control with `label`, `description`, `error` and `required`; wires ids, `aria-describedby` and `aria-invalid` to the control inside it. `layout="inline"` puts the control first and the label beside it (a Checkbox).
- `Fieldset`: wraps a group of controls (`RadioGroup`, a list of checkboxes) in `<fieldset>` and `<legend>` with `description`, `error` and `required`. A `RadioGroup` takes its name, invalid and required state from it. Do not put a `RadioGroup` in a `Field` (it warns in development).
- `Label`: the label text style, with an optional required marker. `Input`: `size` sm | md; invalid and disabled states.
- `Checkbox`: checked, indeterminate, invalid, disabled. `RadioGroup` with `RadioGroupItem`: arrow keys move between items. Both keep a 16px visual with a pointer target of at least `control.target-min` (24px, WCAG 2.2 SC 2.5.8) through the `.ds-hit-area` recipe.
- `Select` with `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`: `SelectContent` takes a `container` so the list renders inside a themed scope.

**Field or Fieldset?** One control with one label: `Field`. A group of related controls (radio group, list of checkboxes) with one question: `Fieldset`.

Display (0.6.0):

- `Card`: `variant` outline | raised; `as` div, article, section, li, aside. Parts: `CardMedia`, `CardHeader`, `CardTitle` (a `Heading`; set `as` to fit the page outline), `CardDescription`, `CardContent`, `CardFooter`. A raised Card restores the base colour roles, so it is readable inside an inverse or brand `Section`.
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: arrow keys, Home/End, `activationMode` automatic | manual, `orientation`.
- `Banner`: full-screen hero. `height` screen | tall, `align` start | center, `tone` canvas | brand | inverse | gradient. `media` takes any `<img>` (object-cover) under a scrim (`scrim` strong | medium; the scrim is contrast-checked per theme over white). `video={{ src, poster, type?, pauseLabel?, playLabel? }}` plays muted and looped; with `prefers-reduced-motion` only the poster shows, and a pause/play button is always visible.

Theme scopes and portals (0.5.0):

- `ThemeScope` applies a theme's `vars` (or `theme={json}`) to a subtree and sets `data-ds-theme`. It is also the portal container: portal components render into `container ?? usePortalContainer()` (the nearest `ThemeScope`), falling back to `document.body`, so an open `Select` list keeps the scope's theme. An explicit `container` prop always wins.
- Stacking uses the shared layer scale (`--ds-layer-*`, `.ds-layer-*`: base, sticky, dropdown, overlay, modal, toast, tooltip, skip-link). Use these recipes, not raw `z-*`.
- `Section` tones (`.ds-tone-*`) re-map the colour roles in scope, so links, focus rings and controls stay readable on inverse and brand surfaces. Tones do not nest.

Type a `ref` from the same element you pass to `as`, and prefer callback refs.

Icons come from `lucide-react` (a dependency). MIT. Button is adapted from shadcn/ui (MIT).
