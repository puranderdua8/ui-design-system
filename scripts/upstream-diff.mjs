// Reports changes in the adopted shadcn files since the commits pinned in
// docs/provenance/*.md (R47, D-049). Run it before each release:
//
//   node scripts/upstream-diff.mjs          report only (exit 0)
//   node scripts/upstream-diff.mjs --fail   exit 1 when any file changed
//
// For each provenance doc it reads the upstream path from the "Source" line and
// the pinned commit from the "Upstream commit" line, fetches the file at that
// commit and at `main` from raw.githubusercontent.com, and prints a unified
// diff when they differ. Upstream changes are for review: apply the ones that
// matter (accessibility, bug fixes) by hand, then re-pin the commit in the doc.
// Not part of `pnpm check`: it needs the network.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const provenance = resolve(root, "docs/provenance");
const repo = "shadcn-ui/ui";
const fail = process.argv.includes("--fail");

const fetchText = async (ref, path) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/${ref}/${path}`,
  );
  if (!res.ok) throw new Error(`${res.status} fetching ${path} at ${ref}`);
  return res.text();
};

const tmp = mkdtempSync(join(tmpdir(), "upstream-diff-"));
let changed = 0;
let errors = 0;

for (const file of readdirSync(provenance)
  .filter((f) => f.endsWith(".md"))
  .sort()) {
  const doc = readFileSync(join(provenance, file), "utf8");
  const path = doc.match(/^- \*\*Source:\*\*.*?`(apps\/[^`]+\.tsx)`/m)?.[1];
  const pin = doc.match(
    /^- \*\*Upstream commit:\*\*[^`]*`([0-9a-f]{7,40})`/m,
  )?.[1];
  if (!path || !pin) {
    console.error(`${file}: no upstream path or pinned commit found`);
    errors++;
    continue;
  }
  try {
    const [then, now] = await Promise.all([
      fetchText(pin, path),
      fetchText("main", path),
    ]);
    if (then === now) {
      console.log(
        `ok       ${file}  (${path} unchanged since ${pin.slice(0, 7)})`,
      );
      continue;
    }
    changed++;
    console.log(`CHANGED  ${file}  (${path} differs from ${pin.slice(0, 7)})`);
    const a = join(tmp, `${file}.pinned`);
    const b = join(tmp, `${file}.main`);
    writeFileSync(a, then);
    writeFileSync(b, now);
    const diff = spawnSync("git", ["diff", "--no-index", "--no-color", a, b], {
      encoding: "utf8",
    });
    console.log(diff.stdout);
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    errors++;
  }
}

console.log(
  `\n${changed} changed, ${errors} errors, of ${readdirSync(provenance).filter((f) => f.endsWith(".md")).length} adopted files.`,
);
process.exit(errors || (fail && changed) ? 1 : 0);
