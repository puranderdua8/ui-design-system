// tokens:check = validate source, rebuild and diff against committed output,
// run the contrast check per theme, then the primitive-change propagation and
// second-theme self-tests.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const committed = join(root, "packages/ui/src/styles/generated");
// Child scripts print their own diagnostics; exit with their status instead
// of adding a stack trace from execFileSync.
let tmp; // temp build dir, removed on every exit path
const run = (script, ...args) => {
  try {
    execFileSync(process.execPath, [join(root, "scripts", script), ...args], {
      stdio: "inherit",
    });
  } catch (e) {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    process.exit(e.status ?? 1);
  }
};

run("validate-tokens.mjs");

tmp = mkdtempSync(join(tmpdir(), "ds-tokens-"));
try {
  await buildTokens(tmp);
  const stale = [];
  const files = new Set([...listFiles(tmp), ...listFiles(committed)]);
  for (const f of [...files].sort()) {
    if (read(join(tmp, f)) !== read(join(committed, f))) stale.push(f);
  }
  if (stale.length) {
    console.error(
      `tokens:check: generated output is stale or non-deterministic: ${stale.join(", ")}\nRun \`pnpm tokens:build\` and commit the result.`,
    );
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
  }
  console.log("tokens:check: generated output matches source");
  run("contrast.mjs", ...listFiles(join(tmp, "themes"), ".json"));
  run("test-token-propagation.mjs");
  run("test-second-theme.mjs");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// Files under dir (relative paths), optionally only with one extension;
// with an extension the paths are absolute, ready to pass to a script.
function listFiles(dir, ext) {
  try {
    const all = readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile() && (!ext || d.name.endsWith(ext)))
      .map((d) => join(d.parentPath, d.name));
    return ext ? all.sort() : all.map((p) => p.slice(dir.length + 1));
  } catch {
    return [];
  }
}
function read(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}
