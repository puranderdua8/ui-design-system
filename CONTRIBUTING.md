# Contributing to `@puranderdua/ui`

This repository builds one npm package, [`@puranderdua/ui`](packages/ui): React components, a Tailwind v4 bridge and four themes, all generated from design tokens. Read this page before opening a pull request. (`CLAUDE.md` holds the same rules in a form written for AI sessions.)

## Set up

You need Node 22 or newer and pnpm 11 (`corepack enable` picks up the version in `package.json`).

```bash
pnpm install
pnpm check          # lint, knip, tokens, typecheck, tests, build, Storybook (what CI runs)
```

| Command                                     | What it does                                                          |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm tokens:build`                         | Token sources (DTCG JSON) → generated CSS and JSON per theme          |
| `pnpm tokens:check`                         | Aliases, completeness per theme, deterministic output, WCAG contrast  |
| `pnpm --filter @puranderdua/ui test`        | Unit and accessibility tests (jsdom)                                  |
| `pnpm --filter @puranderdua/ui test:layout` | Rendered layout and environment tests (Chromium, Firefox, WebKit)     |
| `pnpm --filter docs storybook`              | Storybook on :6006 (props tables and usage notes on each Docs page)   |
| `pnpm --filter docs test:stories`           | Every story as a browser test; axe violations fail                    |
| `pnpm --filter site test:e2e`               | Playwright and axe against the site (`SITE_URL=<url>` tests a deploy) |
| `pnpm check:rsc`                            | Packs the tarball into a fresh Next app to check the RSC boundary     |

Playwright needs its browsers once: `pnpm exec playwright install chromium firefox webkit`.

## How the repo is organised

Four tiers, one source of truth: **primitives** (DTCG JSON in `tokens/themes/<theme>/`), **semantics** (the role contract in `tokens/semantic/`, aliases only), **styles** (the Tailwind bridge and recipes in `packages/ui/src/styles/theme.css`) and **components** (`packages/ui/src/components/`). `apps/site` is the consumer (showcase and playground) and installs the package from npm at a pinned version. `apps/docs` is Storybook. Never edit generated files (`**/generated/**`, `dist/**`); change the source and rebuild.

## Rules a change must follow

- **Tokens, not values.** Components use semantic tokens only, through the Tailwind bridge (`bg-ds-*`, `text-ds-*`). No arbitrary values (`text-[17px]`), no primitives, no dynamic class names (`text-${size}`): use static variant maps. A new themeable token needs a default alias to an existing token (D-095), so custom themes keep working.
- **Themes live only in tokens.** A component never branches on the theme. Every themeable token exists in every theme (`tokens:check` enforces it).
- **React 19 only.** `ref` is a plain prop (no `forwardRef`); type a ref from the element you pass to `as`. Components are arrow-function consts.
- **Client files export components only.** A `"use client"` file exports components; variants and class strings go in a `<name>.styles.ts` (`check-client-exports`).
- **Radix and icons.** Radix comes from the individual `@radix-ui/react-*` packages (never the `radix-ui` umbrella); icons from `lucide-react`. Interactive components are adapted from shadcn new-york-v4, with a provenance note in `docs/provenance/`.
- **Overlays** render through `<ScopedPortal>`, never into a scope element, and use the layer tokens (`.ds-layer-*`), never raw `z-*`.
- **Layout follows the container, not the viewport**, and DOM order is visual order (no `order-*` or `*-reverse`).
- **Accessibility.** Interactive targets are at least 24px (`.ds-hit-area`). Every user-visible string in a component is a prop with an English default. A single control goes in a `Field`, a group in a `Fieldset`. New colour roles join the contrast matrix for every tone.
- **Strings and warnings.** A misuse that TypeScript cannot catch gets a development-only warning through `warnOnce` in `packages/ui/src/lib/deprecate.ts`: once per key, silent in production, with a test.

## Adding or changing a component

1. Read the nearest existing component and its tests; follow the same shape.
2. Put the component in `packages/ui/src/components/`, export it (and its `*Props` and variant types) from `src/index.ts`, and add the tests: behaviour and keyboard in `*.test.tsx`, layout and environments (RTL, forced colours, print) in `packages/ui/e2e`.
3. Add a story with `docs.description.component` (a **Usage** and an **Accessibility** paragraph); Storybook builds the props table from the types.
4. If it is interactive, add a provenance file and keep the client boundary (`pnpm check:rsc`).
5. Add a CHANGELOG entry. Follow [`docs/versioning.md`](docs/versioning.md): it says what is public and what counts as breaking, and how a name is deprecated (one release of overlap with a warning, removed in the next major).

## Pull requests

- One task per PR; run `pnpm check` and say what you ran. A known problem you cannot fix in scope goes into the open audit register (`docs/audits/`) or the parking lot in `docs/PROGRESS.md`, not into silence.
- Record a decision that changes how the system works in `docs/DECISIONS.md` (a new D-number).
- Commit messages are `<session>: <summary>`; the maintainer merges. Releases publish only from the `release.yml` workflow when the maintainer pushes a `v*` tag and approves the `npm-publish` deployment ([`docs/releasing.md`](docs/releasing.md)).

## Reporting a problem

Open an issue with the version, a minimal reproduction (a Storybook story or a sandbox), what you expected and what happened. For an accessibility problem, name the assistive technology and browser.
