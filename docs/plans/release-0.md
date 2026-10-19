# Release 0 plan: Task → Milestone → Goal

> **Archived (done, v0.1.0 tagged 2026-10-17).** Kept for history. The current plan is [`../PLAN.md`](../PLAN.md). Release 1 retires the shadcn registry described here (D-055) and moves token values out of `foundations.css` into per-theme files (D-056).

Source: _Design System Single-Repo Multi-Agent Blueprint v6_, adapted. The multi-agent infrastructure (B0, sections 13–19) is dropped; Purander builds with Claude Code in short sessions. See `DECISIONS.md`.

## Goal (Release 0, done when all are true)

1. `@puranderdua/ui@0.1.0` is on npm with typed Text, Heading, Button and `foundations.css`.
2. The registry is live on Vercel: `ds-foundations`, `ds-typography`, `ds-button` at `/r/v0.1.0/`.
3. The portfolio site is live on Vercel. Text/Heading come from the npm package; Button was installed from the registry. The Button shows `alert("Button clicked")`.
4. CI is green: tokens build/check, contrast, lint, types, unit and a11y tests, package build, registry build, foundations parity, site build.
5. A clean install outside the repo works for both channels (script output saved).
6. Accessibility pass: heading order, keyboard, focus-visible, disabled, contrast AA, 200% zoom, layout at 320px wide.
7. v0.1.0 tagged, README covers both install routes, PROGRESS.md has a retro.
8. _(Cuttable)_ Storybook stories and a Penpot specimen board.

## Milestones

| Milestone                     | Blueprint tiers / gates     | Sessions   | Branch → PR     |
| ----------------------------- | --------------------------- | ---------- | --------------- |
| **M0 Foundation**             | P-01…P-07, G-02             | S1         | `m0-foundation` |
| **M1 Tokens**                 | Tier 1 + 2, Gate A          | S2, S3     | `m1-tokens`     |
| **M2 Styles**                 | Tier 3                      | S4         | `m2-styles`     |
| **M3 Components and package** | Tier 4, Gate E (provenance) | S5, S6, S7 | `m3-components` |
| **M4 Registry**               | Distribution, Gate D        | S8, S9     | `m4-registry`   |
| **M5 Real website**           | Gates B, C                  | S10, S11   | `m5-site`       |
| **M6 Docs and release**       | Gate F                      | S12        | `m6-release`    |

**Total:** about 9.5–10 hours. With the cuts in D-014, about 8 hours.

## How to run every session

**Start (paste into a fresh Claude Code session):**

> Read CLAUDE.md and docs/PROGRESS.md, then only the "S<n>" section of docs/PLAN.md. Do only that session's task. Show me a short plan before editing, then implement. Stop when the "Done when" checks pass.

**End:**

> Run the Done-when checks, update PROGRESS.md and DECISIONS.md, and commit as "S<n>: …".

Then `/clear`, or start a new session. On the last session of a milestone, the AI pushes the branch and opens/edits the PR; wait for CI; Purander reviews and merges.

**If a session runs over 60 minutes:** stop, have the AI write the remaining work into PROGRESS.md "Next", commit, and continue in a fresh session.

---

## M0 Foundation

### S1: Kickoff and scaffold (45 min)

**You do first (10 min):**

- Pick the font. Suggested: Inter or Geist, self-hosted through `next/font` in the site; the package only references the family name.
- Pick a primary color hex. It must reach 4.5:1 contrast against white text.
- Create the empty GitHub repo `ui-design-system`.
- Copy these 4 files into it.

**Prompt:**

> S1. Scaffold the pnpm monorepo per CLAUDE.md layout: root package.json (pnpm workspaces, node 22, scripts `check`, `tokens:build`, `tokens:check`, `registry:build` as stubs), `pnpm-workspace.yaml` (`packages/*`, `apps/*`), `.npmrc` with `link-workspace-packages=false`, TypeScript base config (strict), ESLint (flat config) + Prettier, `.gitignore`, `packages/ui` skeleton (`@puranderdua/ui`, version 0.0.0, React 18/19 peer deps, `src/index.ts` empty export, tsconfig path `@/*` → `src/*`), empty `tokens/`, `scripts/`, `apps/` folders with .gitkeep, and `.github/workflows/ci.yml` (pnpm install --frozen-lockfile, `pnpm check`). Record my brand choices in PROGRESS.md: font <X>, primary <HEX>.

