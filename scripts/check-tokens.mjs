// tokens:check = validate source, rebuild and diff against committed output,
// then run the contrast check.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const committed = join(root, "packages/ui/src/styles/generated");
const run = (script, ...args) =>
  execFileSync(process.execPath, [join(root, "scripts", script), ...args], {
    stdio: "inherit",
  });

run("validate-tokens.mjs");

const tmp = mkdtempSync(join(tmpdir(), "ds-tokens-"));
try {
  await buildTokens(tmp);
  const stale = [];
  const files = new Set([...readdirSync(tmp), ...safeList(committed)]);
  for (const f of [...files].sort()) {
    if (read(join(tmp, f)) !== read(join(committed, f))) stale.push(f);
  }
  if (stale.length) {
    console.error(
      `tokens:check: generated output is stale or non-deterministic: ${stale.join(", ")}\nRun \`pnpm tokens:build\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log("tokens:check: generated output matches source");
  run("contrast.mjs", join(tmp, "tokens.json"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

function safeList(dir) {
  try {
    return readdirSync(dir);
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
