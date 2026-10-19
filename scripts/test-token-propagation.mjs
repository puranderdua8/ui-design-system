// Self-test for the "changing a primitive changes every dependent var" rule,
// run for every theme. For a few primitives: change the value in a temp copy
// of tokens/, rebuild, and assert that the vars that changed in
// themes/<name>.json are exactly the primitive plus everything that reaches it
// through var() references in themes/<name>.css. Also asserts the CSS changes
// only on the primitive's line (dependents are var() references, so their CSS
// must not change), and that no other theme's output changes.
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build-tokens.mjs";
import { loadResolver } from "./lib/resolver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// [file inside themes/<name>/, token path, new value]
const CASES = [
  ["color.json", ["color", "brand", "600"], "#123456"],
  ["typography.json", ["font", "size", "base"], "1.125rem"],
];

const tmp = mkdtempSync(join(tmpdir(), "ds-prop-"));
let failed = 0;
try {
  const baseOut = join(tmp, "base");
  await buildTokens(baseOut);
  const themeNames = Object.keys(loadResolver(join(root, "tokens")).themes);
  const readCss = (out, t) =>
    readFileSync(join(out, `themes/${t}.css`), "utf8");
  const readVars = (out, t) =>
    JSON.parse(readFileSync(join(out, `themes/${t}.json`), "utf8")).vars;

  for (const theme of themeNames) {
    const baseCss = readCss(baseOut, theme);
    const baseVars = readVars(baseOut, theme);

    // var() reference graph from the CSS: name -> names it references.
    const refs = new Map();
    for (const m of baseCss.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
      refs.set(
        m[1],
        [...m[2].matchAll(/var\((--[\w-]+)\)/g)].map((r) => r[1]),
      );
    }
    const dependents = (name) => {
      const out = new Set();
      let grew = true;
      while (grew) {
        grew = false;
        for (const [k, deps] of refs)
          if (!out.has(k) && deps.some((d) => d === name || out.has(d))) {
            out.add(k);
            grew = true;
          }
      }
      return out;
    };

    for (const [file, path, value] of CASES) {
      const name = `--ds-${path.join("-")}`;
      const label = `[${theme}] ${name}`;
      const slug = `${theme}-${path.join("-")}`;
      const dir = join(tmp, "tokens-" + slug);
      cpSync(join(root, "tokens"), dir, { recursive: true });
      const f = join(dir, "themes", theme, file);
      const json = JSON.parse(readFileSync(f, "utf8"));
      let node = json;
      for (const k of path) node = node[k];
      node.$value = value;
      writeFileSync(f, JSON.stringify(json, null, 2));

      const out = join(tmp, "out-" + slug);
      await buildTokens(out, dir);
      const css = readCss(out, theme);
      const next = readVars(out, theme);

      const changed = new Set(
        Object.keys(baseVars).filter((k) => baseVars[k] !== next[k]),
      );
      const expected = dependents(name);
      expected.add(name);
      const missing = [...expected].filter((k) => !changed.has(k));
      const extra = [...changed].filter((k) => !expected.has(k));
      const cssLines = (c) => c.split("\n");
      const cssChanged = cssLines(css).filter(
        (l, i) => l !== cssLines(baseCss)[i],
      );

      const problems = [];
      if (!changed.has(name)) problems.push(`${name} did not change`);
      if (missing.length)
        problems.push(`dependents not updated: ${missing.join(", ")}`);
      if (extra.length)
        problems.push(`unrelated tokens changed: ${extra.join(", ")}`);
      if (cssChanged.length !== 1 || !cssChanged[0].includes(`${name}:`))
        problems.push(`${theme}.css should change only the ${name} line`);
      for (const other of themeNames.filter((t) => t !== theme))
        if (readCss(out, other) !== readCss(baseOut, other))
          problems.push(`theme ${other} changed`);

      if (problems.length) {
        failed++;
        console.error(`FAIL ${label}\n  - ${problems.join("\n  - ")}`);
      } else {
        console.log(
          `ok   ${label}: ${expected.size - 1} dependent(s) updated in ${theme}.json, 1 line changed in ${theme}.css`,
        );
      }
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (failed) process.exit(1);
console.log("token propagation: OK");
