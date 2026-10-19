# Clean-install evidence — 2026-10-17

Produced by `scripts/clean-install.sh` against the live registry. Result: **PASS**. _Historical: the registry channel was retired in S13 (D-055); the script now tests the package only._

```text
registry=https://ui-design-system-registry.vercel.app version=0.1.0 shadcn=4.22.0 create-next-app=16.4.2
node=v26.11.0 npm=11.20.0

==> Registry is reachable
ds-button.json ok: 1 file(s)

==> Checker tools (axe-core, jsdom) outside both apps

==> App A: create-next-app 16.4.2 (TypeScript, Tailwind, App Router, src dir, npm)
Creating a new Next.js app in /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.VWa9ti/app-registry.

Using npm.

Initializing project with template: app-tw


Installing dependencies:
- next
- react
- react-dom

Installing devDependencies:
- @tailwindcss/turbopack
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next
- tailwindcss
- typescript

npm warn deprecated eslint@9.39.5: This version is no longer supported. Please see https://eslint.org/version-support for other options.

added 358 packages, and audited 359 packages in 8s

146 packages are looking for funding
  run `npm fund` for details

5 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.

Generating route types...
✓ Types generated successfully

Skipping git initialization.

Success! Created app-registry at /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.VWa9ti/app-registry


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

==> shadcn add ds-typography ds-button (stock button.tsx and utils.ts exist, so --overwrite accepts replacing them)
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

ok: button.tsx contains: ds-focus-ring
ok: utils.ts contains: ds-classes

==> Foundations import (registry copy)
ok: globals.css contains: ds-foundations.css

==> Page using the registry components

==> npm i @puranderdua/ui@0.1.0 and a second route using the package

added 1 package, and audited 602 packages in 2s

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

==> next build (app-registry)
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.ts took 103ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 2.9s
  Running TypeScript ...
  Finished TypeScript in 2.3s ...
  Collecting page data using 6 workers ...
  Generating static pages using 6 workers (0/5) ...
  Generating static pages using 6 workers (1/5)
  Generating static pages using 6 workers (2/5)
  Generating static pages using 6 workers (3/5)
✓ Generating static pages using 6 workers (5/5) in 285ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
└ ○ /package


○  (Static)  prerendered as static content


==> Built CSS (app-registry) contains the design-system classes and tokens
ok: app-registry.css contains: text-ds-primary-fg
ok: app-registry.css contains: bg-ds-primary
ok: app-registry.css contains: h-ds-control-md
ok: app-registry.css contains: ds-focus-ring
ok: app-registry.css contains: --ds-color

==> next start (app-registry) and fetch routes
GET /
ok: app-registry-_.html contains: Registry install
ok: app-registry-_.html contains: data-slot="button"
ok: app-registry-_.html contains: data-slot="heading"
ok: app-registry-_.html contains: ds-type-display
⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3101
    at new Promise (<anonymous>) {
  code: 'EADDRINUSE',
  errno: -48,
  syscall: 'listen',
  address: '::',
  port: 3101
}
axe: 0 violation(s), 14 rule(s) passed
GET /package
ok: app-registry-_package.html contains: Package install
ok: app-registry-_package.html contains: data-slot="button"
ok: app-registry-_package.html contains: data-slot="heading"
ok: app-registry-_package.html contains: ds-type-display
axe: 0 violation(s), 14 rule(s) passed

==> Local edit of button.tsx: re-adding ds-button must prompt and not overwrite
- Checking registry.
✔ Checking registry.
- Updating files.
? The file button.tsx already exists. Would you like to overwrite? › (y/N)ok: readd.log contains: already exists
ok: readd.log contains: overwrite
OK: prompted, local edit preserved

==> Accepting the update (--overwrite) restores the registry version
- Checking registry.
✔ Checking registry.
- Updating files.
ℹ Updated 1 file:
  - src/components/ui/button.tsx
ℹ Skipped 4 files: (files might be identical, use --overwrite to overwrite)
  - src/lib/utils.ts
  - src/lib/generated/ds-classes.ts
  - src/lib/types.ts
  - src/styles/ds-foundations.css
This replaces lib/utils.ts with a cn() that understands the ds-* classes. The CLI asks before overwriting an existing file.
Import it once in your globals.css, after Tailwind: @import "tailwindcss"; @import "../styles/ds-foundations.css"; (adjust the relative path to where globals.css sits; with a src/ directory it lands in src/styles/).

OK: button.tsx matches the registry copy again

==> App B: create-next-app 16.4.2, package only (no shadcn, no registry)
Creating a new Next.js app in /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.VWa9ti/app-package.

Using npm.

Initializing project with template: app-tw


Installing dependencies:
- next
- react
- react-dom

Installing devDependencies:
- @tailwindcss/turbopack
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next
- tailwindcss
- typescript

npm warn deprecated eslint@9.39.5: This version is no longer supported. Please see https://eslint.org/version-support for other options.

added 358 packages, and audited 359 packages in 11s

146 packages are looking for funding
  run `npm fund` for details

5 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.

Generating route types...
✓ Types generated successfully

Skipping git initialization.

Success! Created app-package at /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.VWa9ti/app-package


added 6 packages, and audited 365 packages in 1s

148 packages are looking for funding
  run `npm fund` for details

5 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.

==> next build (app-package)
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.ts took 18ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 2.6s
  Running TypeScript ...
  Finished TypeScript in 1115ms ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
  Generating static pages using 5 workers (1/4)
  Generating static pages using 5 workers (2/4)
  Generating static pages using 5 workers (3/4)
✓ Generating static pages using 5 workers (4/4) in 232ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found


○  (Static)  prerendered as static content


==> Built CSS (app-package) contains the design-system classes and tokens
ok: app-package.css contains: text-ds-primary-fg
ok: app-package.css contains: bg-ds-primary
ok: app-package.css contains: h-ds-control-md
ok: app-package.css contains: ds-focus-ring
ok: app-package.css contains: --ds-color

==> next start (app-package) and fetch routes
GET /
ok: app-package-_.html contains: Package only
ok: app-package-_.html contains: data-slot="button"
ok: app-package-_.html contains: data-slot="heading"
ok: app-package-_.html contains: ds-type-display
⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3102
    at new Promise (<anonymous>) {
  code: 'EADDRINUSE',
  errno: -48,
  syscall: 'listen',
  address: '::',
  port: 3102
}
axe: 0 violation(s), 14 rule(s) passed

==> PASS
```
