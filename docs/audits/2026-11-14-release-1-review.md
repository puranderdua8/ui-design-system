# Release 1 review — 2026-11-14

An independent review of the whole repository after Release 1 (`@puranderdua/ui@0.8.0`, site with showcase, themes and playground), held to a **semver 1.0.0** bar for **outside consumers** on React 19 + Tailwind v4 (D-087). Review only: nothing is fixed here. The plan and the session prompts (R1–R6) are in [`docs/PLAN.md`](../PLAN.md#mr-release-1-review-100-readiness).

**How to use this register:** each R-session adds its findings with evidence. A suspicion goes under "Leads" until it is checked; R6 empties that list. After the maintainer approves the hardening milestone proposed at the end, its sessions set each row's status to `fixed in <session>` (or `accepted` with a D-number), as in the [2026-10-20 audit](2026-10-20-production-readiness.md).

- **Kind:** `defect` (wrong behaviour or a broken contract), `recommendation` (works, but falls short of 1.0.0 practice), `revisit` (challenges a recorded decision, with new evidence and the D-number).
- **Severity:** **Blocker** (no 1.0.0), **High** (fix before building more on it), **Med**, **Low**.
- **Areas:** A Architecture and design principles · B Component API design · C React · D State management (site) · E Next.js · F Performance · G Packaging and distribution · H Styling and tokens · I Dark-mode readiness · J Accessibility beyond axe · K Testing strategy · L Security and supply chain · M DX and docs · N Tooling, CI and process.
- **Reference:** how shadcn/ui, Radix Themes, Primer, Carbon or Spectrum handle the same thing, where it helps. Reference only, not a target.

## Baseline (R1)

_Filled in R1._

## Findings

| ID  | Area | Kind | Sev | Finding | Evidence | Reference | Proposed fix | Status |
| --- | ---- | ---- | --- | ------- | -------- | --------- | ------------ | ------ |

## Leads (to check)

Suspicions noted while planning; each becomes a finding or is dismissed with a reason.

- G: `dts` is built from `src/index.ts` only; check what that means for consumers and subpath imports.
- G: one barrel (`index.ts`) plus per-component entries and no component subpath exports; check what a single `Button` import pulls in.
- C: `ThemeScope` provides `null` as the portal container on its first render (element held in state, set by the ref).
- D: the playground store (`apps/site/src/playground/store.ts`) has no cross-tab sync and no version on the stored shape.
- N: `docs/DECISIONS.md` is about 308 KB in 92 lines (table cells padded to the widest row).
- N: `docs/PLAN.md` Goal 2 and the M11 row still say 0.7.0; the package is 0.8.0 (D-086).
- N/E: Git deployments are off (D-057); production once ran a 24-day-old build (H10).

## Probe notes (R1)

_Tool output that is not a finding, with why._

## Scorecard (R6)

_One line per area: rating, the main strengths, the main gaps._

## Proposed hardening milestone (R6)

_Sessions with prompts, for the maintainer to approve._
