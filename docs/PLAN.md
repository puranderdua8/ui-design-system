# Release 2 plan: the Builder — a design system anyone can build and understand

Release 1 (package 1.0.0) is archived in [`plans/release-1.md`](plans/release-1.md), Release 0 in [`plans/release-0.md`](plans/release-0.md). This file always holds the current release (D-054). The product and technical design is in [`builder-spec.md`](builder-spec.md) ("the spec"); session prompts name the sections to read.

## Goal

**Launch (S36–S63), done when all are true:**

1. **Quick wins are live.** Today's `/playground` keeps its preview in view, uses plain labels and leads with one "use in your app" file; component pages show code on demand.
2. **Package 1.1.0** is on npm with RadioCard, Slider, ToggleGroup and AlertDialog.
3. **Guided builder.** `/build` offers the eight steps as an expanding list beside a pinned preview of real example pages, in plain language, with named projects, undo/redo and "Try another combination".
4. **Check.** Readability problems are explained by cause and fixed in one click.
5. **Use it.** A share link, a printable style guide, a DTCG tokens file, a CSS-variables file and the package theme.
6. **Safe.** Shared links, project files and stored state pass a strict value grammar; no hostile value reaches an export.
7. **Accessible.** WCAG 2.2 AA on every `/build` route (axe in three browsers, 320px, 200% zoom, the screen-reader script).
8. **Tested with people.** T0 and T1 are recorded in `docs/research/`; no open critical or serious finding from T1 or the independent review.
9. **Product-first site.** A product home page, an About page, nav "Build", and `/playground` redirecting to `/build`.
10. **Production-ready bar.** The [Definition of Done](#definition-of-done-every-release) holds for 1.1.0 and for the site at launch.

**Whole release (after launch, sized in [Later](#later-after-launch-sized-not-specified)):** Studio rebuild, three more export formats, any Google Font, the teaching aids, the full components gallery, a release review and T2.

## Milestones

| Milestone                     | Sessions       | npm release        | Notes                                            |
| ----------------------------- | -------------- | ------------------ | ------------------------------------------------ |
| **M13 Groundwork**            | S36–S37        | none               | docs, test kit, analytics                        |
| **M14 Quick wins**            | S38–S40        | none               | existing components only; then **T0**            |
| **M15 Package controls**      | S41–S43        | 1.1.0              | parallel with M16                                |
| **M16 Engine v2 and content** | S44–S49        | none               | pure TypeScript and data; parallel with M15      |
| **M17 Guided builder v1**     | S50–S63        | none               | dark-launched at `/build`; **T1**; launch in S63 |
| M18–M22                       | to be numbered | 1.2.0 (meta files) | see Later                                        |

**To launch:** 28 sessions and two test rounds. **Whole release:** about 50 sessions. The estimate budgets review and fix time because Release 1 needed 26 review and hardening sessions for 23 feature sessions (spec section 9, row 3).

**Rolling wave (D-142):** only sessions up to launch are specified. Each later milestone gets its sessions at its own kickoff, from T1 and analytics evidence.

## Working rules for Release 2 (D-143)

1. **One PR per session.** Branch `s<n>-<slug>` cut from updated `main`; no branch lives longer than three sessions.
2. **Dark launch.** The Builder is built at `/build`, unlinked and `noindex`, while `/playground` stays live. Launch (S63) is a navigation change and a redirect.
3. **Every milestone ends on a real deployment.** The maintainer deploys (Git deployments are off, D-057, D-094); the e2e suite then runs against that URL with `SITE_URL`.
4. **Independent review before launch** (S60): a fresh session that only reviews, with a register in `docs/audits/`. A new guardrail is proven by planting a bug and watching the check fail.
5. **Record time.** Every PROGRESS entry starts with the session's start and end time.
6. **The least technical person wins in Guided** (D-104). When a wording or layout choice cannot suit everyone, write for someone with no design or code vocabulary.
7. **No invented user data.** Research results are written only after the maintainer has run the sessions.
8. The maintainer merges, publishes, tags and deploys. The AI never does.

## How to run every session

**Start (paste into a fresh Claude Code session):**

> Read CLAUDE.md and docs/PROGRESS.md, then only the "S<n>" section of docs/PLAN.md and the spec sections it names. Do only that session's task. Show me a short plan before editing, then implement. Stop when the "Done when" checks pass.

**End:**

> Run the Done-when checks, update PROGRESS.md (with start and end time) and DECISIONS.md, commit as "S<n>: …", push the branch and open the PR.

**If a session runs over 60 minutes:** stop, write the remaining work into PROGRESS.md "Next", commit, and continue in a fresh session.

**Release rhythm (D-050, D-069):** the release-prep session bumps the version and CHANGELOG and opens the PR. The maintainer merges it, pushes the tag `v<version>` on `main` and approves the `npm-publish` deployment. The next site session pins `apps/site` to that exact version.

**Pre-approved dependencies** (only in the session that names them): `@vercel/analytics` in `apps/site` (S37); `@radix-ui/react-slider` (S41), `@radix-ui/react-toggle-group` and `@radix-ui/react-alert-dialog` (S42) in `packages/ui`. Anything else needs asking first.

## Cross-cutting design (read once; sessions refer back here)

The design lives in the spec. The rules below are the ones every session must hold.

- **Engine first, UI second.** New behaviour is a pure function in `apps/site/src/playground/` with unit tests before any component uses it (what made S33–S35 cheap).
- **Copy is data.** Every Guided string comes from `apps/site/src/content/builder.ts` (from S44) and follows the rules in spec 4.10. No banned word in Guided.
- **Untrusted input (D-144).** Anything read from a URL, a file or storage goes through the value grammar (from S48); every export re-validates.
- **Preview rules** (spec 4.8): one labelled region after the controls in DOM order, no landmarks inside, headings below the tool's, examples never navigate or submit.
- **Tool chrome is neutral** (D-128): only previews and examples wear the user's design system.
- **Guardrails (D-070)** in CLAUDE.md still apply, including: components only from `@puranderdua/ui`, layout follows the container, DOM order is visual order, targets at least 24px, no arbitrary values, single controls in `Field`, groups in `Fieldset`.

**Per package component, every time:** static variant maps, semantic tokens only, `data-slot`, typed props and refs (D-034), tests (behaviour, keyboard, axe), a Storybook story with a usage and accessibility note, an export from `src/index.ts`, the README component list, a provenance doc. Plus: exported variants in a `.styles.ts`, any new colour role in the contrast matrix for every tone with a default alias (D-095), `ScopedPortal` and layer tokens for overlays, a hit area for small controls, string props with English defaults, layout and environment tests passing in Chromium, Firefox and WebKit, a hydration case, and the story's a11y test passing.

### Definition of Done (every release)

A release-prep session shows all of these before the PR is opened:

- `pnpm check` green: lint, knip, tokens (completeness, contrast matrix per theme), typecheck, unit and axe tests, layout and environment tests in three browsers, package build, playground CSS coverage, Storybook build with a11y tests.
- `pnpm check:rsc` green against the packed tarball.
- `scripts/clean-install.sh` green against the tarball.
- Site e2e green in Chromium, Firefox and WebKit, including axe, 320px, 200% zoom and the security-header test.
- `pnpm audit --prod --audit-level high` clean.
- CHANGELOG with every addition and a migration note where one is needed; READMEs and the component list current; `docs/versioning.md` followed (a minor adds, never removes).
- The current audit register has no `open` findings for the release's scope.

---

## M13 Groundwork

### S36: Release 2 kickoff (60 min) — done

Archived the Release 1 plan, wrote this file, `builder-spec.md`, D-104 to D-145 and the usability test kit, and updated CLAUDE.md, README and PROGRESS.

### S37: Analytics and privacy note (45 min)

**You do first:** enable Web Analytics for the site's project in the Vercel dashboard. If `v1.0.0` is on npm, say so.

**Prompt:**

> S37. Read spec 5.3 and 5.5. Add `@vercel/analytics` (pre-approved) to `apps/site` and render `<Analytics />` in the root layout with a `beforeSend` that removes the URL hash from every event, so a shared design can never be recorded. Check the current Vercel docs for the script and endpoint paths before touching the CSP; the review found them same-origin, so the CSP should need no new host. Add a short privacy note (what is counted: page views, no cookies, nothing about your designs) on a new `/about` stub or the footer. Update `production.spec.ts` (security headers, no third-party host). If 1.0.0 is published, also pin the site to 1.0.0 (the H20 hand-off).

**Done when:** site e2e is green; the header test still shows no third-party host; after the maintainer deploys, a page view appears in the dashboard and its URL has no hash.

## M14 Quick wins (existing components only)

### S38: Playground quick wins (60 min)

**Prompt:**

> S38. Read spec 1, 4.10 and 5.1. On today's `/playground`, with package components only:
>
> - Pin the preview: it stays in view while the controls scroll, with its own scroll. When the container is too narrow for two columns, keep today's stacking.
> - Split the controls column with the existing `Tabs` into Design, Check, Advanced and Export, so the page is about one screen tall.
> - Replace the labels and help text with the draft vocabulary of spec 4.10 (no banned word in the Design tab); move exact terms into help text where an expert needs them.
> - Ask before a new starting look wipes edits (an inline confirm; no dialog component exists yet).
> - Show the readability summary ("All 202 combinations are readable" or "N things to fix") above the tabs.
>
> Keep the engine and the stored state unchanged. Update `e2e/playground.spec.ts`.

**Done when:** at 1024×768 the preview is visible at every scroll position and the Design tab needs no more than a short scroll; playground e2e and axe are green in three browsers; no horizontal scroll at 320px.

### S39: Export quick win (45 min)

**Prompt:**

> S39. Read spec 4.6. In the Export tab, lead with one file: "Use in your app" is the CSS file, with Copy and Download and at most three lines of instructions for each of two cases: any site (link the file; it carries the decisions as CSS variables, not components) and `@puranderdua/ui` (import it after `foundations.css`). Move the four JSON files and the repository instructions into a closed "Advanced: theme folder for this repository" disclosure. Keep `exportTheme`, the contrast and override warnings and the round-trip test unchanged.

**Done when:** export e2e is updated and green; `export.test.ts` passes unchanged.

### S40: Components quick wins (60 min)

**Prompt:**

> S40. Read spec 1 (the component pages row). In `components/example.tsx` and the category pages: collapse each code block by default behind "Show code" (a native `<details>`), add a Copy button with a status message, add an "On this page" list of the page's examples, and give every example one plain line that says what the component is for. The code shown must still be the file that rendered (`readDemo`).

**Done when:** `showcase.spec.ts` passes, including "the code shown is the code that rendered"; axe is clean on every category page in every look; no horizontal scroll at 320px.

### T0: first usability round (maintainer)

**You do:** deploy the quick wins, then run six sessions (2 makers, 2 designers, 2 marketers) with [`research/usability-test-kit.md`](research/usability-test-kit.md), after one pilot. Record findings with severities and the words people used in `docs/research/<date>-t0.md`.

**Done when:** the findings file exists. S44 applies the vocabulary gate: a term two or more people misread is renamed.

---

## M15 Package controls → 1.1.0 (parallel with M16)

### S41: RadioCard and Slider (60 min)

**Prompt:**

> S41. Read spec 5.6 and the per-component checklist above. Add two components to `packages/ui`:
>
> - **Slider**, adapted from shadcn new-york-v4 on `@radix-ui/react-slider` (pre-approved): keyboard support, a visible value, an `aria-valuetext` prop for a value in words, a 24px target.
> - **RadioCard**, a picture choice: a radio whose whole card is the target, with a media slot, a label and an optional description, used inside `RadioGroup` and `Fieldset`. shadcn has no such file, so build it on the already adopted RadioGroup and record that in a DECISIONS entry and the provenance doc. The selected state must not rely on colour alone.
>
> Any new colour role joins the contrast matrix for every tone and gets a default alias (D-095).

**Done when:** package unit tests, `test:layout` in three browsers and `pnpm --filter docs test:stories` are green; `check-client-exports` passes.

### S42: ToggleGroup and AlertDialog (60 min)

**Prompt:**

> S42. Same checklist. **ToggleGroup** on `@radix-ui/react-toggle-group` (single and multiple, arrow-key navigation, a pressed state that is not colour alone). **AlertDialog** on `@radix-ui/react-alert-dialog`: rendered through `ScopedPortal` with the layer tokens and the scrim token, focus trapped and returned, every string a prop, a `container` prop that wins. Both pre-approved.

**Done when:** the same checks as S41; the overlay test shows the dialog carrying a `ThemeScope`'s theme, vars and direction.

### S43: 1.1.0 release prep (50 min)

**Prompt:**

> S43. Release prep for 1.1.0 (a minor: additions only, `docs/versioning.md`). CHANGELOG, package README component list, `check:rsc` cases for the new client components, and the full [Definition of Done](#definition-of-done-every-release). Do not publish or tag.

**You do:** merge, push `v1.1.0`, approve `npm-publish`.
**Done when:** every Definition of Done line is shown green and the PR is open.

## M16 Engine v2 and content (parallel with M15; no UI)

### S44: Content file and plain-language rules (60 min)

**You do first:** T0 findings in `docs/research/`. If T0 has not run yet, say so; the session uses the draft vocabulary and the gate stays open in PROGRESS.

**Prompt:**

> S44. Read spec 4.3, 4.4 and 4.10. Create `apps/site/src/content/builder.ts`: every Guided string as data (step names, questions, the "what it is" and "where it shows up" sentences, option names, "why it matters", button labels, error and fix sentences, status messages). Apply the T0 vocabulary findings. Add a unit test that fails when a Guided string contains a banned word or a sentence longer than the rule allows. Write nothing into components yet.

**Done when:** `pnpm --filter site test` is green; the maintainer has read the copy once.

### S45: State v2, projects and history (60 min)

**Prompt:**

> S45. Read spec 4.9 and 5.2. In `apps/site/src/playground/`: state version 2 (`dims`, `fonts`, a reserved `mode: "light"`), a projects store (list, current project, rename, duplicate, delete) on the `useSyncExternalStore` pattern of `store.ts`, undo/redo per project with a way to merge a drag into one step, and a migration that turns today's `ds-playground` draft into a project named "My design system". Storage that is blocked or full must not throw.

**Done when:** unit tests show an old draft migrating intact, an untouched state equal to its starting look, undo and redo round-tripping, and a version newer than the code being left alone.

### S46: Presets, three questions and shuffle (60 min)

**Prompt:**

> S46. Read spec 4.4. Add `presets.ts`: each picture choice takes one dimension (type scale, shape, spacing, depth, motion) from one of the four shipped looks in `themeMaps`, so the same choice gives the same values whichever look the project started from. Add "Flat" shadows, a `typeScale` fine-tune with a 12px floor, the mapping from the three questions to a starting look and presets (with the reason as text), highlight-colour suggestions from a brand colour, and `shuffle` (another valid mix; colours kept unless asked). The existing multiplier knobs become "fine-tune" on top.

**Done when:** tests show one preset giving identical values from all four starting looks, controls never under the 24px target, and a state with no preset still equal to its starting look.

### S47: Explain and fix (60 min)

**Prompt:**

> S47. Read spec 4.5. Add `explain.ts`: group failing contrast results by cause (brand colour, highlight colour, background feel, an override) and return a plain sentence, the number of places affected and one example per cause, using role-to-plain-name data in the content file. Add `fix.ts`: move the causing colour to the nearest shade that passes (same hue, OKLCH lightness search), re-run the contrast check, and return before and after.

**Done when:** tests show a sentence for every failing cause, and a property test over 360 hues at several chroma levels where the fix leaves no failure for that cause and keeps the hue.

### S48: Value grammar, share link and project file (60 min)

**Prompt:**

> S48. Read spec 5.3 (D-144). Add `grammar.ts`: one allow-list parser per token type (colour, dimension, duration, easing, shadow, font family, number, alias), reusing the formats in `scripts/lib/dtcg.mjs` where they fit. `parseState` drops any override whose value does not parse for its token's type; project and font names are plain text with a length limit and a strict character set; `toCss` and every other formatter refuse a value that does not parse. Add `share.ts` (state to compressed base64url for the URL hash with the native `CompressionStream`, and back through `parseState`) and project file export/import. Plant an injection (`red; } body { display: none } :root {`) and show it never reaches an export, then keep that as a test.

**Done when:** tests cover the round trip, hostile values (`;}`, `url(`, `@import`, `</style>`), oversized input and an unknown version; today's stored states still load.

### S49: CSS-variables and DTCG-file formats (60 min)

**Prompt:**

> S49. Read spec 4.6 and 5.5. Add `formats/css-vars.ts` (one `:root` block of resolved custom properties, usable without the package) and `formats/dtcg-file.ts` (one DTCG 2025.10 file with primitives and roles), each a pure function with a shared one-line credit header (D-139). Keep the theme-folder export and its round-trip test unchanged.

**Done when:** tests show the CSS parsing and applying to a plain HTML page, and the DTCG file passing the repo's validator for format; every value went through the grammar.

---

## M17 Guided builder v1 (needs 1.1.0 on npm; dark-launched)

### S50: Site on 1.1.0, neutral chrome, examples scope (60 min)

**You do first:** 1.1.0 is published.

**Prompt:**

> S50. Read spec 4.2 and D-128. Pin the site to 1.1.0. Stop applying a look to `<html>`: the tool's chrome always uses Base. Wrap every example (component pages, the playground preview) in a scope that wears the chosen look, and turn the header "Theme" switcher into "Showing examples in" (the four looks now; projects are added in S51). A reload must not flash the wrong look in the examples.

**Done when:** `themes.spec.ts` is updated and green in three browsers; axe is clean on every showcase page in every look.

### S51: Builder shell (60 min)

**Prompt:**

> S51. Read spec 4.3, 4.9 and 4.11. Build `/build` (unlinked, `noindex`): the expanding step list with one URL per step, the pinned preview (today's preview for now), the top bar (project name with rename, `Guided | Studio`, Undo, Redo, status pill, "Use it"), and the project chooser with rename, duplicate and delete (AlertDialog). Host today's four panels unchanged at `/build/studio`. Steps hold placeholders that show their current choice from the content file. Add the user's projects to "Showing examples in".

**Done when:** a keyboard-only walk through every step works, with focus on the open step's heading and a title per step; axe is clean; Back and Forward move between steps.

### S52: Preview pages (60 min)

**Prompt:**

> S52. Read spec 4.8. Build the five preview tabs from package components only: Landing page, Sign-up form, Settings screen, Article, All components (every component the four pages do not use). Add the width switch (ToggleGroup: Phone, Tablet, Desktop) and apply the preview accessibility rules: one labelled region after the panel, a skip link, no landmarks inside, headings below the tool's, links and forms that never navigate or submit.

**Done when:** axe is clean on every tab in every look with no landmark or heading-order violation; each tab reflows at the Phone width.

### S53: Start and Colour (60 min)

**Prompt:**

> S53. Read spec 4.4 (rows 1 and 2) and 4.5. **Start:** one screen with an optional brand colour (text field, picker, and a colour from an image read in the browser only), four live look thumbnails (RadioCard) that redraw in that colour, and "Not sure? Answer three questions". **Colour:** brand colour with its generated shades as a strip, highlight suggestions or your own, background feel as swatches, and a readability line under each colour. Every colour has a text field beside the picker.

**Done when:** e2e shows each way of starting creating a project and a brand change restyling the preview's main button; an invalid colour shows a sentence with a suggestion.

### S54: Typography (60 min)

**Prompt:**

> S54. Read spec 4.4 (row 3) and D-122. Pairing cards drawn in their own typefaces from the fonts the site already self-hosts, "I have my own font" (a name checked by the grammar; the preview uses a labelled stand-in; the exports carry the name), and Text size (Compact, Standard, Large) with a fine-tune Slider. No request may leave our origin.

**Done when:** e2e shows a pairing changing both fonts and every font request staying on our origin; the own-font name appears in the exported CSS.

### S55: Shape, Spacing, Depth and motion, shuffle (60 min)

**Prompt:**

> S55. Read spec 4.4 (rows 4 to 6). Picture choices (RadioCard) for corners, outline, spacing, shadows and motion, each with a fine-tune Slider whose value is said in words; a Play button for motion that respects reduced motion; and "Try another combination" in the top bar with "keep my colours", as one undo step.

**Done when:** e2e shows each option setting the expected computed value in the preview, fine-tune working by keyboard, and shuffle undone in one step.

### S56: Check (60 min)

**Prompt:**

> S56. Read spec 4.5. The Check step lists problems by cause with a sample, "Show me" (outlines the places in the preview) and "Fix it for me" (before and after, undoable), plus "Fix all" and a "Technical details" disclosure with today's ratios. Wire the status pill and a polite, debounced live region for preview changes. End the step with "What you've built": every decision with a link to its step.

**Done when:** e2e shows a failing brand colour explained, shown and fixed in one click, with undo restoring it; the live region announces once per change.

### S57: Use it and the shared view (60 min)

**Prompt:**

> S57. Read spec 4.6 and 5.3. The Use it step: "Copy link" (says it is a snapshot), "Open style guide" (S58), the DTCG file with no tool named until its import has been verified by hand, and "Build with it" tabs for CSS variables and `@puranderdua/ui`, each with Copy, Download, at most three lines of instructions and the font snippet. A banner links to Check when something fails. `/build/shared#d=…` shows a shared system read-only, labelled as someone else's, with "Save a copy" that never overwrites a local project.

**Done when:** e2e shows a copied link reopening the same system in a clean browser context, each file downloading, and a tampered link falling back safely with a message.

### S58: Style guide and print (60 min)

**Prompt:**

> S58. Read spec 4.6 (item 2). `/build/guide`: the project name, colours with plain names, hex values and "use for", type specimens, shape, spacing, shadows, motion, sample components, an accessibility summary and the credit footer, inside one scope. Print styles: no tool chrome, sensible page breaks, real text.

**Done when:** axe is clean; the print-media test shows no chrome and no clipped content; the page works from a shared link.

### S59: Phones, accessibility and the e2e suite (60 min)

**Prompt:**

> S59. Read spec 4.11 and 5.4. Phone layout for Guided (preview pinned on top and collapsible, the list below, pinned bars never covering the focused control). Replace `playground.spec.ts` with `build.spec.ts` covering every step, the shared view and the style guide with axe in Chromium, Firefox and WebKit, at 320px and 200% zoom. Measure the interaction latency of a slider drag and a colour pick against the 200 ms budget and record `/build`'s JavaScript size against the H18 playground figure. Do not add a screenshot suite (D-102, D-145).

**You do:** deploy to a preview or production; the suite is then run against that URL.
**Done when:** site e2e is green in three browsers on the real deployment; the two measurements are in PROGRESS.

### S60: Independent review (60 min, review only)

**Prompt:**

> S60. Review only, no fixes. In a fresh session, review M15 to M17 against the spec, the guardrails, WCAG 2.2 AA and D-144, as MR did for Release 1: read the code, run the checks, probe the live `/build` in the Browser pane by keyboard. Write findings with evidence and a severity (critical, serious, minor) to `docs/audits/<date>-builder-review.md`.

**Done when:** the register exists and every finding has evidence.

### T1: second usability round (maintainer)

**You do:** six sessions (2 per audience) on the unlinked `/build` with the kit's Builder tasks. Findings with severities in `docs/research/<date>-t1.md`.

### S61 and S62: Fix review and T1 findings (60 min each)

**Prompt:**

> S61 (S62). Fix the critical and serious findings of the S60 register and the T1 findings, most severe first. Each fix has a test where one is possible. Set each row to fixed (with evidence), accepted (with a D-number) or parked. If critical or serious rows remain after S62, write the next fix session into this file instead of launching.

**Launch gate:** no open critical or serious finding from S60 or T1.

### S63: Product home, About and launch (60 min)

**Prompt:**

> S63. Read spec 4.2 and D-107. Product home: a plain headline, one primary action ("Start building" to `/build/start`), a live demo where choosing one of the four looks restyles a small example, how it works in three steps, what you walk away with, and who it works for; no testimonial or number that is not real. Move today's portfolio text and the privacy note to `/about`. Nav becomes Build, Components, About; `/build` is indexable and linked; `/playground` redirects permanently to `/build`. Update metadata, the Open Graph image and the sitemap, and the README roadmap.

**You do:** deploy. The production e2e then runs against the live site.
**Done when:** production e2e is green on the live site and every launch goal at the top of this file is checked.

---

## Later (after launch; sized, not specified)

| Milestone              | Contents                                                                               | Rough size      |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------- |
| M18 Studio and formats | Studio rebuild (spec 4.7); Tailwind v4, shadcn/ui and JSON/TypeScript exports          | 6 sessions      |
| M19 Fonts              | Catalogue snapshot, proxy routes (spec 5.3), search in the Typography step             | 2 sessions      |
| M20 Teaching           | Glossary page; inspect the preview; "how it fits together"; package meta files (1.2.0) | 5 sessions      |
| M21 Gallery            | Index with search; per-component pages; props tables                                   | 5 sessions      |
| M22 Close              | Full release review, fixes, **T2**, docs, retro, Release 3 hand-over                   | 4 to 6 sessions |

The order of M18 to M21 is decided after launch by what T1 and the analytics show. Each milestone's kickoff session writes its sessions into this file.

## After Release 2

| Release | Adds                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 3       | Dark mode per theme (`mode: dark` sources, a mode toggle, the Builder's reserved mode slot); R26 to R29 from the Release 1 review |
| 4       | Textarea, Switch, Dialog, Toast, Tooltip; component style choices; "developer mode" (full type control)                           |
| 5       | Navigation (Navbar, Breadcrumb, Pagination)                                                                                       |
