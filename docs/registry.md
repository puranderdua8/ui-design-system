# Registry

The shadcn registry (namespace `@puranderdua`) is built from the same source as the npm package and hosted as static JSON on Vercel (project root `apps/registry`, output dir `public`).

## Items

| Item             | Type            | Installs to                                                                        |
| ---------------- | --------------- | ---------------------------------------------------------------------------------- |
| `ds-foundations` | `registry:file` | `styles/ds-foundations.css` (byte-identical to `packages/ui/dist/foundations.css`) |
| `ds-types`       | `registry:lib`  | `lib/types.ts` (`StrictRef`, `ElementProps`; imported as `@/lib/types`)            |
| `ds-utils`       | `registry:lib`  | `lib/utils.ts` and `lib/generated/ds-classes.ts` (the extended `cn`)               |
| `ds-typography`  | `registry:ui`   | `components/ui/text.tsx`, `components/ui/heading.tsx`                              |
| `ds-button`      | `registry:ui`   | `components/ui/button.tsx`                                                         |

`ds-typography` and `ds-button` depend on `ds-utils`, `ds-types` and `ds-foundations` (full versioned URLs). Component files keep `@/lib/utils` and `@/lib/types` imports, which the CLI rewrites to the consumer's aliases. Install targets are explicit and flat (`components/ui/<file>`), otherwise the CLI keeps the long source path.

### Why `ds-utils` replaces shadcn's `utils`

The package's `cn` is extended for `ds-*` classes (D-029). With stock `tailwind-merge`, Button's `text-ds-primary-fg` and `text-ds-control-md` look like two text colours and the colour is dropped. So `ds-utils` installs our `cn` over `lib/utils.ts`; the CLI asks before overwriting an existing file. Existing shadcn components keep working because the export is still `cn`.

## Build

```bash
pnpm registry:build   # builds the package, then shadcn build -> apps/registry/public/r/v<version> and r/latest
pnpm registry:check   # every registry file is byte-identical to its source and has a flat target
```

- Version comes from `packages/ui/package.json`.
- `registry.json` is a template: `{{VERSION}}` and `{{REGISTRY_URL}}` are filled in at build time. The host comes from `registry.config.json` (or the `REGISTRY_URL` env var, which wins). The build fails if it is not an `https://host` URL.
- A version that is already built is not overwritten when the content would change, because `/r/v*` is served as immutable. Bump the version, or pass `--force` before it has been deployed: `node scripts/build-registry.mjs --force`.
- `apps/registry/public/r/**` is generated and committed (Vercel deploys it as is). Never edit it by hand. CI fails if the committed output differs from a fresh build.

## Consumer setup

`components.json` needs the usual aliases (`utils`, `ui`, `lib`) plus the registry:

```json
{
  "registries": {
    "@puranderdua": "https://<registry>.vercel.app/r/v0.1.0/{name}.json"
  }
}
```

Install (the repo is tested with shadcn 4.22.0):

```bash
npx shadcn@4.22.0 add @puranderdua/ds-typography @puranderdua/ds-button
```

Then add the foundations import to `globals.css` after Tailwind. With a `src/` directory the file lands in `src/styles/`:

```css
@import "tailwindcss";
@import "../styles/ds-foundations.css";
```

(Adjust the path to where `globals.css` sits.)

## Versioning and rollback

- Each release is immutable at `/r/v<version>/{name}.json` (cached for a year).
- `/r/latest/{name}.json` is an alias of the newest build (short cache). Its `registryDependencies` point at the versioned URLs.
- Rollback: consumers pin the previous version in `components.json` (`.../r/v0.1.0/{name}.json`). Old version directories stay deployed, so nothing needs to be restored.
