// Self-test for the theme machinery: a scratch copy of tokens/ gets a second
// theme ("scratch", a copy of Base with a few values changed) and we assert
// that it validates, builds into themes/scratch.{css,json} and passes the
// contrast check. Then two broken variants must fail: a theme missing a Base
// key (completeness, D-048) and a theme with a low-contrast primary colour.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scripts = join(root, "scripts");

// Runs a script; returns { ok, output }.
const run = (script, ...args) => {
  try {
    const output = execFileSync(
      process.execPath,
      [join(scripts, script), ...args],
      { encoding: "utf8", stdio: "pipe" },
    );
    return { ok: true, output };
  } catch (e) {
    return { ok: false, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2));

// A fresh tokens/ copy with a "scratch" theme registered in the resolver.
function scratchTokens(tmp, name, edit) {
  const dir = join(tmp, name);
  cpSync(join(root, "tokens"), dir, { recursive: true });
  cpSync(join(dir, "themes/base"), join(dir, "themes/scratch"), {
    recursive: true,
  });
  const colorFile = join(dir, "themes/scratch/color.json");
  const color = readJson(colorFile);
  color.color.brand["600"].$value = "#1e3a8a";
  edit?.({ dir, color, colorFile });
  writeJson(colorFile, color);
  const resolverFile = join(dir, "resolver.json");
  const resolver = readJson(resolverFile);
  resolver.modifiers.theme.contexts.scratch =
    resolver.modifiers.theme.contexts.base.map((s) => ({
      $ref: s.$ref.replace("themes/base/", "themes/scratch/"),
    }));
  writeJson(resolverFile, resolver);
  return dir;
}

const tmp = mkdtempSync(join(tmpdir(), "ds-theme2-"));
const problems = [];
const expect = (cond, msg) => {
  if (!cond) problems.push(msg);
  else console.log(`ok   ${msg}`);
};
try {
  // 1. A complete second theme validates, builds and passes contrast.
  const good = scratchTokens(tmp, "good");
  const v = run("validate-tokens.mjs", good);
  expect(v.ok, "second theme validates");
  const out = join(tmp, "good-out");
  await buildTokens(out, good);
  expect(
    existsSync(join(out, "themes/base.css")) &&
      existsSync(join(out, "themes/scratch.css")) &&
      existsSync(join(out, "themes/scratch.json")),
    "second theme builds its own css and json next to Base",
  );
  const scratchVars = readJson(join(out, "themes/scratch.json")).vars;
  const baseVars = readJson(join(out, "themes/base.json")).vars;
  expect(
    scratchVars["--ds-color-brand-600"] === "#1e3a8a" &&
      baseVars["--ds-color-brand-600"] !== "#1e3a8a",
    "scratch values differ from Base, Base is untouched",
  );
  expect(
    Object.keys(scratchVars).join() === Object.keys(baseVars).join(),
    "second theme has exactly Base's var names",
  );
  const c = run("contrast.mjs", join(out, "themes/scratch.json"));
  expect(
    c.ok && c.output.includes("[scratch]"),
    "second theme is contrast-checked",
  );

  // 2. A theme missing a Base key fails validation.
  const incomplete = scratchTokens(tmp, "incomplete", ({ color }) => {
    delete color.color.neutral["900"];
  });
  const m = run("validate-tokens.mjs", incomplete);
  expect(
    !m.ok && m.output.includes("theme scratch is missing color.neutral.900"),
    "a theme missing a Base key fails validation",
  );

  // 3. A low-contrast primary fails the contrast check.
  const low = scratchTokens(tmp, "low", ({ color }) => {
    color.color.brand["600"].$value = "#cccccc";
  });
  const lowOut = join(tmp, "low-out");
  await buildTokens(lowOut, low);
  const l = run("contrast.mjs", join(lowOut, "themes/scratch.json"));
  expect(
    !l.ok && l.output.includes("FAIL"),
    "a low-contrast theme fails the contrast check",
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (problems.length) {
  console.error(`second-theme test FAILED:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log("second-theme test: OK");
