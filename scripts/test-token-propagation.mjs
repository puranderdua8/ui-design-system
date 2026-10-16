// Self-test for the "changing a primitive changes every dependent var" rule.
// For a few primitives: change the value in a temp copy of tokens/, rebuild,
// and assert that the keys that changed in tokens.json are exactly the
// primitive plus everything that reaches it through var() references in
// tokens.css. Also asserts tokens.css changes only on the primitive's line
// (dependents are var() references, so their CSS must not change).
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

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// [source file, token path, new value]
const CASES = [
  ["primitives/color.json", ["color", "brand", "600"], "#123456"],
  ["primitives/typography.json", ["font", "size", "base"], "1.125rem"],
];

const tmp = mkdtempSync(join(tmpdir(), "ds-prop-"));
let failed = 0;
try {
  const baseOut = join(tmp, "base");
  await buildTokens(baseOut);
  const baseCss = readFileSync(join(baseOut, "tokens.css"), "utf8");
  const baseJson = JSON.parse(
    readFileSync(join(baseOut, "tokens.json"), "utf8"),
  );

  // var() reference graph from the CSS: name -> names it references.
  const refs = new Map();
  for (const m of baseCss.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    refs.set(
      m[1].slice(2),
      [...m[2].matchAll(/var\(--([\w-]+)\)/g)].map((r) => r[1]),
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
    const name = `ds-${path.join("-")}`;
    const dir = join(tmp, "tokens-" + path.join("-"));
    cpSync(join(root, "tokens"), dir, { recursive: true });
    const f = join(dir, file);
    const json = JSON.parse(readFileSync(f, "utf8"));
    let node = json;
    for (const k of path) node = node[k];
    node.$value = value;
    writeFileSync(f, JSON.stringify(json, null, 2));

    const out = join(tmp, "out-" + path.join("-"));
    await buildTokens(out, dir);
    const css = readFileSync(join(out, "tokens.css"), "utf8");
    const next = JSON.parse(readFileSync(join(out, "tokens.json"), "utf8"));

    const changed = new Set(
      Object.keys(baseJson).filter((k) => baseJson[k] !== next[k]),
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
    if (cssChanged.length !== 1 || !cssChanged[0].includes(`--${name}:`))
      problems.push(`tokens.css should change only the --${name} line`);

    if (problems.length) {
      failed++;
      console.error(`FAIL ${name}\n  - ${problems.join("\n  - ")}`);
    } else {
      console.log(
        `ok   ${name}: ${expected.size - 1} dependent(s) updated in tokens.json, 1 line changed in tokens.css`,
      );
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (failed) process.exit(1);
console.log("token propagation: OK");
