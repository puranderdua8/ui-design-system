# @puranderdua/ui

Token-driven React components: `Text`, `Heading`, `Button`. React 19 and Tailwind CSS v4 only.

## Install

```bash
npm install @puranderdua/ui react react-dom tailwindcss
```

## Tailwind setup

Import Tailwind first, then the foundations (tokens, theme bridge, recipes), and tell Tailwind to scan the package so it generates the component classes. In your global CSS (adjust the `@source` path to where your CSS file lives):

```css
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@source "../node_modules/@puranderdua/ui/dist";
```

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

Type a `ref` from the same element you pass to `as`, and prefer callback refs.

MIT. Button is adapted from shadcn/ui (MIT).
