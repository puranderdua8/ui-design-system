# ui-design-system

A small, token-driven design system: **Text**, **Heading**, **Button**, **Link** and layout components (**Container**, **Grid**, **Stack**, **Cluster**, **Section**, **Split**, **Sidebar**) and form components (**Label**, **Field**, **Fieldset**, **Input**, **Checkbox**, **RadioGroup**, **Select**) and display components (**Card**, **Tabs**, **Banner**) for React 19 and Tailwind CSS v4, distributed as one npm package. Release 1 is in progress (see [Roadmap](#roadmap)).

- Site: https://ui-design-system-beta.vercel.app/
- Storybook: https://ui-design-system-storybook-mu.vercel.app/
- npm package: [`@puranderdua/ui`](https://www.npmjs.com/package/@puranderdua/ui)

## How it is built: four tiers

```text
1. Primitives   tokens/primitives/   DTCG JSON: raw scales (colour, type, size)
        ↓ alias
2. Semantics    tokens/semantic/     DTCG JSON: roles (text, primary, focus ring), alias primitives only
        ↓ build (Style Dictionary)
3. Styles       packages/ui/src/styles/   Tailwind v4 `@theme inline` bridge + type/focus recipes
        ↓ use
4. Components   packages/ui/src/components/   Text, Heading, Button, Link, layout, forms (semantic tokens only)
```

Generated files (`**/generated/**`, `dist/**`) are never edited by hand. Change the source and rebuild.

## Install via npm

```bash
npm install @puranderdua/ui react react-dom tailwindcss
```

In your global CSS (adjust the `@source` path to where the file lives):

```css
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@source "../node_modules/@puranderdua/ui/dist";
```

Other layouts (monorepo, hoisted dependencies) and how to verify the path against your built CSS are in the package README.

```tsx
import { Button, Heading, Text } from "@puranderdua/ui";
```

Full usage notes: [`packages/ui/README.md`](packages/ui/README.md).

From 0.2.0, `foundations.css` carries no token values: you also import one theme, e.g. `@import "@puranderdua/ui/themes/base.css";` (D-056).

## Tailwind setup

Tailwind v4 only, configured through CSS (`@theme`); there is no `tailwind.config.js`. Components use static class names and semantic tokens, so Tailwind must scan the package (`@source`). See [`docs/styling-rules.md`](docs/styling-rules.md).

## Roadmap

Release 1 ([plan](docs/PLAN.md)):

1. A single npm channel.
2. A component showcase by category on the site: Typography, Layout, Forms, Actions, Display.
3. Three themes (Corporate, Nature, Quirky) alongside the default Base. A consumer ships one theme.
4. A theme playground with live preview and DTCG/CSS export.

Releases go out as npm minors 0.2.0 → 0.8.0; 0.7.0 adds the Corporate, Nature and Quirky themes and 0.8.0 adds the accent colour role (see [CHANGELOG](CHANGELOG.md)).

## Develop

```bash
pnpm install
pnpm check                          # lint, tokens, types, tests, builds, Storybook
pnpm --filter docs storybook        # Storybook on :6006
```

| Path           | What                                       |
| -------------- | ------------------------------------------ |
| `tokens/`      | DTCG source                                |
| `packages/ui/` | the npm package                            |
| `apps/site`    | portfolio site, showcase and playground    |
| `apps/docs`    | Storybook                                  |
| `docs/`        | plan, progress, decisions, evidence, notes |

## Links

[Plan](docs/PLAN.md) · [Progress and retro](docs/PROGRESS.md) · [Decisions](docs/DECISIONS.md) · [Changelog](CHANGELOG.md) · [v0.1.0 release notes](docs/releases/v0.1.0.md) · [Clean-install evidence](docs/evidence/clean-install-2026-10-17.md)

MIT. Button is adapted from shadcn/ui (MIT); see [`docs/provenance/button.md`](docs/provenance/button.md).
