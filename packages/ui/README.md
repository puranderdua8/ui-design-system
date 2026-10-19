# @puranderdua/ui

Token-driven React components: `Text`, `Heading`, `Button`, `Link` and the layout set (`Container`, `Grid`, `Stack`, `Cluster`, `Section`, `Split`, `Sidebar`). React 19 and Tailwind CSS v4 only.

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
- `Link`: `variant` inline (always underlined) | standalone (underlined on hover and focus); `asChild` (for `next/link`); `external` adds `target="_blank"`, `rel="noopener noreferrer"`, an icon and a hidden "(opens in a new tab)".

Layout (0.3.0), all with a typed `as`:

- `Container`: `size` sm to xl | full; `gutter`.
- `Grid`: `cols` (responsive) or `minItemWidth` (auto-fit); `gap`.
- `Stack`: vertical flow with `gap`, `align`. `Cluster`: wrapping row with `gap`, `justify`, `align`.
- `Section`: `tone` canvas | subtle | inverse | brand; padding from tokens; optional inner `Container`.
- `Split`: two columns 1:1, 1:2 or 2:1; `reverse`; stacks below `md`.
- `Sidebar`: `sidebar` slot, `side`, `collapseBelow`.

Type a `ref` from the same element you pass to `as`, and prefer callback refs.

Icons come from `lucide-react` (a dependency). MIT. Button is adapted from shadcn/ui (MIT).
