#!/usr/bin/env bash
# Clean-install check (S9).
#
# App A (registry): fresh Next.js app -> shadcn init -> @puranderdua registry ->
#   add ds-typography + ds-button -> page; plus the npm package on a second route.
# App B (package only): fresh Next.js app that installs only @puranderdua/ui and
#   imports its own foundations.css, so the package path is tested on its own.
# Both are built, served with `next start`, fetched over HTTP and checked for the
# expected markup, CSS and basic accessibility (axe, structural rules).
# Finally, in app A, a local edit to button.tsx must not be overwritten silently.
#
# Usage: scripts/clean-install.sh
# Env:   REGISTRY_URL, VERSION, SHADCN_VERSION, CNA_VERSION (pinned defaults),
#        KEEP=1 keeps the temp dir, EVIDENCE=<file.md> writes the sanitized log.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY_URL="${REGISTRY_URL:-$(node -p "require('$REPO_ROOT/registry.config.json').url")}"
VERSION="${VERSION:-$(node -p "require('$REPO_ROOT/packages/ui/package.json').version")}"
SHADCN_VERSION="${SHADCN_VERSION:-4.22.0}"
CNA_VERSION="${CNA_VERSION:-16.4.2}"
AXE_VERSION="4.14.0"
JSDOM_VERSION="27.0.0"
[ -z "${EVIDENCE:-}" ] || EVIDENCE="$(cd "$(dirname "$EVIDENCE")" && pwd)/$(basename "$EVIDENCE")"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ds-clean-install.XXXXXX")"
LOG="$WORK/run.log"
SERVER_PID=""

cleanup() {
  local status=$?
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  sleep 1 # let tee flush the log
  if [ -n "${EVIDENCE:-}" ] && [ -f "$LOG" ]; then write_evidence "$status"; fi
  if [ "${KEEP:-0}" = 1 ]; then echo "kept $WORK"; else rm -rf "$WORK"; fi
}
trap cleanup EXIT

write_evidence() {
  local status=$1 result="PASS"
  [ "$status" = 0 ] || result="FAIL (exit $status)"
  {
    echo "# Clean-install evidence — $(date +%F)"
    echo
    echo "Produced by \`scripts/clean-install.sh\` against the live registry. Result: **$result**."
    echo
    echo '```text'
    # Strip colour codes, carriage returns, trailing spaces and the temp path.
    sed -e 's/\x1b\[[0-9;?]*[A-Za-z]//g' -e 's/\r//g' -e 's/[[:space:]]*$//' \
      -e "s#$WORK#<tmp>#g" "$LOG"
    echo '```'
  } >"$EVIDENCE"
}

# Everything below is logged (and printed).
exec > >(tee "$LOG") 2>&1

step() { printf '\n==> %s\n' "$*"; }
fail() { echo "FAIL: $*"; exit 1; }
# has <file> <fixed string>: avoids `cmd | grep -q`, which SIGPIPEs under pipefail.
has() { grep -qF -- "$2" "$1"; }
expect() { has "$1" "$2" || fail "$1 does not contain: $2"; echo "ok: $(basename "$1") contains: $2"; }

echo "registry=$REGISTRY_URL version=$VERSION shadcn=$SHADCN_VERSION create-next-app=$CNA_VERSION"
echo "node=$(node -v) npm=$(npm -v)"

step "Registry is reachable"
curl -fsS "$REGISTRY_URL/r/v$VERSION/ds-button.json" | node -e '
  const j = JSON.parse(require("fs").readFileSync(0, "utf8"));
  if (!j.files?.[0]?.content?.includes("@/lib/utils")) throw new Error("ds-button.json lacks @/lib/utils");
  console.log("ds-button.json ok:", j.files.length, "file(s)")'

