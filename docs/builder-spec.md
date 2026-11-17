# Builder spec (Release 2)

What the Builder is, why it exists and how it is built. Approved by the maintainer on 2026-11-16 after a site walkthrough, a 38-decision interview and a critical review (section 9). The delivery plan with session prompts is [`PLAN.md`](PLAN.md).

> AI: do not read this whole file every session. Read the sections your session's prompt names.

**Goal:** make the site the go-to tool for building a design system for any frontend web app, usable by a solo maker, a designer who does not code, a brand or marketing person and a developer, and make people understand what they are building while they build it.

**Intended outcome:** a first-time visitor goes from the home page to a shareable, accessible design system in a few minutes without knowing a technical term, and a developer drops the result into their stack with one file.

## 1. What is wrong today (measured on the live site at 1024×768, 2026-11-16)

| Finding                                                    | Evidence                                                                                                                               | Principle broken               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| The preview scrolls away from the control you are changing | `/playground` is 5,017px tall (6.5 screens); the preview is `position: static` and 4,639px tall                                        | Visibility of system status    |
| Everything is shown at once                                | One column: Start, 11 knobs, 202 contrast pairs, 17 token groups (165 rows, about 255 more inputs when opened), 5 export files         | Minimalist design              |
| The words are the system's                                 | "Knobs", "brand 600", "chroma", "semantic token", "alias", "DTCG", "resolver", "pnpm", "foundations.css", "override"                   | Match with the real world      |
| Choices are numbers                                        | Radius, shadow, density and motion are multipliers typed into number boxes                                                             | Recognition over recall        |
| Work is easy to lose                                       | One draft; a new starting theme "clears every knob and override" without asking; no undo                                               | User control; error prevention |
| Accessibility problems are reported, not explained         | "text-on-brand on surface-brand (needs 4.5:1)"; no fix                                                                                 | Help users recover from errors |
| The export only fits this repository                       | Five files plus instructions for `tokens/themes/custom/` and `pnpm tokens:build`                                                       | Flexibility                    |
| The preview is a specimen sheet                            | Every input state and four tall banners                                                                                                | Match with the real world      |
| Component pages are code dumps                             | `/components/forms` is 8,046px (10.5 screens); 5 code blocks, 288 lines, 66% of the page; no copy button, on-page navigation or search | Minimalist design              |
| The home page sells the author, not the tool               | "I design and build token-driven systems", "Get in touch"                                                                              | Clear primary task             |

## 2. Evidence and assumptions (no invented user data)

- **Known:** the measurements above; the maintainer's own experience ("found everything, not friendly"); what two competing builders do (section 5.5). No analytics, no observed users.
- **Assumed until tested:** that makers, non-coding designers and brand people share these problems; that they understand the new wording; that "design system" is a phrase they would use at all.
- **Tested by:** rounds of six moderated think-aloud sessions run by the maintainer (kit: [`research/usability-test-kit.md`](research/usability-test-kit.md)), plus cookieless page analytics. No result is written before it exists.

## 3. Decisions

From the interview and the review (2026-11-16). Each row is a DECISIONS entry.

