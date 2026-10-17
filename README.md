# ui-design-system

A small, token-driven design system: **Text**, **Heading** and **Button** for React 19 and Tailwind CSS v4. One token source, two ways to consume it.

- Site: https://ui-design-system-beta.vercel.app/
- Storybook: https://ui-design-system-storybook-mu.vercel.app/
- npm package: [`@puranderdua/ui`](https://www.npmjs.com/package/@puranderdua/ui)
- shadcn registry (namespace `@puranderdua`): https://ui-design-system-registry.vercel.app (items at `/r/v0.1.0/{name}.json`)

## How it is built: four tiers

```text
1. Primitives   tokens/primitives/   DTCG JSON: raw scales (colour, type, size)
        ↓ alias
2. Semantics    tokens/semantic/     DTCG JSON: roles (text, primary, focus ring), alias primitives only
        ↓ build (Style Dictionary)
3. Styles       packages/ui/src/styles/   Tailwind v4 `@theme inline` bridge + type/focus recipes
        ↓ use
4. Components   packages/ui/src/components/   Text, Heading, Button (semantic tokens only)
```

Generated files (`**/generated/**`, `apps/registry/public/r/**`, `dist/**`) are never edited by hand. Change the source and rebuild.

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

```tsx
import { Button, Heading, Text } from "@puranderdua/ui";
```

Full usage notes: [`packages/ui/README.md`](packages/ui/README.md).

## Install via the shadcn registry

Add the registry to `components.json`:

```json
{
  "registries": {
    "@puranderdua": "https://ui-design-system-registry.vercel.app/r/v0.1.0/{name}.json"
  }
}
```

```bash
npx shadcn@4.22.0 add @puranderdua/ds-typography @puranderdua/ds-button
```

This copies the source into your project (and `ds-foundations`, `ds-utils`, `ds-types` as dependencies). Details: [`docs/registry.md`](docs/registry.md).

## Tailwind setup

Tailwind v4 only, configured through CSS (`@theme`); there is no `tailwind.config.js`. Components use static class names and semantic tokens, so Tailwind must scan the package (npm route) or your copied files (registry route). See [`docs/styling-rules.md`](docs/styling-rules.md).

## Develop

```bash
pnpm install
pnpm check                          # lint, tokens, types, tests, builds, registry, Storybook
pnpm --filter docs storybook        # Storybook on :6006
```

| Path            | What                                       |
| --------------- | ------------------------------------------ |
| `tokens/`       | DTCG source                                |
| `packages/ui/`  | the npm package                            |
| `apps/registry` | generated shadcn registry (Vercel)         |
| `apps/site`     | portfolio site (consumer of both routes)   |
| `apps/docs`     | Storybook                                  |
| `docs/`         | plan, progress, decisions, evidence, notes |

## Links

[Progress and retro](docs/PROGRESS.md) · [Decisions](docs/DECISIONS.md) · [Changelog](CHANGELOG.md) · [v0.1.0 release notes](docs/releases/v0.1.0.md) · [Clean-install evidence](docs/evidence/clean-install-2026-10-17.md)

MIT. Button is adapted from shadcn/ui (MIT); see [`docs/provenance/button.md`](docs/provenance/button.md).
