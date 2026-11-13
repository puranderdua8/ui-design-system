# Clean-install evidence — 2026-11-13

Produced by `scripts/clean-install.sh` against the published npm package. Result: **PASS**.

```text
version=0.6.0 create-next-app=16.4.2
node=v26.11.0 npm=11.20.0

==> Checker tools (axe-core, jsdom) outside the app

==> create-next-app 16.4.2 (TypeScript, Tailwind, App Router, src dir, npm), package only
Creating a new Next.js app in /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.YiiQ6V/app-package.

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

added 360 packages, and audited 367 packages in 18s

147 packages are looking for funding
  run `npm fund` for details

7 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.

Generating route types...
✓ Types generated successfully

Skipping git initialization.

Success! Created app-package at /private/var/folders/c9/0kwyypzd7y9bj_ns0xq37d4w0000gn/T/ds-clean-install.YiiQ6V/app-package

A new version of `create-next-app` is available!
You can update by running: npm i -g create-next-app


added 78 packages, removed 1 package, and audited 444 packages in 8s

149 packages are looking for funding
  run `npm fund` for details

7 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.

==> next build (app-package)
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.ts took 16ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 2.2s
  Running TypeScript ...
  Finished TypeScript in 1066ms ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
  Generating static pages using 5 workers (1/4)
  Generating static pages using 5 workers (2/4)
  Generating static pages using 5 workers (3/4)
✓ Generating static pages using 5 workers (4/4) in 223ms
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
▲ Next.js 16.4.2
- Local:         http://localhost:3102
- Network:       http://192.168.1.7:3102
✓ Ready in 76ms
✓ Running next.config.ts took 19ms
GET /
ok: app-package-_.html contains: Package only
ok: app-package-_.html contains: data-slot="button"
ok: app-package-_.html contains: data-slot="heading"
ok: app-package-_.html contains: ds-type-display
ok: app-package-_.html contains: data-slot="field"
ok: app-package-_.html contains: data-slot="input"
ok: app-package-_.html contains: data-slot="card"
ok: app-package-_.html contains: ds-tone-raised
axe: 0 violation(s), 23 rule(s) passed

==> PASS
```