| D     | Topic                | Decision                                                                                                                             |
| ----- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| D-104 | Audience             | Everyone (maker, designer, marketer, developer). The least technical person wins in Guided                                           |
| D-105 | Output               | Tokens work anywhere; ready-made components stay React, said plainly                                                                 |
| D-106 | Evidence             | Only the maintainer's own use so far; needs are assumptions until tested                                                             |
| D-107 | Site identity        | Product-first; portfolio text moves to About                                                                                         |
| D-108 | Flow                 | **Guided** by default + **Studio**, same project. Guided is an expanding step list, not page-per-step                                |
| D-109 | Depth                | Look and feel only, on the fixed components                                                                                          |
| D-110 | Ways to start        | Ready-made look, brand colour, three questions, on one screen. No AI                                                                 |
| D-111 | Preview              | Real example pages + an "All components" sheet                                                                                       |
| D-112 | Hand-off             | Share link; printable style guide; a design-tool tokens file (a tool is named only once its import is verified)                      |
| D-113 | Developer install    | One file per stack with three lines of instructions. No CLI                                                                          |
| D-114 | Saving               | Named projects in the browser, undo/redo, duplicate, file export/import. No accounts                                                 |
| D-115 | Contrast             | Plain warning + "Fix it for me"; export stays possible                                                                               |
| D-116 | Components pages     | Gallery first, one page per component, code on demand, props table. A quick win now, the full gallery after launch                   |
| D-117 | Teaching             | Plain steps with "why it matters" at launch; glossary page, inspect and "how it fits together" after launch                          |
| D-118 | Dark mode            | Release 3; the Builder is built mode-ready                                                                                           |
| D-119 | New controls         | Package first; only RadioCard, Slider, ToggleGroup, AlertDialog until another need is proven                                         |
| D-120 | Name                 | "Builder"; nav "Build"; `/build`; `/playground` redirects at launch                                                                  |
| D-121 | Guided controls      | Picture choices with an optional fine-tune slider                                                                                    |
| D-122 | Fonts                | Curated pairings and "my own font" at launch; any Google Font after launch                                                           |
| D-123 | Export formats       | CSS variables, DTCG file and package theme at launch; Tailwind v4, shadcn/ui, JSON/TypeScript after launch                           |
| D-124 | Google Fonts loading | Proxied through our own site                                                                                                         |
| D-125 | Step order           | Start, Colour, Typography, Shape, Spacing, Depth and motion, Check, Use it. Depth and motion is optional; Use it is always reachable |
| D-126 | Phones               | Guided phone-ready; Studio desktop-first but reflows                                                                                 |
| D-127 | Measuring            | Usability rounds + cookieless analytics; judged by severity, not percentages                                                         |
| D-128 | Site theming         | Tool chrome stays neutral; only previews and examples wear the user's system                                                         |
| D-129 | Order of work        | Quick wins, Builder, home at launch, Studio, teaching, gallery                                                                       |
| D-130 | Tests                | The maintainer moderates; 6 people per round, 2 per audience                                                                         |
| D-131 | Roadmap              | Builder = Release 2; dark mode = Release 3                                                                                           |
| D-132 | Product name         | Keep "UI Design System" for now                                                                                                      |
| D-133 | Spelling             | British in the UI; code stays `color`                                                                                                |
| D-134 | Analytics            | Vercel Web Analytics                                                                                                                 |
| D-135 | Props data           | A generated JSON file in the package, built when the gallery needs it                                                                |
| D-136 | Colour step          | Brand, highlight, background feel                                                                                                    |
| D-137 | Type step            | Pairing + text size; full type control is a later "developer mode"                                                                   |
| D-138 | Example pages        | Landing page, Sign-up form, Settings screen, Article, All components                                                                 |
| D-139 | Credit               | One comment line in exported files; a small footer on the style guide                                                                |
| D-140 | Validation           | Build the Guided builder fully, then test (the maintainer's choice)                                                                  |
| D-141 | Quick wins           | First, on today's pages                                                                                                              |

Also: D-142 (where these documents live), D-143 (working rules), D-144 (untrusted input), D-145 (corrections made in S36).

## 4. The product

### 4.1 Principles

1. **You always have a complete design system.** The first choice already produces a valid one; every later step only refines it. Nothing is required before "Use it".
2. **The whole system is always in view.** Every decision and its current value is visible; one is open at a time; the preview is pinned.
3. **Plain words first, exact values second.** Guided never shows a token name; Studio shows all of them.
4. **Pictures over numbers; recognition over specification.** Named options you can see, and "Try another combination" for people who do not know what they want yet.
5. **Nothing is lost.** Projects, undo/redo, and a question before anything destructive.
6. **Accessible by construction.** Problems are explained in a sentence and fixed in one click.
7. **The tool is not the work.** Tool chrome is fixed and neutral.
8. **Same choice, same result,** whichever look you started from.
9. **Help sits beside the choice, never on top of it.**

### 4.2 Site map

| Route                                    | Purpose                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/`                                      | Product home: what it is, one action, a live four-look demo (at launch)                                |
| `/build`                                 | Continue a project or start a new one                                                                  |
| `/build/start` … `/build/use`            | The Guided panel with that step open. One URL per step keeps Back, deep links and the page-view funnel |
| `/build/studio`                          | Studio view of the same project                                                                        |
| `/build/guide`                           | The generated style guide (prints to PDF)                                                              |
| `/build/shared#d=…`                      | Read-only view of a shared system with "Save a copy"                                                   |
| `/components`, `/components/<component>` | Gallery (after launch); category URLs redirect                                                         |
| `/learn`                                 | Glossary and "how it fits together" (after launch)                                                     |
| `/about`                                 | Today's portfolio text, contact, privacy note                                                          |
| `/playground`                            | Stays live until launch, then redirects to `/build`                                                    |

Header at launch: **Build · Components · About**, and "Showing examples in: [My design system ▾]" in place of the "Theme" switcher (it never restyles the chrome).

### 4.3 The Guided panel (expanding step list)

- **One panel, eight rows.** Each row shows its name and current choice in words and a small visual ("Colour ● ● warm greys", "Corners: Soft"). The open row holds the picture choices; the others stay collapsed but readable. The panel doubles as the running summary.
- **Each open step has the same anatomy:** a plain question, one sentence on what the decision is, one on where it shows up, the choices, an optional "Fine-tune", and a "Why it matters" line shown beside or below, never over the controls.
- **Buttons say where they go:** "Next: Typography", not "Next". "Use it" is always available in the top bar.
- **Top bar:** project name (rename in place), view switch `Guided | Studio`, Undo / Redo, "Try another combination", a status pill ("Readable" / "2 things to fix"), "Use it".
- **Wide container:** panel on the left, preview pinned on the right, each scrolling on its own. **Narrow container / phone:** preview pinned on top (collapsible), the same list below.
- The parts of the preview that the open step affects are outlined.
- Returning visitors land on their last project with the step they left open.

### 4.4 Steps

| #   | Step                        | Question                          | Choices                                                                                                                                                                                                                                                                                                                                                                                                                                               | Sets                            |
| --- | --------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | Start                       | How do you want to begin?         | **One screen:** an optional brand colour (type, paste, pick, or choose from an image read in the browser and never uploaded); four look thumbnails that redraw live in that colour (Base "quiet and neutral", Corporate "crisp and businesslike", Nature "warm and calm", Quirky "bold and playful"); a link "Not sure? Answer three questions" (Mood, Room, Corners) that selects a thumbnail and says why. Two sentences on what a design system is | `start`, `brand`, presets       |
| 2   | Colour                      | What are your colours?            | Brand colour (swatch, hex field, picker; generated shades shown as a strip) · Highlight colour (three or four suggestions, or your own) · Background feel (Cool / Neutral / Warm / Tinted to brand). A readability line under each colour                                                                                                                                                                                                             | `brand`, `accent`, `neutral`    |
| 3   | Typography                  | How should words look?            | Pairing cards drawn in their own typefaces · "I have my own font" (type its name; the preview uses a labelled stand-in) · Text size: Compact / Standard / Large                                                                                                                                                                                                                                                                                       | fonts, type preset, `typeScale` |
| 4   | Shape                       | Sharp or round?                   | Corners: Sharp / Soft / Rounded / Extra round · Outline: Thin / Bold                                                                                                                                                                                                                                                                                                                                                                                  | shape preset                    |
| 5   | Spacing                     | How much room should things have? | Compact / Comfortable / Spacious. A note that buttons always stay easy to tap                                                                                                                                                                                                                                                                                                                                                                         | spacing preset                  |
| 6   | Depth and motion (optional) | Flat or layered? Calm or lively?  | Shadows: Flat / Crisp / Soft / Hard · Motion: Quick / Standard / Calm / Bouncy with a Play button                                                                                                                                                                                                                                                                                                                                                     | depth, motion presets           |
| 7   | Check                       | Can everyone read and use it?     | See 4.5                                                                                                                                                                                                                                                                                                                                                                                                                                               | fixes adjust colours            |
| 8   | Use it                      | Take it with you                  | See 4.6                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                               |

**Where picture choices get their values.** Each option takes one dimension from one of the four shipped looks, whose values were already reviewed and are checked in CI. Verified feasible: a theme has 95 themeable values in clean groups (colours 37, type scale 16, font families 2, sizes 14, spacing 10, radius 4, border and ring 4, motion 4, shadows 2 plus their 2 elevation copies). Spacing Compact / Comfortable / Spacious = Corporate / Base / Nature; Corners = Corporate / Base / Nature / Quirky radii; Shadows Crisp / Soft / Hard = Corporate / Nature / Quirky; Motion = Corporate / Base / Nature / Quirky; Text size = Corporate / Base / Nature. "Flat" shadows is the only new value. "Fine-tune" is today's multiplier applied on top. **Option names are drafts** to be probed in the first test round and approved by the maintainer.

**"Try another combination"** picks another valid mix of presets, keeps colours unless asked not to, and is one undo step.

### 4.5 Check (readability)

- Grouped by **cause**: "Your brand colour is too light for white text. 14 places are affected, for example main buttons." Each has a sample of the exact pair, **Show me** and **Fix it for me**.
- **Fix it for me** moves the colour to the nearest shade that passes (same hue), shows before and after, and can be undone. A property test proves a fix exists for every hue.
- When all pass: "All 202 combinations are readable (WCAG AA)". "Technical details" keeps ratios and pair names.
- The status is always visible in the top bar and under each colour control, so Check confirms rather than surprises.

### 4.6 Use it

1. **Share it:** "Copy link". The system travels in the part of the URL after `#`, which browsers do not send to servers. The page says plainly that the link is a **snapshot**: later changes need a new link. Opening one shows it read-only, labelled as someone else's, with "Save a copy".
2. **Show it:** the style guide (`/build/guide`): colours with plain names, hex values and "use for", type specimens, shape, spacing, shadows, motion, sample components, an accessibility summary, a credit footer. "Save as PDF" is the browser's print.
3. **Design with it:** one DTCG tokens file. Import steps are published per tool only after being done by hand once in that tool.
4. **Build with it:** at launch, tabs `Any site (CSS variables) · @puranderdua/ui`; after launch `Tailwind v4 · shadcn/ui · JSON / TypeScript`. One file each, Copy and Download, at most three lines of instructions, the font snippet, a credit comment. The CSS tab states that it carries the decisions, not components.

A banner links to Check if anything fails; export stays possible. The five-file theme-folder export moves to Studio as "Advanced export" (its round-trip test stays).

### 4.7 Studio (after launch; desktop-first)

Today's four panels are hosted at `/build/studio` unchanged from launch, so experts lose nothing. The rebuild (sections by topic, exact values, changed marks with per-control reset, a searchable table of the 165 roles with descriptions, import, advanced export) is re-planned after the launch test. tweakcn's layout (category tabs, search, undo/redo, Reset, Import, Share, Code) is the reference.

### 4.8 Preview

- Tabs: **Landing page · Sign-up form · Settings screen · Article · All components**, built only from package components. Width switch Phone / Tablet / Desktop (works because package layout follows the container).
- **Accessibility rules for the preview:** it is one labelled region placed after the panel in DOM order; a skip link passes it; examples contain no `main`, `nav` or `header` landmarks and their headings start below the tool's; example links and forms never navigate or submit.
- A slot for Light / Dark is reserved, hidden until Release 3.

### 4.9 Projects, undo and sharing

Several named projects in `localStorage`; today's draft is migrated into "My design system". Undo/redo per project (a slider drag is one step). Duplicate, rename, delete with a confirmation dialog. Project file export/import. Clear messages when storage is blocked or full.

### 4.10 Words and content

- All Builder copy lives in one data file, so it can be reviewed, tested and later translated without touching components.
- **Rules:** second person; short sentences; one idea per sentence; say what it does before what it is called; no word from the banned list in Guided (token, semantic, primitive, alias, DTCG, ramp, chroma, hue, knob, override, resolver); errors are a sentence plus a suggestion.
- **Draft vocabulary** (probed in the first test round by asking "what would you expect this to change?"):

| Today                                    | Draft                           |
| ---------------------------------------- | ------------------------------- |
| Playground / Knobs                       | Builder / steps and choices     |
| Starting theme                           | Starting look                   |
| Brand 600 / Accent                       | Brand colour / Highlight colour |
| Neutral hue and chroma                   | Background feel                 |
| Radius scale / Border width              | Corners / Outline               |
| Density / Shadow strength / Motion speed | Spacing / Shadows / Motion      |
| Contrast pairs                           | Readability check               |
| Advanced, semantic tokens                | Studio › All tokens ("roles")   |
| Export                                   | Use it                          |

### 4.11 Accessibility of the tool (WCAG 2.2 AA, criteria verified against W3C)

- The step list is an ordered list of links with `aria-current="step"`; each step has its own page title; focus moves to the open step's heading (2.4.2, 2.4.3).
- Picture choices are radio groups in a `Fieldset` with a text label and a non-colour selected mark (1.4.1, 1.3.1).
- Sliders work by keyboard and by clicking the track and show their value in words; every colour has a text field beside the picker (2.5.7 Dragging Movements, AA).
- Targets at least 24px (2.5.8, AA); pinned bars never hide the focused control (2.4.11, AA); 320px and 200% zoom without sideways scroll (1.4.10).
- Preview changes are announced politely and debounced (4.1.3). Help is in the same place in every step (3.2.6, A). Nothing is asked twice (3.3.7, A). Motion demos respect reduced motion.
- Axe runs on every `/build` step, the style guide and the shared view in Chromium, Firefox and WebKit; the screen-reader script is repeated for the Builder.

### 4.12 After launch (sized, not specified)

Studio rebuild; Tailwind v4, shadcn/ui and JSON formats; any Google Font; glossary page; inspect the preview; "how it fits together"; the full gallery with per-component pages and props tables. Each is re-planned at its kickoff using the launch test's findings.

## 5. Technical approach

### 5.1 Reuse (do not rewrite)

| Existing                                                                      | Used for                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/site/src/playground/engine.ts` (`resolveTheme`, `applyKnobs`)           | Stays the resolver; gains presets, `typeScale`, flat shadows |
| `ramps.ts` (`brandRamp`, `neutralRamp`)                                       | Highlight suggestions, background feel, the contrast fix     |
| `contrast.ts`, `data.ts` (`contrastSpec`, `themeMaps`)                        | Check, status pill; `themeMaps` supplies preset values       |
| `state.ts` (`parseState`, `sanitiseKnobs`, `migrate`, `stateVersion`)         | Version 2 migration; tightened for untrusted input           |
| `store.ts` (`useSyncExternalStore`, storage event)                            | Projects store                                               |
| `output.ts`, `export.ts`, `export.test.ts`                                    | Advanced theme-folder export and round-trip test, unchanged  |
| `fonts.ts`, `previewVars`                                                     | Curated pairings, custom font names                          |
| `demos/registry.ts`, `components/example.tsx` (`readDemo`)                    | Collapsed code now; gallery later                            |
| `ThemeScope`, `ScopedPortal`, `Tabs`, `RadioGroup`, `Fieldset` (package)      | Preview, thumbnails, example scopes, quick wins              |
| `lib/theme.ts`                                                                | Becomes the "Showing examples in" store                      |
| `scripts/validate-tokens.mjs`, `scripts/lib/dtcg.mjs`, `scripts/contrast.mjs` | Value formats for the grammar; DTCG validation in tests      |

The engine folder keeps its name (`src/playground`); renaming internal folders gives users nothing.

### 5.2 New in the site

- `state.ts` v2: `{ version: 2, start, mode: "light" (reserved), dims, knobs, fonts, overrides }`; `projects.ts`; `history.ts`.
- `presets.ts` (dimension-from-look, three questions, shuffle); `explain.ts`; `fix.ts`.
- `grammar.ts`: one allow-list parser per token type (colour, dimension, duration, easing, shadow, font family, number). Anything else is dropped on load and refused on export.
- `formats/css-vars.ts`, `formats/dtcg-file.ts` at launch; `tailwind.ts` (reusing the `@theme inline` bridge read from the installed package's `foundations.css`, so it cannot drift), `shadcn.ts`, `json.ts` after launch.
- `share.ts`: state → compressed base64url in the URL hash (native `CompressionStream`) and back through the grammar.
- `content/builder.ts`: all copy.
- Routes under `src/app/build/`, UI under `src/components/builder/`.

### 5.3 Security and privacy (D-144)

- **Untrusted input** (share links, project files, stored state): parsed through the grammar; project and font names are plain text with a length limit and a strict character set; nothing imported is ever written as HTML. Today `parseState` accepts any string for any `--ds-*` override and `toCss` writes `key: value;` raw, so a crafted value could add rules to a downloaded file; S48 closes this.
- **Exports** re-validate every value. Tests use payloads such as `;}`, `url(`, `@import`, `</style>`.
- **The shared view** is labelled as someone else's work and never overwrites local projects.
- **Font proxy** (after launch): catalogue allow-list, fixed upstream hosts and path pattern, GET only, size and time limits, long caching, a rate-limit rule. The CSP keeps `font-src 'self'`.
- **Analytics:** `beforeSend` removes the URL hash, so a shared design never reaches analytics. A short privacy note says what is counted.
- Images used to pick a colour are read in the browser and never leave it.

### 5.4 Performance

- Preview updates change CSS variables on the scope; the contrast run is deferred so dragging stays responsive. **Budget:** interaction latency under 200 ms while dragging a slider or picking a colour, on a mid-range laptop profile.
- Studio, the style guide and (later) the font catalogue load on demand. `/build` JavaScript size is recorded at each milestone against today's `/playground` (271.8 KB gzip in H18).

### 5.5 Facts verified during the review (2026-11-16)

| Topic                                     | Verified                                                                                                                                                                                        | Consequence                                                                                                                                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel Web Analytics (docs, 2026-08-25)   | Hobby: 50,000 events a month, a 1-month reporting window, **no custom events**. The script and endpoints are same-origin paths. `beforeSend` can edit or drop an event                          | The funnel must come from step URLs as page views. Monthly figures are copied into `docs/research/`. No CSP host needs adding (confirmed again in S37)                                                    |
| shadcn/ui theming (docs)                  | 32 variables in `oklch()`, mapped with `@theme inline`, dark values under `.dark`. `--accent` sits with the action and state colours, not as a brand colour                                     | Our highlight colour must not simply map to `--accent`; how shadcn components use it is confirmed in the format session before the mapping is fixed. The export is light-only until Release 3 and says so |
| Tailwind v4 (docs)                        | `@theme` must be top-level; `@theme inline` is for values that reference other variables; namespaces `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--spacing-*` | The Tailwind export is the theme variables plus the package's own bridge                                                                                                                                  |
| WCAG 2.2 (W3C)                            | New AA: 2.4.11, 2.5.7, 2.5.8; new A: 3.2.6, 3.3.7. 4.1.1 removed                                                                                                                                | Section 4.11 cites the right criteria                                                                                                                                                                     |
| NN/g, test users                          | 5 users for qualitative work; 3 to 4 per distinct group; at least 20 for numbers; many small rounds beat one big one                                                                            | Section 6                                                                                                                                                                                                 |
| NN/g, wizards                             | For novice or infrequent tasks; name buttons by destination; show the whole process; allow leaving and resuming; keep help beside the fields                                                    | Sections 4.1 and 4.3                                                                                                                                                                                      |
| shadcn/create (in the browser)            | About ten named choices in one side panel, a realistic preview with page switcher, a short preset code, Shuffle with Lock, "Get Code"                                                           | Expanding list, "Try another combination", share link                                                                                                                                                     |
| tweakcn (in the browser)                  | Category tabs, search, undo/redo, Reset, Import, Share, Code; preview tabs Cards / Dashboard / Application / Marketing; light/dark toggle                                                       | Reference for Studio; confirms dark mode is our largest competitive gap                                                                                                                                   |
| Adobe Leonardo (package docs, via search) | Generates colours from target contrast ratios, and still re-checks the result                                                                                                                   | Our fix must also re-check after adjusting; property test added                                                                                                                                           |
| Story usage notes (repo, H20c)            | All 22 story files carry a developer-facing usage and accessibility note in `docs.description.component`                                                                                        | The gallery can reuse them for its "For developers" part; the plain "what it is, use it when" lines are still to be written                                                                               |
| **Not verified**                          | Native DTCG import in Figma (only secondary sources); Google Fonts' own privacy and licence wording (the page could not be read)                                                                | Stated as open in section 7; neither is promised in the UI until checked                                                                                                                                  |

### 5.6 Package (`@puranderdua/ui` 1.0.0; D-148: the four components ship in the first stable release)

**RadioCard** (picture choice), **Slider** (fine-tune), **ToggleGroup** (preview width), **AlertDialog** (confirm delete and start over). Each adapted from shadcn new-york-v4 with a provenance doc, an individual `@radix-ui/react-*` package, and the per-component checklist in `PLAN.md` (tests, axe, story, hit area, string props, contrast matrix for any new role with a default alias, D-095). Meta files (`./meta/components.json`, `./meta/tokens.json`) ship in a later minor, when the gallery and inspect need them.

**Dependencies to approve, each in its session:** `@radix-ui/react-slider`, `@radix-ui/react-toggle-group`, `@radix-ui/react-alert-dialog` (package); `@vercel/analytics` (site). After launch, when needed: `react-docgen-typescript` (package, dev).

## 6. Research and measures

- **Rounds:** T0 on the quick-wins site, T1 on the Builder before launch, T2 before the release closes. Six people each, two per audience, moderated think-aloud, about 30 minutes. A pilot session comes first. The moderator does not explain or lead; the kit says how.
- **What a round produces:** a list of problems, each with a severity (critical: cannot finish; serious: finishes with help or a wrong result; minor: hesitation or annoyance), the words people used for things, and quotes. No percentages are reported from six people.
- **Launch gate:** no open critical or serious problem from T1 or the independent review.
- **Vocabulary gate:** a term that two or more of six people misread in T0 is renamed before S44 closes.
- **Analytics (direction, not proof):** page views of `/build/start` through `/build/use` show where people stop. Hobby keeps one month, so figures are copied monthly into `docs/research/`.
- **Engineering measures:** preview always visible; the Guided panel needs no more than a short scroll at 1024×768; interaction latency under budget; axe and the screen-reader script clean.

## 7. Risks and open items

- **No prototype before the full build** (D-140). If T1 rejects the Guided model, M17's interface work is at risk; the engine, content, package controls and formats survive. Reduced by testing the quick-wins version first (it carries the new wording and the pinned preview), by the dark launch, and by leaving everything after launch unspecified until test results exist.
- **Dark mode is the largest competitive gap** (both builders examined have it). It stays in Release 3 and is revisited at launch if T1 participants ask for it.
- **Light brand colours** (yellow, lime) only get "nearest passing shade". "Keep my colour, use dark text" needs role re-mapping and is parked.
- **Design-tool import is unverified.** The DTCG file is standard (2025.10, stable); which tools import it natively is checked by hand before any tool is named in the UI.
- **Google Fonts terms** could not be read during the review; the proxy session starts by reading them. If proxying is not acceptable, curated self-hosted fonts remain the offer.
- **shadcn mapping is lossy** and light-only; the export says both.
- **Analytics on Hobby:** 50,000 events a month across the account; collection pauses beyond that.
- **No screenshot suite** (D-102 stands, D-145). The maintainer built and removed one in H19. The Builder changes looks on purpose, so drift is checked by computed-style assertions in e2e; a small curated set is reconsidered only if visual drift becomes a problem.
- **No client error reporting.** Open decision for after launch; today the error boundary and `safeResolve` are the only net.
- **Open for the maintainer:** final option names, the home headline, the product name.

## 8. Out of scope for Release 2

AI-generated starts; accounts or cloud save; a CLI; a zip pack; per-component style choices and choosing building blocks; dark mode; components for other frameworks; first-class type controls ("developer mode"); renaming the product; translation (the copy file only makes it possible later).

## 9. Review record: what the first draft got wrong

The first draft of this plan was reviewed against primary sources, two competing builders and this repo's history before approval. What changed:

| #   | Problem in the first draft                                                     | Evidence                                                                                                                                                                | Change                                                                                              |
| --- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | Value arrived late: the first visible improvement came after about 15 sessions | Five of the ten measured problems need no new component                                                                                                                 | A quick-wins milestone ships first                                                                  |
| 2   | A page-per-step wizard was assumed                                             | NN/g (paraphrased): wizards make it harder to compare across steps and limit control and creativity. shadcn/create and tweakcn keep every top-level choice in one panel | Guided is an expanding step list                                                                    |
| 3   | The estimate ignored this repo's history (34 sessions, no review time)         | Release 1: 23 feature sessions produced 98 audit findings and needed 26 review and hardening sessions                                                                   | Review and fix sessions are budgeted: about 50 sessions, launch at 28; time per session is recorded |
| 4   | False precision: 34 sessions specified before any user evidence                | Rolling-wave planning is standard                                                                                                                                       | Sessions are specified only up to launch                                                            |
| 5   | Package scope creep: eight new components                                      | Only four have a concrete use                                                                                                                                           | RadioCard, Slider, ToggleGroup, AlertDialog                                                         |
| 6   | Statistically weak measures ("4 of 5 complete")                                | NN/g: numbers need at least 20 users                                                                                                                                    | Six people per round, judged by severity                                                            |
| 7   | "For everyone" had no tie-break                                                | No rule when audiences conflict                                                                                                                                         | The least technical person wins in Guided                                                           |
| 8   | A security hole in sharing                                                     | `parseState` and `toCss` pass raw strings                                                                                                                               | A strict value grammar on load and export                                                           |
| 9   | The preview would damage the tool's own accessibility                          | Example pages bring headings, landmarks and about 30 tab stops                                                                                                          | Preview rules in 4.8                                                                                |
| 10  | Facts were deferred                                                            | Checked now (5.5); two claims were wrong or unproven                                                                                                                    | Corrected; unverified items listed                                                                  |
| 11  | No content design step                                                         | The vocabulary was a guess                                                                                                                                              | One copy file, written rules, terms probed in T0                                                    |
| 12  | Long-lived branches and late deploys                                           | Retro: production sat on a 24-day-old build                                                                                                                             | One PR per session, dark launch, a real-deployment test per milestone, an independent review        |
| 13  | No performance budget                                                          | A live preview needs one                                                                                                                                                | An input-latency budget (5.4)                                                                       |
| 14  | Exploration was not supported                                                  | shadcn/create's Shuffle with Lock                                                                                                                                       | "Try another combination"                                                                           |
| 15  | Too many formats and fonts before launch                                       | Six formats and a font proxy on the critical path                                                                                                                       | Launch with three formats and curated fonts                                                         |

## 10. Sources

- [NN/g: How many test users](https://www.nngroup.com/articles/how-many-test-users/) · [NN/g: Wizards](https://www.nngroup.com/articles/wizards/) · [NN/g: Progressive disclosure](https://nngroup.com/articles/progressive-disclosure/) · [NN/g: Design systems 101](https://www.nngroup.com/articles/design-systems-101/)
- [W3C: What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [Vercel Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing) · [@vercel/analytics configuration](https://vercel.com/docs/analytics/package)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) · [shadcn/create](https://ui.shadcn.com/create) · [tweakcn editor](https://tweakcn.com/editor/theme)
- [Tailwind CSS v4 theme variables](https://tailwindcss.com/docs/theme)
- [DTCG first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [Adobe Leonardo](https://npmjs.com/package/@adobe/leonardo-contrast-colors) · [Material Theme Builder](https://github.com/material-foundation/material-theme-builder)
