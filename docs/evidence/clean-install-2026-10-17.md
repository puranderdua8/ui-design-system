# Clean-install evidence — 2026-10-17

Gate D. Produced by `scripts/clean-install.sh` against the live registry. Result: **PASS** (exit 0). The create-next-app output is trimmed.

```text
registry=https://ui-design-system-registry.vercel.app version=0.1.0 shadcn=4.22.0
node=v26.11.0 npm=11.20.0

==> Registry is reachable
ds-button.json ok: 1 file(s)

==> create-next-app (TypeScript, Tailwind, App Router, src dir, npm)
  (create-next-app output trimmed)
==> shadcn init
- Preflight checks.
✔ Preflight checks.
- Verifying framework.
✔ Verifying framework. Found Next.js.
- Validating Tailwind CSS. Found v4.
✔ Validating Tailwind CSS. Found v4.
- Validating import alias.
✔ Validating import alias.
- Writing components.json.
✔ Writing components.json.
- Checking registry.
✔ Checking registry.
- Installing dependencies.
- Installing dependencies.
✔ Installing dependencies.
- Updating fonts.
✔ Updating fonts.
- Updating files.
✔ Created 2 files:
  - src/components/ui/button.tsx
  - src/lib/utils.ts
- Updating src/app/globals.css
✔ Updating src/app/globals.css

Project initialization completed.
You may now add components.


==> Register @puranderdua in components.json

==> shadcn add ds-typography ds-button
- Checking registry.
✔ Checking registry.
- Installing dependencies.
- Installing dependencies.
✔ Installing dependencies.
- Updating files.
✔ Created 5 files:
  - src/lib/generated/ds-classes.ts
  - src/lib/types.ts
  - src/styles/ds-foundations.css
  - src/components/ui/text.tsx
  - src/components/ui/heading.tsx
ℹ Updated 2 files:
  - src/lib/utils.ts
  - src/components/ui/button.tsx
This replaces lib/utils.ts with a cn() that understands the ds-* classes. The CLI asks before overwriting an existing file.
Import it once in your globals.css, after Tailwind: @import "tailwindcss"; @import "../styles/ds-foundations.css"; (adjust the relative path to where globals.css sits; with a src/ directory it lands in src/styles/).


==> Foundations import
2:@import "../styles/ds-foundations.css";

==> Page using the registry components

==> npm i @puranderdua/ui@0.1.0 and a second route using the package Button

added 1 package, and audited 602 packages in 1s

234 packages are looking for funding
  run `npm fund` for details

9 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.

==> next build
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.ts took 98ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 2.9s
  Running TypeScript ...
  Finished TypeScript in 1278ms ...
  Collecting page data using 6 workers ...
  Generating static pages using 6 workers (0/5) ...
  Generating static pages using 6 workers (1/5) 
  Generating static pages using 6 workers (2/5) 
  Generating static pages using 6 workers (3/5) 
✓ Generating static pages using 6 workers (5/5) in 339ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
└ ○ /package


○  (Static)  prerendered as static content


==> Built CSS contains the design-system classes
found text-ds-primary-fg
found bg-ds-primary
found ds-focus-ring

==> Local edit survives re-adding ds-button (no silent overwrite)
- Checking registry.
✔ Checking registry.
- Updating files.
? The file button.tsx already exists. Would you like to overwrite? › (y/N)
exit status: 0
OK: local edit preserved

==> PASS
```
