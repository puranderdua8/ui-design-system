#!/usr/bin/env bash
# Clean-install check (S9): a fresh Next.js app consumes the registry (Text,
# Heading, Button) and the npm package (Button on a second route), then builds.
# Finally it edits button.tsx locally and re-adds ds-button to confirm the CLI
# does not overwrite the edit silently.
#
# Usage: scripts/clean-install.sh   (env: REGISTRY_URL, VERSION, SHADCN_VERSION, KEEP=1)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY_URL="${REGISTRY_URL:-$(node -p "require('$REPO_ROOT/registry.config.json').url")}"
VERSION="${VERSION:-$(node -p "require('$REPO_ROOT/packages/ui/package.json').version")}"
SHADCN_VERSION="${SHADCN_VERSION:-4.22.0}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ds-clean-install.XXXXXX")"
APP="$WORK/consumer"

step() { printf '\n==> %s\n' "$*"; }
cleanup() { if [ "${KEEP:-0}" = 1 ]; then echo "kept $WORK"; else rm -rf "$WORK"; fi; }
trap cleanup EXIT

echo "registry=$REGISTRY_URL version=$VERSION shadcn=$SHADCN_VERSION"
echo "node=$(node -v) npm=$(npm -v)"

step "Registry is reachable"
curl -fsS "$REGISTRY_URL/r/v$VERSION/ds-button.json" | node -e '
  const j = JSON.parse(require("fs").readFileSync(0, "utf8"));
  if (!j.files?.[0]?.content?.includes("@/lib/utils")) throw new Error("ds-button.json lacks @/lib/utils");
  console.log("ds-button.json ok:", j.files.length, "file(s)")'

step "create-next-app (TypeScript, Tailwind, App Router, src dir, npm)"
cd "$WORK"
npx --yes create-next-app@latest consumer --ts --tailwind --app --src-dir --eslint \
  --import-alias "@/*" --use-npm --disable-git --yes
cd "$APP"

step "shadcn init"
npx --yes "shadcn@$SHADCN_VERSION" init --defaults --yes

step "Register @puranderdua in components.json"
node -e '
  const fs = require("fs");
  const c = JSON.parse(fs.readFileSync("components.json", "utf8"));
  c.registries = { ...c.registries, "@puranderdua": process.argv[1] + "/r/v" + process.argv[2] + "/{name}.json" };
  fs.writeFileSync("components.json", JSON.stringify(c, null, 2) + "\n");
' "$REGISTRY_URL" "$VERSION"

step "shadcn add ds-typography ds-button"
# ds-utils replaces the stock lib/utils.ts, so the CLI asks; --overwrite answers yes.
npx --yes "shadcn@$SHADCN_VERSION" add @puranderdua/ds-typography @puranderdua/ds-button --yes --overwrite
test -f src/components/ui/button.tsx
test -f src/components/ui/text.tsx
test -f src/components/ui/heading.tsx
test -f src/styles/ds-foundations.css

step "Foundations import"
node -e '
  const fs = require("fs");
  const f = "src/app/globals.css";
  const css = fs.readFileSync(f, "utf8");
  if (!css.includes("@import \"tailwindcss\";")) throw new Error("no tailwind import in globals.css");
  fs.writeFileSync(f, css.replace("@import \"tailwindcss\";", "@import \"tailwindcss\";\n@import \"../styles/ds-foundations.css\";"));
'
grep -n "ds-foundations" src/app/globals.css

step "Page using the registry components"
cat > src/app/page.tsx <<'TSX'
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

step "npm i @puranderdua/ui@$VERSION and a second route using the package Button"
npm i "@puranderdua/ui@$VERSION"
mkdir -p src/app/package
cat > src/app/package/page.tsx <<'TSX'
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
# Tailwind must scan the package's classes (see packages/ui/README.md).
node -e '
  const fs = require("fs");
  const f = "src/app/globals.css";
  const imp = "@import \"../styles/ds-foundations.css\";";
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(imp, imp + "\n@source \"../../node_modules/@puranderdua/ui/dist\";"));
'

step "next build"
npx next build

step "Built CSS contains the design-system classes"
CSS="$(cat .next/static/chunks/*.css 2>/dev/null || cat .next/static/css/*.css)"
for cls in 'text-ds-primary-fg' 'bg-ds-primary' 'ds-focus-ring'; do
  printf '%s' "$CSS" | grep -q -- "$cls" || { echo "missing $cls in built CSS"; exit 1; }
  echo "found $cls"
done

step "Local edit survives re-adding ds-button (no silent overwrite)"
echo '// local edit marker' >> src/components/ui/button.tsx
set +e
# Non-interactive stdin: the CLI must not proceed to overwrite on its own.
OUT="$(npx --yes "shadcn@$SHADCN_VERSION" add @puranderdua/ds-button < /dev/null 2>&1)"
STATUS=$?
set -e
echo "$OUT"
echo "exit status: $STATUS"
if ! grep -q 'local edit marker' src/components/ui/button.tsx; then
  echo "FAIL: shadcn add overwrote the locally edited button.tsx"
  exit 1
fi
echo "OK: local edit preserved"

step "PASS"
