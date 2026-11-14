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
SERVER_PORT=3103

# Killing the wrapper alone leaves the real next-server listening; stop by port too.
cleanup() {
  if command -v lsof >/dev/null 2>&1; then
    for pid in $(lsof -ti "tcp:$SERVER_PORT" -sTCP:LISTEN 2>/dev/null); do kill "$pid" 2>/dev/null || true; done
  fi
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
# Every client component (H3, F36): Radix-based and context-based files.
for client in field input checkbox radio-group select tabs banner-video; do
  expect "$DIST/components/$client.js" '"use client"'
done
# Server-safe files, including the plain `.styles` modules (F01). Card has no
# directive (it only composes Heading and Text), so Server Components render it.
for server in text heading label button link stack grid cluster container section split sidebar card banner \
  input.styles checkbox.styles radio-group.styles select.styles card.styles tabs.styles banner.styles; do
  reject "$DIST/components/$server.js" '"use client"'
done
reject "$DIST/index.js" '"use client"'
node "$REPO_ROOT/scripts/check-client-exports.mjs" "$DIST"

# Every theme ships as CSS and as a resolved JSON map (S32). Nature's primary
# (brand.600) is a value no other theme has, so it proves the right file is used.
for theme in base corporate nature quirky; do
  [ -s "$DIST/themes/$theme.css" ] || fail "themes/$theme.css missing from the tarball"
  [ -s "$DIST/themes/$theme.json" ] || fail "themes/$theme.json missing from the tarball"
done
expect "$DIST/themes/nature.css" '#2f7442'
reject "$DIST/themes/base.css" '#2f7442'

step "create-next-app $CNA_VERSION and install the tarball"
(cd "$WORK" && npx --yes "create-next-app@$CNA_VERSION" app --ts --tailwind --app --src-dir --eslint \
  --import-alias "@/*" --use-npm --disable-git --yes)
APP="$WORK/app"
cd "$APP"
npm i "$TARBALL"
# A non-Base theme: the consumer imports foundations plus exactly one theme CSS
# file (S32). The theme JSON export must resolve through the package `exports`.
cat >src/app/globals.css <<'CSS'
@import "tailwindcss";
@import "@puranderdua/ui/foundations.css";
@import "@puranderdua/ui/themes/nature.css";
@source "../../node_modules/@puranderdua/ui/dist";
CSS
node -e '
const j = require("@puranderdua/ui/themes/nature.json");
if (j.vars["--ds-color-brand-600"] !== "#2f7442") { console.error("nature.json brand.600 is", j.vars["--ds-color-brand-600"]); process.exit(1); }
console.log("ok: themes/nature.json resolves through exports");
'
cat >src/app/page.tsx <<'TSX'
// A Server Component: no "use client", no hooks. Field and Input are client
// components inside the package, so they must arrive as client references.
import * as ui from "@puranderdua/ui";
import {
  Banner, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle,
  Checkbox, Cluster, Container, Field, Grid, Heading, Input, Link, Label,
  RadioGroup, RadioGroupItem, Section, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, Sidebar, Split, Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text,
  bannerVariants, buttonVariants, cardVariants, checkboxClasses, cn, headingVariants, inputVariants, linkVariants,
  radioGroupItemClasses, selectTriggerVariants, tabsClasses, tabsContentClasses, tabsListClasses,
  tabsTriggerClasses, textVariants,
} from "@puranderdua/ui";

// Every server-safe export is called here, on the server (F01, F36). If one of
// them were a client reference, `next build` would fail with "Attempted to call".
const serverSafe = [
  buttonVariants({ variant: "primary", size: "md" }),
  headingVariants({ variant: "display" }),
  inputVariants({ size: "md" }),
  linkVariants({ variant: "inline" }),
  selectTriggerVariants({ size: "md" }),
  textVariants({ variant: "body" }),
  cn("a", "b"),
  cardVariants({ variant: "raised" }),
  bannerVariants({ tone: "gradient", height: "tall" }),
  checkboxClasses,
  radioGroupItemClasses,
  tabsClasses,
  tabsListClasses,
  tabsTriggerClasses,
  tabsContentClasses,
];

// A value export that is neither a component nor a hook must be server-safe and
// belong in the list above: a new one fails here until it is added.
const known = new Set(["buttonVariants", "headingVariants", "inputVariants", "linkVariants",
  "selectTriggerVariants", "textVariants", "cn", "checkboxClasses", "radioGroupItemClasses",
  "cardVariants", "bannerVariants", "tabsClasses", "tabsListClasses", "tabsTriggerClasses", "tabsContentClasses"]);
const unlisted = Object.keys(ui).filter((k) => !/^[A-Z]/.test(k) && !/^use[A-Z]/.test(k) && !known.has(k));
if (unlisted.length > 0) throw new Error("Unlisted server-safe exports: " + unlisted.join(", "));

export default function Page() {
  return (
    <main>
      <Heading as="h1" variant="display">RSC check</Heading>
      <Text>Rendered on the server.</Text>
      <p data-testid="server-safe">{serverSafe.every((v) => typeof v === "string" && v.length > 0) ? "server-safe ok" : "server-safe broken"}</p>
      <Container><Stack><Cluster><Grid><Section><Split><div>a</div><div>b</div></Split><Sidebar sidebar="s">c</Sidebar></Section></Grid></Cluster></Stack></Container>
      <Button>Go</Button>
      <Link href="/">Home</Link>
      <Label htmlFor="x">Label</Label>
      <Field label="Email" description="Work address." error="Enter a valid email." required>
        <Input />
      </Field>
      <Field label="Agree"><Checkbox defaultChecked="indeterminate" /></Field>
      <Field label="Contact" error="Pick one">
        <RadioGroup><RadioGroupItem value="a" aria-label="A" /></RadioGroup>
      </Field>
      <Field label="Country">
        <Select>
          <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
          <SelectContent><SelectItem value="in">India</SelectItem></SelectContent>
        </Select>
      </Field>
      <Card as="article" variant="raised">
        <CardMedia><div>media</div></CardMedia>
        <CardHeader><CardTitle as="h2">Card title</CardTitle><CardDescription>Card hint</CardDescription></CardHeader>
        <CardContent>Card body</CardContent>
        <CardFooter><Button>Act</Button></CardFooter>
      </Card>
      <Banner aria-label="Hero" tone="gradient" height="tall" video={{ src: "/hero.mp4", poster: "/hero.jpg" }}>
        <Heading as="h2">Banner</Heading>
      </Banner>
      <Tabs defaultValue="a">
        <TabsList aria-label="Demo"><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>
    </main>
  );
}
TSX

step "next build"
npx next build

step "Built CSS carries the non-Base theme"
NATURE_CSS="$WORK/built.css"
cat .next/static/chunks/*.css >"$NATURE_CSS" 2>/dev/null || cat .next/static/css/*.css >"$NATURE_CSS"
expect "$NATURE_CSS" '#2f7442'
expect "$NATURE_CSS" 'Fraunces'

step "next start and fetch /"
if curl -fsS -o /dev/null "http://localhost:3103/" 2>/dev/null; then fail "port 3103 is already in use; stop that server first"; fi
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
expect "$WORK/page.html" 'server-safe ok'
# Indeterminate checkbox and invalid radio group wiring render on the server.
expect "$WORK/page.html" 'aria-checked="mixed"'
expect "$WORK/page.html" 'role="radiogroup"'
# In the RSC payload (escaped JSON inside the HTML), Field and Input are client
# references (`I[id,[chunks],"Name"]`), while Heading and Text are already plain
# elements: they never became client references.
expect "$WORK/page.html" ',\"Field\"]'
expect "$WORK/page.html" ',\"Input\"]'
reject "$WORK/page.html" ',\"Text\"]'
reject "$WORK/page.html" ',\"Heading\"]'
# Card is server-rendered (no client reference); Tabs is a client component that
# still SSRs its tablist and the active panel (S26).
expect "$WORK/page.html" 'data-slot="card"'
reject "$WORK/page.html" ',\"Card\"]'
# Banner is server-rendered; its video part is a client component. Before
# hydration it renders the poster only (no video starts for someone who asked
# for reduced motion).
expect "$WORK/page.html" 'data-slot="banner"'
reject "$WORK/page.html" ',\"Banner\"]'
expect "$WORK/page.html" ',\"BannerVideo\"]'
expect "$WORK/page.html" 'data-slot="banner-video"'
reject "$WORK/page.html" '<video'
expect "$WORK/page.html" 'role="tablist"'
expect "$WORK/page.html" ',\"Tabs\"]'
expect "$WORK/page.html" '[\"$\",\"h1\",null,{\"children\":\"RSC check\"'
expect "$WORK/page.html" '[\"$\",\"p\",null,{\"children\":\"Rendered on the server.\"'

step "PASS"
