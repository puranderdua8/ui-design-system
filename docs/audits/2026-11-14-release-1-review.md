# Release 1 review — 2026-11-14

An independent review of the whole repository after Release 1 (`@puranderdua/ui@0.8.0`, site with showcase, themes and playground), held to a **semver 1.0.0** bar for **outside consumers** on React 19 + Tailwind v4 (D-087). Review only: nothing is fixed here. The plan and the session prompts (R1–R6) are in [`docs/PLAN.md`](../PLAN.md#mr-release-1-review-100-readiness).

**How to use this register:** each R-session adds its findings with evidence. A suspicion goes under "Leads" until it is checked; R6 empties that list. After the maintainer approves the hardening milestone proposed at the end, its sessions set each row's status to `fixed in <session>` (or `accepted` with a D-number), as in the [2026-10-20 audit](2026-10-20-production-readiness.md).

- **Kind:** `defect` (wrong behaviour or a broken contract), `recommendation` (works, but falls short of 1.0.0 practice), `revisit` (challenges a recorded decision, with new evidence and the D-number).
- **Severity:** **Blocker** (no 1.0.0), **High** (fix before building more on it), **Med**, **Low**.
- **Areas:** A Architecture and design principles · B Component API design · C React · D State management (site) · E Next.js · F Performance · G Packaging and distribution · H Styling and tokens · I Dark-mode readiness · J Accessibility beyond axe · K Testing strategy · L Security and supply chain · M DX and docs · N Tooling, CI and process.
- **Reference:** how shadcn/ui, Radix Themes, Primer, Carbon or Spectrum handle the same thing, where it helps. Reference only, not a target.

## Baseline (R1)

Measured on 2026-11-14 at `7d3a3e4` (branch `review-r1` = `main` eab00af plus the review plan), macOS, Node 26.11, pnpm 11.22.

**Gates**

| Command                                | Result                           | Wall time | Counts                                                                                                                                         |
| -------------------------------------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                           | exit 0                           | 1:38      | `packages/ui` unit 226 (17 files), site unit 90 (3 files), layout 150 (Chromium, Firefox, WebKit), story tests 112 (22 files), Storybook build |
| `tokens:check` (inside `pnpm check`)   | pass                             | —         | 200 contrast pairs per theme × 4 themes, 9 tone × role exclusions, 6 tone recipes, second-theme self-test                                      |
| `pnpm --filter site test:e2e`          | exit 0                           | 2:18      | 312 passed, 3 skipped (WebKit video pause; clipboard in Firefox and WebKit), Chromium, Firefox, WebKit against `next start`                    |
| `pnpm check:rsc`                       | PASS                             | 0:39      | packed tarball in a fresh Next app                                                                                                             |
| `pnpm audit --prod --audit-level high` | "No known vulnerabilities found" | —         | —                                                                                                                                              |

**Package surface (`@puranderdua/ui@0.8.0`)**

- Public API from `src/index.ts`: **59 runtime exports** (21 components and their parts, 3 hooks `useFieldContext`, `useFieldsetContext`, `usePortalContainer`, `cn`, 14 style exports) and **71 type exports**. Style exports use two names: `*Variants` (text, heading, button, link, input, selectTrigger, card, banner) and `*Classes` (checkbox, radioGroupItem, tabs ×4).
- Tarball 70.8 KB. `dist/index.d.ts` 25.1 KB (one file for the whole API). `foundations.css` 18.6 KB; each `themes/<name>.css` about 21 KB and `themes/<name>.json` about 20.5 KB.
- Own code per component file is small: 0.36–1.6 KB gzip (largest `select.js` 5.7 KB raw / 1.6 KB gzip); three shared chunks (`cn` + `tailwind-merge` config 0.7 KB gzip, jsx-runtime shim, layout map).

**Consumer bundle cost** (esbuild 0.25, tarball installed with npm into a scratch app, React external, minified):

| Entry imports           | Min      | Gzip    | Largest inputs                                                              |
| ----------------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `Text`                  | 30.9 KB  | 9.8 KB  | `tailwind-merge` 28.3 KB, `cn` chunk 1.2 KB, cva 0.6 KB, `text.js` 0.3 KB   |
| `Button`                | 35.0 KB  | 11.4 KB | `tailwind-merge` 28.3 KB, `@radix-ui/react-slot` 2.8 KB, `button.js` 1.1 KB |
| `Select` (5 parts)      | 132.9 KB | 44.5 KB | Radix Select with floating-ui and remove-scroll                             |
| everything (`export *`) | 169.5 KB | 54.8 KB | —                                                                           |

Tree-shaking works: a `Button`-only import pulls in no other component, no `lucide-react` and no Radix besides Slot.

**Site (production, https://ui-design-system-beta.vercel.app, Lighthouse 12, Chrome headless)**

| Page                  | Form factor | Perf | A11y | BP  | SEO | FCP   | LCP   | TBT   | CLS | JS (transfer) | Total   |
| --------------------- | ----------- | ---- | ---- | --- | --- | ----- | ----- | ----- | --- | ------------- | ------- |
| `/`                   | mobile      | 98   | 100  | 100 | 100 | 0.9 s | 2.3 s | 20 ms | 0   | 236 KB        | 315 KB  |
| `/`                   | desktop     | 100  | 100  | 100 | 100 | 0.3 s | 0.5 s | 0 ms  | 0   | 236 KB        | 315 KB  |
| `/components/display` | mobile      | 100  | 100  | 100 | 100 | 1.0 s | 1.3 s | 60 ms | 0   | 242 KB        | 1430 KB |
| `/components/display` | desktop     | 100  | 100  | 100 | 100 | 0.3 s | 0.3 s | 0 ms  | 0   | 243 KB        | 1430 KB |
| `/playground`         | mobile      | 100  | 100  | 100 | 100 | 1.0 s | 1.2 s | 20 ms | 0   | 236 KB        | 326 KB  |
| `/playground`         | desktop     | 100  | 100  | 100 | 100 | 0.3 s | 0.5 s | 0 ms  | 0   | 236 KB        | 326 KB  |

Audits below 0.9 on every page: `unused-javascript` (48–80 KiB), `legacy-javascript` (14 KiB). `/playground`: `dom-size` 1,573 elements. `/components/display`: 1.1 MB media (the Banner video).

## Findings

| ID  | Area | Kind           | Sev | Finding                                                                                                                                                                                                                                                | Evidence                                                                                                                                                                                                                                                                                                  | Reference                                                                                                         | Proposed fix                                                                                                                                                                                                                                      | Status |
| --- | ---- | -------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R01 | F    | recommendation | Med | Every site page ships about 236 KB of JavaScript (compressed transfer), 48–80 KiB of it unused on load, although the home page and the showcase are static. The same figure on `/` and `/playground` suggests a shared client root.                    | Lighthouse 12 on production (Baseline table): JS transfer 236 KB on `/` and `/playground`, 242 KB on `/components/display`; `unused-javascript` est. savings 80 KiB on `/`, 79 KiB on Display, 48 KiB on the playground.                                                                                  | Next.js production checklist: keep client components at the leaves; check what each route ships.                  | R4 attributes the bytes per route (`next build` output, a bundle analysis) and names the client modules on the shared path (header `ThemeSwitcher` with Radix Select is the first suspect); then move or lazy-load what static pages do not need. | open   |
| R02 | G    | recommendation | Low | `cn()` costs about 9 KB gzip in every client bundle that uses any component: `tailwind-merge` is 28.3 of the 30.9 KB minified for a `Text`-only import.                                                                                                | Consumer bundle table (Baseline): `Text` 30.9 KB min / 9.8 KB gzip, of which `tailwind-merge` 28.3 KB.                                                                                                                                                                                                    | shadcn/ui pays the same cost (`cn` = `twMerge(clsx())`); Radix Themes and Primer do not merge classes at runtime. | No change needed for 1.0.0, but document the cost in the package README. Revisit (D-029) only if R2 finds that merging is not needed on most components (for example, merge only where a consumer `className` can conflict).                      | open   |
| R03 | N    | defect         | Low | `packages/ui/tsup.config.ts`, which holds the `components-as-externals` esbuild plugin that keeps `"use client"` working (D-065), is not type-checked, and its `import type { Plugin } from "esbuild"` names a package `packages/ui` does not declare. | `packages/ui/tsconfig.json` `include` lists `src`, `playground`, `test`, `vitest.config.ts`, `e2e/…`, not `tsup.config.ts`; `packages/ui/node_modules` has no `esbuild` (only tsup's `.bin` link); knip: "Unlisted dependencies: packages/ui/tsup.config.ts: esbuild".                                    | —                                                                                                                 | Add `tsup.config.ts` to `include` (or a small `tsconfig.node.json`), and declare `esbuild` as a devDependency pinned to tsup's version, or take the type from tsup (`Options["esbuildPlugins"]`).                                                 | open   |
| R04 | A    | defect         | Low | Dead code in the site: `apps/site/src/playground/index.ts` (a barrel) is imported by nothing, and several exports are used only inside their own module.                                                                                               | knip 5 (no config): unused file `apps/site/src/playground/index.ts`; unused exports `formatShadow`, `applyKnobs` (`engine.ts`), `contrastRatio` (`contrast.ts`), `themeFontVars`, `withFonts`, `storageKey` (`lib/theme.ts`), plus 12 unused exported types. Checked by grep: `index.ts` has no importer. | —                                                                                                                 | Delete the barrel; un-export module-private helpers. See R05 for keeping it that way.                                                                                                                                                             | open   |
| R05 | N    | recommendation | Low | Nothing catches unused files, exports or dependencies, so R04-type drift can return.                                                                                                                                                                   | knip with no config reports 20 "unused files", 18 of them false positives (CSS read by scripts, Node scripts run by `check-tokens`, Vite fixtures, the `.claude` hook), and 1 false unused devDependency (`@tailwindcss/turbopack`, used as a string in `next.config.ts`).                                | —                                                                                                                 | Add a `knip.json` with the real entry points (scripts, fixtures, CSS, Turbopack loader), get it to zero, and run it in `pnpm check`. Needs a dev dependency (ask first).                                                                          | open   |

## Leads (to check)

Suspicions noted while planning; each becomes a finding or is dismissed with a reason.

- G: `dts` is built from `src/index.ts` only; check what that means for consumers and subpath imports.
- G: one barrel (`index.ts`) plus per-component entries and no component subpath exports; check what a single `Button` import pulls in.
- C: `ThemeScope` provides `null` as the portal container on its first render (element held in state, set by the ref).
- D: the playground store (`apps/site/src/playground/store.ts`) has no cross-tab sync and no version on the stored shape.
- N: `docs/DECISIONS.md` is about 308 KB in 92 lines (table cells padded to the widest row).
- N: `docs/PLAN.md` Goal 2 and the M11 row still say 0.7.0; the package is 0.8.0 (D-086).
- N/E: Git deployments are off (D-057); production once ran a 24-day-old build (H10).
- B (from R1): style exports use two naming schemes, `*Variants` and `*Classes` (Baseline); check for 1.0.0.
- F (from R1): `/components/display` transfers the whole 1.1 MB Banner video on load. `banner-video.tsx` sets `preload="metadata"` but the client part plays on mount, so it downloads even below the fold.
- F (from R1): Lighthouse `legacy-javascript` (14 KiB) on every page; find which module ships the transforms or polyfills.
- F (from R1): `/playground` has 1,573 DOM elements (Lighthouse `dom-size`); check whether the folded panels render their content anyway.

## Probe notes (R1)

- **madge 8 `--circular`**: no cycles in `packages/ui/src` (53 files) or `apps/site/src` (71 files). Its warnings are skipped external modules.
- **publint 0.3.25 `--strict`** on the tarball: "All good!".
- **arethetypeswrong 0.18** on the tarball: `.` is green for `node10`, `node16` (ESM) and `bundler`. From CJS under `node16` it is "ESM (dynamic import only)". That is the intended ESM-only build (D-037), and Node ≥ 22 can `require()` it anyway, so it is not a finding. R3 decides whether 1.0.0 should state ESM-only in the README. "Resolution failed" on `./foundations.css` and the wildcards are expected: attw checks types, and CSS and JSON subpaths have none.
- **knip 5 (no config)**: apart from R03–R05, the reported "unused files" are scripts started by other scripts, CSS read by the build, Vite fixtures and the `.claude` hook. `@tailwindcss/vite`, `@vitejs/plugin-react` and `tailwindcss` in `packages/ui` are used by the playground and fixture configs. The unused exported types in the site are part of R04.
- **Lighthouse**: one run per page and form factor from a laptop, so the timings vary between runs. Accessibility, Best Practices and SEO are 100 everywhere. `render-blocking-insight` points at the one CSS file (est. 130–140 ms on mobile), which is normal for a single stylesheet.
- **`pnpm audit`**: clean. `pnpm dlx` downloaded the probe tools into its own cache. Nothing was added to any `package.json` or the lockfile.

## Scorecard (R6)

_One line per area: rating, the main strengths, the main gaps._

## Proposed hardening milestone (R6)

_Sessions with prompts, for the maintainer to approve._