step "Checker tools (axe-core, jsdom) outside both apps"
mkdir -p "$WORK/tools"
(cd "$WORK/tools" && npm init -y >/dev/null && npm i --silent "axe-core@$AXE_VERSION" "jsdom@$JSDOM_VERSION")
cat >"$WORK/tools/axe-check.mjs" <<'JS'
// usage: node axe-check.mjs <html file>; fails on any axe violation (colour contrast needs real layout, so it is skipped).
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import axe from "axe-core";
const html = readFileSync(process.argv[2], "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only" });
dom.window.eval(axe.source);
const results = await dom.window.axe.run(dom.window.document, {
  rules: { "color-contrast": { enabled: false } },
});
for (const v of results.violations) console.log(`axe ${v.id} (${v.impact}): ${v.help}`);
console.log(`axe: ${results.violations.length} violation(s), ${results.passes.length} rule(s) passed`);
process.exit(results.violations.length ? 1 : 0);
JS

new_app() { # new_app <dir name>
  (cd "$WORK" && npx --yes "create-next-app@$CNA_VERSION" "$1" --ts --tailwind --app --src-dir --eslint \
    --import-alias "@/*" --use-npm --disable-git --yes)
}

# edit_css <app> <node expression over `css`>: rewrite src/app/globals.css.
edit_css() {
  (cd "$1" && node -e '
    const fs = require("fs");
    const f = "src/app/globals.css";
    const css = fs.readFileSync(f, "utf8");
    const out = new Function("css", "return " + process.argv[1])(css);
    if (out === css) throw new Error("globals.css edit changed nothing");
    fs.writeFileSync(f, out);' "$2")
}

# serve_and_check <app> <port> <route:expected text>...
# Builds, runs `next start`, fetches each route and checks markup, CSS and axe.
serve_and_check() {
  local app=$1 port=$2
  shift 2
  step "next build ($(basename "$app"))"
  (cd "$app" && npx next build)

  step "Built CSS ($(basename "$app")) contains the design-system classes and tokens"
  cat "$app"/.next/static/chunks/*.css >"$WORK/$(basename "$app").css"
  for needle in 'text-ds-primary-fg' 'bg-ds-primary' 'h-ds-control-md' 'ds-focus-ring' '--ds-color'; do
    expect "$WORK/$(basename "$app").css" "$needle"
  done

  step "next start ($(basename "$app")) and fetch routes"
  (cd "$app" && npx next start -p "$port") &
  SERVER_PID=$!
  for _ in $(seq 1 60); do
    curl -fsS "http://localhost:$port/" >/dev/null 2>&1 && break
    sleep 1
  done
  local entry route text file
  for entry in "$@"; do
    route=${entry%%:*}
    text=${entry#*:}
    file="$WORK/$(basename "$app")-$(echo "$route" | tr '/' '_').html"
    curl -fsS "http://localhost:$port$route" >"$file"
    echo "GET $route"
    expect "$file" "$text"
    expect "$file" 'data-slot="button"'
    expect "$file" 'data-slot="heading"'
    expect "$file" 'ds-type-display'
    node "$WORK/tools/axe-check.mjs" "$file" || fail "axe violations on $route"
  done
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
}

# --- App A: registry + package route ---------------------------------------
step "App A: create-next-app $CNA_VERSION (TypeScript, Tailwind, App Router, src dir, npm)"
new_app app-registry
APP="$WORK/app-registry"
cd "$APP"

step "shadcn init"
npx --yes "shadcn@$SHADCN_VERSION" init --defaults --yes
# init writes stock button.tsx and lib/utils.ts; the registry versions replace them below.
test -f src/components/ui/button.tsx && test -f src/lib/utils.ts

step "Register @puranderdua in components.json"
node -e '
  const fs = require("fs");
  const c = JSON.parse(fs.readFileSync("components.json", "utf8"));
  c.registries = { ...c.registries, "@puranderdua": process.argv[1] + "/r/v" + process.argv[2] + "/{name}.json" };
  fs.writeFileSync("components.json", JSON.stringify(c, null, 2) + "\n");
' "$REGISTRY_URL" "$VERSION"

step "shadcn add ds-typography ds-button (stock button.tsx and utils.ts exist, so --overwrite accepts replacing them)"
npx --yes "shadcn@$SHADCN_VERSION" add @puranderdua/ds-typography @puranderdua/ds-button --yes --overwrite
for f in src/components/ui/button.tsx src/components/ui/text.tsx src/components/ui/heading.tsx \
  src/styles/ds-foundations.css src/lib/types.ts src/lib/generated/ds-classes.ts; do
  test -f "$f" || fail "missing $f"
done
expect src/components/ui/button.tsx 'ds-focus-ring'
expect src/lib/utils.ts 'ds-classes'

step "Foundations import (registry copy)"
edit_css "$APP" 'css.replace("@import \"tailwindcss\";", "@import \"tailwindcss\";\n@import \"../styles/ds-foundations.css\";")'
expect src/app/globals.css 'ds-foundations.css'

step "Page using the registry components"
cat >src/app/page.tsx <<'TSX'
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Page() {
  return (
    <main>
      <Heading as="h1" variant="display">Registry install</Heading>
      <Text>Body copy from the registry.</Text>
      <Button>Primary</Button>
      <Button variant="secondary" size="sm">Secondary</Button>
    </main>
  );
}
TSX

step "npm i @puranderdua/ui@$VERSION and a second route using the package"
npm i "@puranderdua/ui@$VERSION"
mkdir -p src/app/package
cat >src/app/package/page.tsx <<'TSX'
import { Button, Heading, Text } from "@puranderdua/ui";

export default function Page() {
  return (
    <main>
      <Heading as="h1" variant="display">Package install</Heading>
      <Text>Body copy from the package.</Text>
      <Button>Package button</Button>
    </main>
  );
}
TSX
edit_css "$APP" 'css.replace("@import \"../styles/ds-foundations.css\";", "@import \"../styles/ds-foundations.css\";\n@source \"../../node_modules/@puranderdua/ui/dist\";")'

serve_and_check "$APP" 3101 "/:Registry install" "/package:Package install"

step "Local edit of button.tsx: re-adding ds-button must prompt and not overwrite"
cp src/components/ui/button.tsx "$WORK/button.registry.tsx"
echo '// local edit marker' >>src/components/ui/button.tsx
# stdin closed: the CLI may exit 0 or non-zero, but it must ask and must not write.
set +e
npx --yes "shadcn@$SHADCN_VERSION" add @puranderdua/ds-button </dev/null >"$WORK/readd.log" 2>&1
set -e
sed -e 's/\x1b\[[0-9;?]*[A-Za-z]//g' "$WORK/readd.log"
expect "$WORK/readd.log" 'already exists'
expect "$WORK/readd.log" 'overwrite'
has src/components/ui/button.tsx 'local edit marker' || fail "shadcn add overwrote the locally edited button.tsx"
echo "OK: prompted, local edit preserved"

step "Accepting the update (--overwrite) restores the registry version"
npx --yes "shadcn@$SHADCN_VERSION" add @puranderdua/ds-button --yes --overwrite
if has src/components/ui/button.tsx 'local edit marker'; then fail "overwrite did not apply"; fi
cmp src/components/ui/button.tsx "$WORK/button.registry.tsx" || fail "button.tsx differs from the registry copy"
echo "OK: button.tsx matches the registry copy again"

# --- App B: package only ----------------------------------------------------
step "App B: create-next-app $CNA_VERSION, package only (no shadcn, no registry)"
new_app app-package
APP_B="$WORK/app-package"
cd "$APP_B"
npm i "@puranderdua/ui@$VERSION"
edit_css "$APP_B" 'css.replace("@import \"tailwindcss\";", "@import \"tailwindcss\";\n@import \"@puranderdua/ui/foundations.css\";\n@source \"../../node_modules/@puranderdua/ui/dist\";")'
cat >src/app/page.tsx <<'TSX'
import { Button, Heading, Text } from "@puranderdua/ui";

export default function Page() {
  return (
    <main>
      <Heading as="h1" variant="display">Package only</Heading>
      <Text>Body copy from the package.</Text>
      <Button>Package button</Button>
    </main>
  );
}
TSX
test ! -e src/styles/ds-foundations.css || fail "app B must not contain registry files"
serve_and_check "$APP_B" 3102 "/:Package only"

step "PASS"
