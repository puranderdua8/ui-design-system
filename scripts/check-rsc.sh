#!/usr/bin/env bash
# React Server Components check (S22, D-065).
#
# Packs the local package, installs the tarball into a fresh Next.js app and
# renders a Server Component page that imports Text, Heading (server components)
# and Field, Input (client components). It checks that the built files keep
# "use client" exactly where it belongs, that `next build` accepts the page, and
# that the server-rendered HTML and RSC payload show the right boundary.
#
# Usage: scripts/check-rsc.sh
# Env:   CNA_VERSION (pinned default), KEEP=1 keeps the temp dir.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CNA_VERSION="${CNA_VERSION:-16.4.2}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ds-check-rsc.XXXXXX")"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [ "${KEEP:-0}" = 1 ]; then echo "kept $WORK"; else rm -rf "$WORK"; fi
}
trap cleanup EXIT

step() { printf '\n==> %s\n' "$*"; }
fail() { echo "FAIL: $*"; exit 1; }
# has <file> <fixed string>: avoids `cmd | grep -q`, which SIGPIPEs under pipefail.
has() { grep -qF -- "$2" "$1"; }
expect() { has "$1" "$2" || fail "$(basename "$1") does not contain: $2"; echo "ok: $(basename "$1") contains: $2"; }
reject() { if has "$1" "$2"; then fail "$(basename "$1") must not contain: $2"; fi; echo "ok: $(basename "$1") does not contain: $2"; }

step "Build and pack the package"
(cd "$REPO_ROOT/packages/ui" && pnpm build >/dev/null && pnpm pack --pack-destination "$WORK" >/dev/null)
TARBALL="$(ls "$WORK"/puranderdua-ui-*.tgz)"
echo "tarball: $(basename "$TARBALL")"

step "Directives in the packed files"
mkdir "$WORK/unpacked"
tar -xzf "$TARBALL" -C "$WORK/unpacked"
DIST="$WORK/unpacked/package/dist"
for client in field input; do
  expect "$DIST/components/$client.js" '"use client"'
done
for server in text heading label button link stack grid; do
  reject "$DIST/components/$server.js" '"use client"'
done
reject "$DIST/index.js" '"use client"'

step "create-next-app $CNA_VERSION and install the tarball"
(cd "$WORK" && npx --yes "create-next-app@$CNA_VERSION" app --ts --tailwind --app --src-dir --eslint \
  --import-alias "@/*" --use-npm --disable-git --yes)
APP="$WORK/app"
cd "$APP"
npm i "$TARBALL"
cat >src/app/page.tsx <<'TSX'
// A Server Component: no "use client", no hooks. Field and Input are client
// components inside the package, so they must arrive as client references.
import { Field, Heading, Input, Text } from "@puranderdua/ui";

export default function Page() {
  return (
    <main>
      <Heading as="h1" variant="display">RSC check</Heading>
      <Text>Rendered on the server.</Text>
      <Field label="Email" description="Work address." error="Enter a valid email." required>
        <Input />
      </Field>
    </main>
  );
}
TSX

step "next build"
npx next build

step "next start and fetch /"
(npx next start -p 3103) &
SERVER_PID=$!
for _ in $(seq 1 60); do
  curl -fsS "http://localhost:3103/" >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS "http://localhost:3103/" >"$WORK/page.html"
expect "$WORK/page.html" 'data-slot="heading"'
expect "$WORK/page.html" 'data-slot="text"'
# Client components are rendered on the server too (SSR), with the Field wiring.
expect "$WORK/page.html" 'data-slot="field"'
expect "$WORK/page.html" 'data-slot="input"'
expect "$WORK/page.html" 'aria-invalid="true"'
expect "$WORK/page.html" 'aria-describedby='
# In the RSC payload (escaped JSON inside the HTML), Field and Input are client
# references (`I[id,[chunks],"Name"]`), while Heading and Text are already plain
# elements: they never became client references.
expect "$WORK/page.html" ',\"Field\"]'
expect "$WORK/page.html" ',\"Input\"]'
reject "$WORK/page.html" ',\"Text\"]'
reject "$WORK/page.html" ',\"Heading\"]'
expect "$WORK/page.html" '[\"$\",\"h1\",null,{\"children\":\"RSC check\"'
expect "$WORK/page.html" '[\"$\",\"p\",null,{\"children\":\"Rendered on the server.\"'

step "PASS"
