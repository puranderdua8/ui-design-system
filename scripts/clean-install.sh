#!/usr/bin/env bash
# Clean-install check (S9; package only since S13, D-055).
#
# A fresh Next.js app installs @puranderdua/ui from npm and imports its
# foundations.css. It is built, served with `next start`, fetched over HTTP and
# checked for the expected markup, CSS and basic accessibility (axe, structural rules).
#
# Usage: scripts/clean-install.sh
# Env:   VERSION, CNA_VERSION (pinned defaults),
#        KEEP=1 keeps the temp dir, EVIDENCE=<file.md> writes the sanitized log.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${VERSION:-$(node -p "require('$REPO_ROOT/packages/ui/package.json').version")}"
CNA_VERSION="${CNA_VERSION:-16.4.2}"
AXE_VERSION="4.14.0"
JSDOM_VERSION="27.0.0"
[ -z "${EVIDENCE:-}" ] || EVIDENCE="$(cd "$(dirname "$EVIDENCE")" && pwd)/$(basename "$EVIDENCE")"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ds-clean-install.XXXXXX")"
LOG="$WORK/run.log"
SERVER_PID=""

cleanup() {
  local status=$?
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
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
    echo "Produced by \`scripts/clean-install.sh\` against the published npm package. Result: **$result**."
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

echo "version=$VERSION create-next-app=$CNA_VERSION"
echo "node=$(node -v) npm=$(npm -v)"

step "Checker tools (axe-core, jsdom) outside the app"
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

# --- Package-only app -------------------------------------------------------
step "create-next-app $CNA_VERSION (TypeScript, Tailwind, App Router, src dir, npm), package only"
new_app app-package
APP_B="$WORK/app-package"
cd "$APP_B"
npm i "@puranderdua/ui@$VERSION"
edit_css "$APP_B"'css.replace("@import \"tailwindcss\";", "@import \"tailwindcss\";\n@import \"@puranderdua/ui/foundations.css\";\n@source \"../../node_modules/@puranderdua/ui/dist\";")'
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
test ! -e src/styles/ds-foundations.css || fail "app must not contain copied foundations files"
serve_and_check "$APP_B" 3102 "/:Package only"

step "PASS"
