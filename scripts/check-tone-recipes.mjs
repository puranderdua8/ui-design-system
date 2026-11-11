// Fails when a `.ds-tone-<name>` recipe in theme.css and `contexts.<name>` in
// tokens/contrast-pairs.json disagree. The matrix checks the roles a context
// replaces; this makes sure the CSS replaces exactly those roles, with exactly
// those tokens, and paints the context's surface (D-074).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(
  join(root, "packages/ui/src/styles/theme.css"),
  "utf8",
);
const { contexts } = JSON.parse(
  readFileSync(join(root, "tokens/contrast-pairs.json"), "utf8"),
);

// `colour.role` -> `--ds-colour-role`
const cssVar = (token) => `--ds-${token.replaceAll(".", "-")}`;

// Declarations of every `.ds-tone-<name> { ... }` rule, whitespace collapsed
// (Prettier wraps long `var(...)` calls over several lines).
const recipes = new Map();
for (const [, name, body] of css.matchAll(
  /\.ds-tone-([a-z0-9-]+)\s*\{([^}]*)\}/g,
)) {
  const decls = new Map();
  for (const decl of body.split(";")) {
    const m = /^\s*([a-z-]+)\s*:\s*([\s\S]+?)\s*$/.exec(decl);
    if (m) decls.set(m[1], m[2].replace(/\s+/g, "").replace(/\(\s*/g, "("));
  }
  recipes.set(name, decls);
}

const problems = [];
for (const name of recipes.keys())
  if (!(name in contexts))
    problems.push(
      `theme.css has .ds-tone-${name}, contrast-pairs.json has no context "${name}"`,
    );

for (const [name, { surface, map }] of Object.entries(contexts)) {
  const decls = recipes.get(name);
  if (!decls) {
    problems.push(
      `contrast-pairs.json context "${name}" has no .ds-tone-${name} recipe in theme.css`,
    );
    continue;
  }
  const expected = new Map(
    Object.entries(map).map(([role, token]) => [
      cssVar(role),
      `var(${cssVar(token)})`,
    ]),
  );
  expected.set("background-color", `var(${cssVar(surface)})`);
  // Text colour is whatever text.primary is inside the tone.
  expected.set("color", `var(${cssVar("text.primary")})`);
  for (const [prop, value] of expected)
    if (decls.get(prop) !== value)
      problems.push(
        `.ds-tone-${name}: ${prop} should be ${value}, found ${decls.get(prop) ?? "nothing"}`,
      );
  for (const prop of decls.keys())
    if (!expected.has(prop))
      problems.push(
        `.ds-tone-${name}: ${prop} is not in contexts.${name}.map (add it there so the contrast matrix checks it)`,
      );
}

if (problems.length) {
  console.error(`check-tone-recipes: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `check-tone-recipes: OK (${recipes.size} tone recipes match contrast-pairs.json)`,
);
