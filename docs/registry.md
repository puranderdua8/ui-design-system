# Registry

The shadcn registry (namespace `@puranderdua`) is built from the same source as the npm package and hosted as static JSON on Vercel (project root `apps/registry`, output dir `public`).

## Items

| Item             | Type            | Contents                                                                           |
| ---------------- | --------------- | ---------------------------------------------------------------------------------- |
| `ds-foundations` | `registry:file` | `styles/ds-foundations.css` (byte-identical to `packages/ui/dist/foundations.css`) |
| `ds-types`       | `registry:lib`  | `lib/types.ts` (`StrictRef`, `ElementProps`; imported as `@/lib/types`)            |
| `ds-typography`  | `registry:ui`   | `text.tsx`, `heading.tsx`                                                          |
| `ds-button`      | `registry:ui`   | `button.tsx`                                                                       |

`ds-typography` and `ds-button` depend on shadcn's standard `utils` plus `ds-types` and `ds-foundations` (full versioned URLs). Component files keep `@/lib/utils` and `@/lib/types` imports, which the CLI rewrites to the consumer's aliases.

Known difference: the package's `cn` is extended for `ds-*` classes (D-029); shadcn's standard `utils` is not. Components still work, but a `className` override of a `ds-type-*` recipe or `text-ds-*` size is not deduplicated by the standard `cn`.

## Build

```bash
pnpm registry:build   # builds the package, then shadcn build -> apps/registry/public/r/v<version> and r/latest
pnpm registry:check   # parity: registry foundations == packages/ui/dist/foundations.css
```

- Version comes from `packages/ui/package.json`.
- `registry.json` is a template: `{{VERSION}}` and `{{REGISTRY_URL}}` are filled in at build time. Set the host with `REGISTRY_URL=https://<registry>.vercel.app pnpm registry:build` (default `https://puranderdua-registry.vercel.app`).
- `apps/registry/public/r/**` is generated and committed (Vercel deploys it as is). Never edit it by hand.

## Consumer setup

In `components.json`:

```json
{
  "registries": {
    "@puranderdua": "https://<registry>.vercel.app/r/v0.1.0/{name}.json"
  }
}
```

Install:

```bash
npx shadcn@latest add @puranderdua/ds-typography @puranderdua/ds-button
```

Then add the foundations import to `globals.css` after Tailwind:

```css
@import "tailwindcss";
@import "../styles/ds-foundations.css";
```

(Adjust the path to where `globals.css` sits.)

## Versioning and rollback

- Each release is immutable at `/r/v<version>/{name}.json` (cached for a year).
- `/r/latest/{name}.json` follows the newest build (short cache). Its `registryDependencies` point at the versioned URLs.
- Rollback: consumers pin the previous version in `components.json` (`.../r/v0.1.0/{name}.json`). Old version directories stay deployed, so nothing needs to be restored.