**Done when:** `pnpm install && pnpm check` passes locally; CI is green on the pushed branch.
**Feeds:** M0, then Purander merges PR `m0-foundation`.

---

## M1 Tokens (Tier 1 + 2)

### S2: Token source (40 min)

**Prompt:**

> S2. Write DTCG token JSON (`$value`, `$type`, `$description`).
> **tokens/primitives/**: font family (brand + fallback stack), font sizes (about 7, a rem scale from 0.75 to 3), weights (400/500/600/700), line heights (tight/normal/relaxed), letter spacing (tight/normal), colors (brand scale 50–900 built around my primary, neutral scale 0–950, white), spacing (1, 1.5, 2, 3, 4, 6 in rem), radius (sm, md), border width (1), focus ring width/offset.
> **tokens/semantic/**: typography composites for `type.display, type.h1, type.h2, type.h3, type.body, type.lead, type.caption, type.label`; colors `text.primary, text.muted, text.inverse, surface.canvas, border.default, action.primary.{bg,bg-hover,bg-active,fg}, action.secondary.{bg,bg-hover,bg-active,fg,border}, focus.ring, disabled.{bg,fg,border}`; control sizes `control.{sm,md}.{height,padding-x,font-size}`, `control.radius`.
> Semantic tokens must only alias primitives. Add a JSON schema sanity script `scripts/validate-tokens.mjs` (every token has `$value` and `$type`; aliases point to existing tokens).

**Done when:** `node scripts/validate-tokens.mjs` passes; you've reviewed the role names (5 min).

### S3: Token build and checks (50 min)

**Prompt:**

> S3. Add Style Dictionary v4 (`usesDtcg: true`). `pnpm tokens:build` outputs `packages/ui/src/styles/generated/tokens.css` (`:root` vars with prefix `--ds-`, `outputReferences: true` so semantics reference primitives) and `tokens.json` (flat). Typography composites expand to per-property vars (`--ds-type-body-font-size`, etc.). `pnpm tokens:check` must: (1) run validate-tokens, (2) rebuild and fail if generated output differs from the committed copy (determinism and no stale output), (3) run `scripts/contrast.mjs` that checks WCAG AA (4.5:1 normal text) for text.primary/surface.canvas, text.muted/surface.canvas, action.primary.fg/bg (and hover, active), action.secondary.fg/bg. Wire both into `pnpm check` and CI.

**Done when:** CI is green. Changing one primitive and rebuilding changes every dependent `--ds-*` var. Contrast passes, or adjust the primary color now. This is **Gate A**. Open PR `m1-tokens` (Purander merges).

---

## M2 Styles (Tier 3)

### S4: Tailwind bridge and recipes (45 min)

**Prompt:**

> S4. In `packages/ui/src/styles/theme.css` (hand-written) map semantic vars into Tailwind v4 with `@theme inline` (namespaces: `--color-ds-*` for semantic colors, `--text-ds-*` with line-height and weight companions for each type role, `--font-ds-sans`, `--radius-ds-control`, `--spacing-*` only if needed). Add `@layer components` recipes `.ds-type-<role>` only where utilities can't express a composite. Write `scripts/build-foundations.mjs` that concatenates generated `tokens.css` + `theme.css` into `packages/ui/dist/foundations.css` (no `@import "tailwindcss"` inside it). Add `docs/styling-rules.md`: no dynamic class names, no arbitrary values for shared decisions, `@apply` only inside recipes, consumers add `@import "tailwindcss"; @import "@puranderdua/ui/foundations.css"; @source "../node_modules/@puranderdua/ui/dist";`.
> Create a minimal throwaway Vite+React page in `packages/ui/playground/` (not published) that renders every type role and both button color pairs using only token utilities, and verify the production build CSS contains them.

**Done when:** The playground production build shows all roles correctly, with no missing classes in the built CSS (grep for e.g. `text-ds-h1`). Open PR `m2-styles` (Purander merges).

---

## M3 Components and package (Tier 4)

### S5: Text and Heading (45 min)

**Prompt:**

> S5. In packages/ui implement `Text` (variants body, lead, caption, label; `as`: p | span | div | label; default p) and `Heading` (variants display, h1, h2, h3; `as`: h1–h6, default derived from variant via a static map, display→h1). Static variant maps (cva), `className` merged with `cn` from `@/lib/utils` (clsx + tailwind-merge), forwardRef, exported prop types. Set up Vitest + @testing-library/react + jsdom + vitest-axe (+ vite-tsconfig-paths). Tests: correct element per `as`, variant independent of element, no a11y violations, class strings contain no template interpolation (snapshot of variant map).

**Done when:** `pnpm --filter @puranderdua/ui test` passes and types export cleanly.

### S6: Button, shadcn intake and adaptation (60 min)

**You do first:** Approve the dependencies `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` (some already added in S5).

**Prompt:**

> S6. Bring in shadcn/ui's Button source (use the current shadcn CLI or copy from the official repo), place it at `packages/ui/src/components/button.tsx`. Write `docs/provenance/button.md`: source URL, shadcn version/commit, date, MIT license, dependencies, and a list of every change we make. Adapt: variants only `primary | secondary`, sizes `sm | md`, colors/radius/height/padding/font only from `ds` token utilities, states hover/active/focus-visible (ring from `focus.ring`)/disabled (`disabled.*`), default `type="button"`, keep `asChild`. Tests: Enter and Space activate, disabled blocks onClick and is announced, focus-visible class present, `type="button"` default, axe clean for both variants, sizes.

**Done when:** Tests pass, and the provenance doc lists the upstream version and the diff summary.

### S7: Package build and publish (50 min)

**Prompt:**

> S7. Configure tsup for `@puranderdua/ui`: ESM + `.d.ts`, `"use client"` banner on the Button entry only if needed, externalize react/react-dom/radix, resolve `@/` paths. package.json: version 0.1.0, `exports` for `.` and `./foundations.css`, `files: ["dist"]`, `sideEffects: ["*.css"]`, peerDeps react >=18, `publishConfig.access: public`, repository/license/keywords, a README with install + Tailwind setup. Build runs `build-foundations` too. Then `pnpm pack`, create a throwaway Next.js app in `/tmp` (outside the repo), install the tarball, render Text/Heading/Button with the documented CSS setup, and `next build` it. Report the result. Do NOT publish.

**You do:** `cd packages/ui && npm publish --access public`, using your 2FA code. Check `npm view @puranderdua/ui`.
**Done when:** The tarball app builds and `npm view` shows 0.1.0. Open PR `m3-components` (Purander merges).

---

## M4 Registry (distribution)

### S8: Registry build and hosting (60 min)

**Prompt:**

> S8. Create root `registry.json` (`$schema: https://ui.shadcn.com/schema/registry.json`, name `puranderdua`, homepage = registry URL) with items:
>
> - `ds-foundations`: `registry:file` → `packages/ui/dist/foundations.css`, target `styles/ds-foundations.css`; docs field explains the one-line import in globals.css.
> - `ds-typography`: `registry:ui`, files text.tsx + heading.tsx from packages/ui/src/components, dependencies `class-variance-authority clsx tailwind-merge`, `registryDependencies`: `utils` + full URL of ds-foundations.
> - `ds-button`: `registry:ui`, button.tsx, dependencies incl. `@radix-ui/react-slot`, registryDependencies `utils` + ds-foundations URL.
>   Script `pnpm registry:build`: build package → `shadcn build --output apps/registry/public/r/v<version>` → copy to `public/r/latest`. Version is read from packages/ui/package.json. Add `scripts/check-parity.mjs` (CI): the registry's foundations content is byte-identical to `packages/ui/dist/foundations.css`. Set up `apps/registry` as a static Vercel project (output dir `public`, CORS header for `/r/*`). Write `docs/registry.md` (namespace config, install commands, versioning, rollback = pin previous version path).

**You do:** Create the Vercel project with root `apps/registry`, then deploy.
**Done when:** `curl https://<registry>/r/v0.1.0/ds-button.json` returns valid JSON with file content. `@/lib/utils` imports are present, so the CLI can rewrite them.

### S9: Clean-install and update checks (40 min) _(cuttable)_

**Prompt:**

> S9. Write `scripts/clean-install.sh`: in a temp dir outside the repo, `create-next-app` (TS, Tailwind v4, App Router) → `shadcn init` → add `"registries": {"@puranderdua": "<REGISTRY>/r/v0.1.0/{name}.json"}` to components.json → `shadcn add @puranderdua/ds-typography @puranderdua/ds-button` → add the foundations import → render a page using both → `npm i @puranderdua/ui@0.1.0` and render the package Button on a second route → `next build`. Then edit button.tsx locally and rerun `shadcn add @puranderdua/ds-button` to confirm it prompts and doesn't overwrite silently. Save the logs to `docs/evidence/clean-install-<date>.md`. Add a manual-trigger GitHub workflow that runs the script.

**Done when:** The script passes end to end; evidence file committed. This is **Gate D**. Open PR `m4-registry` (Purander merges).

---

## M5 Real website

### S10: Portfolio site (60 min)

**Prompt:**

> S10. Create `apps/site` (Next.js App Router, TS, Tailwind v4, `next/font` for my font mapped to the `--ds` font var). Dependency `"@puranderdua/ui": "0.1.0"` (pinned, from npm; verify `node_modules/@puranderdua/ui` is NOT a symlink). `shadcn init` then add the namespace pointing at the live registry `v0.1.0`, `shadcn add @puranderdua/ds-button` (this also brings ds-foundations → import `styles/ds-foundations.css` once in globals.css; do not also import the package's foundations.css; add `@source` for the package dist). Page: hero Heading (display, as h1), lead Text, caption, a long-form section with h2/h3 + body paragraphs, and a CTA using registry Button primary + secondary, where primary calls `alert("Button clicked")` (client component). ESLint `no-restricted-imports`: ban `Button` from `@puranderdua/ui` in apps/site. Responsive and readable at 320px.

**You do:** Create the Vercel project with root `apps/site`, then deploy.
**Done when:** The site is live; the page uses both channels (check the imports); clicking shows the alert.

### S11: QA and accessibility (45 min)

**Prompt:**

> S11. Add Playwright to apps/site: smoke test against the preview URL (env var): exactly one h1, headings in order, primary Button via keyboard (Tab to focus, focus ring visible, Enter triggers the dialog "Button clicked"; handle it with `page.once('dialog')`), secondary button works, @axe-core/playwright reports no violations, viewport 320px has no horizontal scroll, 200% zoom keeps content readable. Run it, fix issues at the right tier (token → recipe → component → site), and add the test to CI against a local `next start`.

**You do:** A 5-minute manual pass with the keyboard only, plus your browser zoom at 200%. Note it in PROGRESS.md.
**Done when:** Playwright and axe are green, and your manual pass is recorded. This covers **Gates B and C**. Open PR `m5-site` (Purander merges).

---

## M6 Docs and release

### S12: Storybook, Penpot, release (60 min)

**Prompt (Storybook part, cuttable):**

> S12a. Add `apps/docs` Storybook (React + Vite, Tailwind v4 via `@tailwindcss/vite`, imports package foundations.css) with stories: Text (all variants), Heading (all variants, `as` vs variant demo), Button (primary/secondary × sm/md × default/disabled) + a11y addon. Add a `build-storybook` script.

**You do (Penpot part, cuttable, about 30 min):**

- In hosted Penpot, import `tokens/` JSON in the Tokens panel.
- Build one board with the type specimen and Button states (default/hover/focus/disabled × 2 variants × 2 sizes).
- Compare it side by side with the live site and Storybook, and note any differences in PROGRESS.md.

**Prompt (release part):**

> S12b. Write the root README (what this is, 4 tiers diagram, install via npm, install via registry, Tailwind setup, links), `CHANGELOG.md` for 0.1.0, release notes in `docs/releases/v0.1.0.md` (scope, evidence links, known gaps), and a retro section in PROGRESS.md (time per session, what broke, next slice: Release 1 = colors + light/dark theming).

**You do:** Review and merge PR `m6-release`, run `git tag v0.1.0 && git push --tags`, and create a GitHub Release.
**Done when:** Every Goal item at the top of this file is checked.

---

## After Release 0 (from blueprint section 5)

| Release | Adds                                           |
| ------- | ---------------------------------------------- |
| 1       | Full color palette, surfaces, light/dark theme |
| 2       | Spacing/layout primitives, Stack, Container    |
| 3       | IconButton, Link                               |
| 4       | Forms                                          |
| 5       | Navigation, overlays, feedback                 |

Each release follows the same session pattern: tokens → recipes → components → registry item → site.
