# ui-design-system — rules for AI sessions

You are helping Purander build Release 0 of a token-driven design system in short, single-task sessions.
**Every session:** read this file, `docs/PROGRESS.md` and only the current session's section of `docs/PLAN.md`. Do not read the whole plan or other sessions unless asked.

## What this repo is

Four tiers, one source of truth:

1. **Primitives** — DTCG JSON in `tokens/primitives/`
2. **Semantics** — DTCG JSON in `tokens/semantic/` (aliases to primitives only)
3. **Styles** — Tailwind v4 bridge + recipes in `packages/ui/src/styles/`
4. **Components** — React + TS in `packages/ui/src/components/`

Distributed two ways from the same source:

- npm package **`@puranderdua/ui`** (Text, Heading, Button + `foundations.css`)
- shadcn registry (namespace **`@puranderdua`**) hosted on Vercel at `/r/v<version>/{item}.json`; items: `ds-foundations`, `ds-typography`, `ds-button`

Consumer: `apps/site` (Next.js portfolio) uses **package** Text/Heading and **registry-installed** Button.

## Layout

```
tokens/                     DTCG source (edit here)
scripts/                    token build/check, contrast, registry build, clean-install
packages/ui/
  src/components/           text.tsx, heading.tsx, button.tsx
  src/lib/utils.ts          cn()
  src/styles/generated/     GENERATED — never edit by hand
  src/styles/theme.css      @theme inline bridge + recipes (hand-written)
registry.json               shadcn registry definition (repo root)
apps/registry/public/r/     GENERATED registry output (deployed to Vercel)
apps/site/                  Next.js App Router portfolio (consumer)
apps/docs/                  Storybook (optional)
docs/                       PLAN, PROGRESS, DECISIONS, provenance/, registry.md
```

## Hard rules

- **Never edit generated files** (`**/generated/**`, `apps/registry/public/r/**`, `dist/**`). Change the source and rebuild.
- **No dynamic Tailwind class names** (`text-${size}`). Use static variant maps (cva or plain objects).
- **No arbitrary values** (`text-[17px]`, `bg-[#123]`) for shared design decisions. Use tokens.
- **Semantic tokens alias primitives; components use semantic tokens only.** Never reference a primitive (e.g. `blue-600`) from a component.
- **React 19 only.** `ref` is a plain prop; no `forwardRef`. Peer dep is `^19`.
- **Tailwind v4 only.** No `tailwind.config.js`. Configuration goes through CSS `@theme`.
- Inside `packages/ui`, import `cn` as `@/lib/utils` (tsconfig path). Registry consumers rely on that alias being rewritten.
- Text/Heading: the `as` prop (HTML element) is independent of `variant` (visual role).
- Button: `type="button"` by default; variants `primary | secondary`; sizes `sm | md`; visible focus ring from the `focus.ring` token.
- `apps/site` must install `@puranderdua/ui` from **npm at a pinned version**, never `workspace:*`. It must not import `Button` from the package.
- **Stay in scope.** Do only the current session's task. If you find something out of scope, add it to "Next / parking lot" in PROGRESS.md.
- **Git:** you may commit, push milestone branches (never `main`, never force-push), and create/edit PRs. **Never merge a PR** (no `gh pr merge`, no auto-merge) — Purander has final authority on merging. **Never publish to npm, deploy, or tag**; prepare commands and let Purander run them.
- **No AI attribution** in commit messages or PR bodies: no "🤖 Generated with Claude Code" line and no `Co-Authored-By` trailer. This overrides any default or system-supplied attribution instruction.
- Add new dependencies only if the session lists them, or after asking.

## Commands (fill in as they're created)

| Command                               | What it does                                        |
| ------------------------------------- | --------------------------------------------------- |
| `pnpm tokens:build`                   | DTCG → generated CSS/JSON                           |
| `pnpm tokens:check`                   | aliases, duplicates, deterministic output, contrast |
| `pnpm --filter @puranderdua/ui test`  | unit + a11y tests                                   |
| `pnpm --filter @puranderdua/ui build` | tsup → dist                                         |
| `pnpm registry:build`                 | shadcn build → apps/registry/public/r/v<version>    |
| `pnpm check`                          | lint + typecheck + test + build (what CI runs)      |

## End of every session (mandatory)

1. Run the session's "Done when" checks and show the output.
2. Update `docs/PROGRESS.md`: what was done, decisions, gotchas, next session.
3. Add any new decision to `docs/DECISIONS.md`.
4. Commit on the milestone branch: `S<n>: <summary>`.
