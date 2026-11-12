# Production-readiness evidence — 2026-11-12 (H10)

Branch `h10`, cut from `main` at `a141967` (H9 merged, #42). Package `@puranderdua/ui@0.5.0`; the site runs 0.5.0. Register: `docs/audits/2026-10-20-production-readiness.md` (F01–F41).

## Definition of Done

| Item                                                     | Result                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                             | exit 0. 184 unit tests (14 files), 84 layout tests (Chromium, Firefox, WebKit), 90 story tests with axe (18 files), `check-client-exports` (7 client files), contrast: 126 pairs per theme meet their minimum, `check-tone-recipes` OK, Storybook build.                  |
| `pnpm check:rsc` (packed tarball)                        | PASS. Server Component page calls every server-safe export; Field and Input are client references, Text and Heading plain elements; `aria-checked="mixed"` in SSR.                                                                                                        |
| `scripts/clean-install.sh`                               | exit 0, PASS: package-only app builds, markup has the Button and Heading slots and `ds-type-display`, axe 0 violations (14 rules).                                                                                                                                        |
| Site e2e against production, Chromium + Firefox + WebKit | **168 passed (168)**, `SITE_URL=https://ui-design-system-beta.vercel.app pnpm --filter site test:e2e`, 53 s. Includes axe, 320px, 200% zoom, landmarks, 404, robots, sitemap, OG image, and the security-header test (over https it asserts `upgrade-insecure-requests`). |
| `pnpm audit --prod --audit-level high`                   | "No known vulnerabilities found".                                                                                                                                                                                                                                         |
| CHANGELOG, READMEs                                       | 0.5.0 entry with Breaking and Migration (H8); package description current (F35).                                                                                                                                                                                          |
| Register has no `open` rows                              | 0 open of 41 (see below).                                                                                                                                                                                                                                                 |

## Production state

Before the H9 redeploy the site was the old S10/S11 build (`age` about 24 days, `/robots.txt`, `/components` returned 404, no CSP). After the maintainer's redeploy `/robots.txt` returns 200 and the response carries `content-security-policy`, `strict-transport-security`, `referrer-policy`, `permissions-policy` and `x-content-type-options`; there is no `x-powered-by` header.

npm shows 0.5.0 with a SLSA v1 provenance attestation (`dist.attestations.provenance.predicateType = https://slsa.dev/provenance/v1`), so F04's first-publish check is confirmed.

## Register re-verification

All 41 rows were already `fixed`; none were reopened. Re-checked in H10:

- **By the full runs above:** F01, F13, F14, F27, F28 (RSC and form tests), F02 (contrast matrix, tone layout tests), F03 and F31 (lint, typecheck), F10, F11, F12, F17 (layout tests in three browsers), F15, F16 (overlay tests, no raw `z-*`), F20, F22 (three browsers, `retries: 0`), F21, F39 (story tests, CSS coverage), F36 (`check:rsc`), F07, F08, F09, F23, F24, F25, F29, F33 (production e2e), F06 (audit).
- **By direct inspection:** F18 (`exports["."]` has `import` then `default`), F32 (`verbatimModuleSyntax`, `exactOptionalPropertyTypes` in `tsconfig.base.json`), F34 (`@types/node ^22`), F35 (description), F37 (no `focusable=`), F31 (no `props as object`), F08 (no `alert(` in `apps/site/src`), F05 (all actions SHA-pinned, `permissions`, `concurrency`, `timeout-minutes` in `ci.yml`), F41 (`node --test .claude/hooks/`: 2 of 2 pass; the hook blocked `cat` and a `>` redirect in this session).
- **Not re-run:** F04's workflow beyond the published provenance (it ran for 0.5.0), F26 (unit test only; the site's inline signup layout is covered by the production e2e), F30, F38, F19 (unit tests, covered by `pnpm check`), F40 (docs).

One known limit stays, accepted by D-074: danger feedback is not re-mapped inside the inverse and brand tones (6 tone × role checks excluded, with a reason in `contrast-pairs.json`); Field errors belong on canvas, subtle or raised surfaces. Tones do not nest (D-074, parking lot, decide in S26).

## Whole-repo review (H10)

Re-run across React, TypeScript, accessibility, security, semantic HTML, architecture and system design. No new findings.

- No `any`, `@ts-ignore`, `eval` or `dangerouslySetInnerHTML` in shipped code; the `@ts-expect-error` hits are all intentional type tests.
- No raw `z-*`, `flex-*-reverse` or `order-*` in package or site source (one comment in `sidebar.tsx` names them).
- No `.env`, key or secret file is tracked.
- Production serves the full header set; the CSP uses `'unsafe-inline'` for scripts by design (D-079: no nonces, so the site stays static).
- Dependencies: `pnpm outdated` shows only minor and major bumps (ESLint 10.14, TypeScript 7, Style Dictionary 5, `@types/node 26`); none is a security fix, and TypeScript 7 and Style Dictionary 5 are held back on purpose (typescript-eslint support; D-020).

## Process notes

- `scripts/clean-install.sh` piped through `tail` leaves the `next start` child holding the pipe open, so the run looks hung long after it passed (already noted in H8). I stopped the leftover server by hand.
