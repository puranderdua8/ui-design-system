# Releasing `@puranderdua/ui`

Releases publish from GitHub Actions (`.github/workflows/release.yml`) with npm provenance, using npm **trusted publishing** (OIDC). There is no npm token anywhere: not in the repo, not in GitHub secrets. The AI never publishes or tags (D-069).

## One-time setup (the maintainer)

### 1. GitHub environment `npm-publish`

Repo → Settings → Environments → New environment → `npm-publish`.

- **Required reviewers:** add `puranderdua8` (yourself). Tick "Prevent self-review" **off**, since you are the only maintainer.
- **Deployment branches and tags:** "Selected branches and tags" → Add rule → type **Tag** → pattern `v*`. Remove any branch rule.
- No secrets and no variables. Leave "Allow administrators to bypass" off.

### 2. npm trusted publisher

npmjs.com → package `@puranderdua/ui` → Settings → Trusted Publisher → GitHub Actions:

| Field             | Value              |
| ----------------- | ------------------ |
| Organization/user | `puranderdua8`     |
| Repository        | `ui-design-system` |
| Workflow filename | `release.yml`      |
| Environment name  | `npm-publish`      |

Then, under "Publishing access", choose **Require two-factor authentication and disallow tokens** so a stolen token cannot publish either. (Trusted publishing keeps working.)

### 3. Check the setup

Push a tag only when you mean to release. To test the guard without publishing, see "Testing the guard" below.

## Release flow (PLAN "Release rhythm")

1. The release-prep session bumps `packages/ui/package.json`, writes the CHANGELOG and opens the PR. Wait for CI (all three browsers, audit, `check-rsc`) to be green.
2. Merge the PR into `main`.
3. Tag the merge commit and push the tag:

   ```bash
   git checkout main && git pull --ff-only
   git tag v0.5.0   # must equal packages/ui/package.json "version"
   git push origin v0.5.0
   ```

4. Open the run in the Actions tab. The `verify` job (no publishing credential) checks the tag against `package.json`, runs `pnpm install --frozen-lockfile`, `pnpm check` and `pnpm check:rsc`, packs the tarball and uploads it as the `package-tarball` artifact. When it is green, **approve the `npm-publish` deployment**.
5. The `publish` job (the only one with `id-token: write`) downloads that tarball and runs `npm publish <tarball> --provenance --access public` with an exactly pinned npm. It installs nothing from the repo, so what is published is what `verify` tested (R40).
6. Verify: `npm view @puranderdua/ui version` shows the new version, and the package page shows the "Built and signed on GitHub Actions" provenance badge.
7. The next session pins `apps/site` to that exact version (Dependabot does not bump `@puranderdua/ui`). You redeploy the site and run the production smoke (below).

### Dry run

To see the workflow reach the approval gate without publishing, push a tag that matches the version in `packages/ui/package.json` on a branch you do not intend to release, wait for `verify` to finish and the `publish` job to show "Waiting", check the `package-tarball` artifact, then **reject** the deployment and delete the tag. `v*` tags are only allowed through the `npm-publish` environment rule, so nothing can publish without your approval.

## After a deploy: production smoke (D-094, R45)

Production deploys stay manual (D-057, D-094): Git deployments are off, so merging does not change what is live. After every `vercel --prod` (or dashboard redeploy) run:

```bash
pnpm smoke:prod                                   # https://ui-design-system-beta.vercel.app
SITE_URL=https://example.vercel.app pnpm smoke:prod   # another URL
```

It runs the smoke, showcase and production specs (headings, axe, 320px and zoom, the security headers including `upgrade-insecure-requests`, sitemap, 404, Open Graph image) in Chromium, Firefox and WebKit against the live URL. A failure means the deployed build is stale or broken; redeploy before announcing anything. Needs `pnpm exec playwright install chromium firefox webkit` once.

If the tag does not match `package.json`, the first step fails and nothing is published. Delete the tag (`git tag -d v0.5.0 && git push origin :refs/tags/v0.5.0`), fix the version through a PR, and tag again. npm versions are immutable: never reuse a published version.

## Testing the guard

The tag check is a script, so you can run it without Actions or npm:

```bash
scripts/check-release-tag.sh v9.9.9 packages/ui/package.json   # fails, exit 1
scripts/check-release-tag.sh "v$(node -p "require('./packages/ui/package.json').version")" packages/ui/package.json   # passes
```

## Site e2e (local and production)

- **Local:** `pnpm --filter site test:e2e` builds the site itself with `SITE_ALLOW_HTTP=1` and starts it on port 3100. The flag drops `upgrade-insecure-requests` from the CSP, because WebKit upgrades `http://localhost` to https and no asset would load (D-079). The build fails if the flag is set on Vercel. Stop anything already listening on 3100 first (`lsof -i :3100`); the run starts a fresh server and fails if the port is busy.
- **Deployed:** `SITE_URL=<url> pnpm --filter site test:e2e` tests that URL and starts nothing. Over https the header test also requires `upgrade-insecure-requests`, so this is the check that production ships it. A preview needs Vercel Deployment Protection off for Preview while the test runs.

## CI hygiene (reference)

- Every action is pinned to a full commit SHA with a `# vX.Y.Z` comment; Dependabot (`github-actions`) proposes bumps weekly.
- `ci.yml` has `permissions: contents: read`, cancels superseded runs per ref and sets `timeout-minutes` per job.
- A PR whose changed files are all under `docs/` or `*.md` runs only the `lint` job (`pnpm lint`: ESLint and Prettier); anything else, and every push to `main`, runs `check` and the site `e2e` job in parallel (`pnpm check` includes the hook test, `pnpm test:hooks`). Playwright browsers are cached by `pnpm-lock.yaml`.
- Playwright runs Chromium, Firefox and WebKit with `retries: 0` and `failOnFlakyTests` in CI: a flake fails the run.
- `pnpm audit --prod --audit-level high` fails CI on a high or critical advisory in production dependencies.
- `check-rsc` runs on every push to `main` and on PRs that touch `packages/ui/**` or `scripts/check-rsc.sh`.
