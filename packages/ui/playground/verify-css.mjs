// Fails if the playground's production CSS is missing any `ds-` class the
// package ships. The class list is read from dist/components/*.js, so coverage
// does not depend on the playground using a class (H7, F39). The playground CSS
// scans dist (`@source` in src/index.css), so a class the bridge or the recipes
// cannot generate shows up here as missing.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, "dist/assets");
const components = resolve(here, "../dist/components");

const file = readdirSync(assets).find((f) => f.endsWith(".css"));
if (!file) {
  console.error("No built CSS found in playground/dist/assets.");
  process.exit(1);
}
const css = readFileSync(resolve(assets, file), "utf8");

// Every string literal (", ' or `) in the built component files, split on whitespace.
const literal =
  /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
// A class token: optional variants (`hover:`, `data-[state=checked]:`) then a
// utility. It uses the design system when the utility part starts with `ds-` or
// has a `-ds-` segment (`bg-ds-primary`, `-mt-ds-gap-sm`, `!ds-border`).
const classLike = /^[A-Za-z0-9_\-:[\]/.&>*()=%!@#,'"]+$/;
const isDs = (token) => {
  // Drop variants: split on colons that are not inside [...]
  const bare = token.split(/:(?![^[]*\])/).pop() ?? token;
  // `data-ds-theme` and similar are attribute names, not classes.
  if (/^(?:data|aria)-/.test(bare)) return false;
  return /^[!-]?(?:[a-z0-9-]*-)?ds-[a-z0-9]/.test(bare);
};

const used = new Set();
for (const name of readdirSync(components).filter((f) => f.endsWith(".js"))) {
  const source = readFileSync(resolve(components, name), "utf8");
  for (const m of source.matchAll(literal)) {
    const text = m[1] ?? m[2] ?? m[3] ?? "";
    for (const token of text.split(/\s+/)) {
      if (token && classLike.test(token) && isDs(token)) used.add(token);
    }
  }
}

// Tailwind and the recipes escape every character that is not [A-Za-z0-9_-].
const escape = (token) => token.replace(/[^A-Za-z0-9_-]/g, (c) => `\\${c}`);
const missing = [...used].filter((t) => !css.includes(`.${escape(t)}`));

// Variables that must reach the built CSS (themes and bridge).
const raw = ["--ds-action-primary-bg", "--ds-type-h1-font-size"].filter(
  (v) => !css.includes(v),
);

if (used.size === 0) {
  console.error("No ds- classes found in dist/components; the scan is broken.");
  process.exit(1);
}
if (missing.length || raw.length) {
  console.error("Missing from built CSS:", [...missing, ...raw].join(", "));
  process.exit(1);
}
console.log(
  `playground CSS ok: ${used.size} classes from dist/components present in ${file}`,
);
