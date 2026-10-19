// Sanity checks for the DTCG token source in tokens/ (or the dir in argv[2]).
// - tokens/resolver.json lists the sources; every token file is listed
// - every token has $value and an (own or inherited) $type
// - primitives hold raw values in the right format for their $type
// - every theme defines exactly Base's themeable keys, with the same types (D-048)
// - aliases resolve to existing tokens of the matching $type, in every theme
// - semantic tokens alias primitives only (no raw values, no semantic -> semantic)
// - semantic tokens carry a $description
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadResolver } from "./lib/resolver.mjs";

const root =
  process.argv[2] ??
  join(dirname(fileURLToPath(import.meta.url)), "..", "tokens");
const TYPES = new Set([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "number",
  "typography",
]);
// Type each typography composite property must alias.
const PART_TYPES = {
  fontFamily: "fontFamily",
  fontSize: "dimension",
  fontWeight: "fontWeight",
  lineHeight: "number",
  letterSpacing: "dimension",
};
// Raw value formats for primitives.
const VALUE_CHECKS = {
  color: (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v),
  dimension: (v) =>
    typeof v === "string" && /^-?(\d+|\d*\.\d+)(rem|em|px)$/.test(v),
  fontWeight: (v) => Number.isInteger(v) && v >= 1 && v <= 1000,
  number: (v) => typeof v === "number" && Number.isFinite(v),
  fontFamily: (v) => typeof v === "string" && v.trim() !== "",
};
const FORMAT_HINT = {
  color: "#rrggbb",
  dimension: "a number with rem, em or px",
  fontWeight: "an integer 1-1000",
  number: "a finite number",
  fontFamily: "a non-empty font stack",
};
const ALIAS = /^\{([^{}]+)\}$/;

const errors = [];
// Semantic checks repeat per theme; report each distinct problem once.
const fail = (msg) => {
  if (!errors.includes(msg)) errors.push(msg);
};

function collect(files) {
  const tokens = new Map();
  for (const file of files) {
    const where = relative(root, file);
    let json;
    try {
      json = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      fail(`${where}: invalid JSON (${e.message})`);
      continue;
    }
    walk(json, [], undefined, where, tokens);
  }
  return tokens;
}

function walk(node, path, inheritedType, where, tokens) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (key.includes(".") || key.includes("{") || key.includes("}")) {
      fail(`${where}: invalid key "${key}" (no "." or braces)`);
      continue;
    }
    const p = [...path, key];
    const name = p.join(".");
    if (child === null || typeof child !== "object" || Array.isArray(child)) {
      fail(`${where}: ${name} must be an object`);
      continue;
    }
    const type = child.$type ?? inheritedType;
    if ("$value" in child) {
      if (tokens.has(name)) fail(`${where}: duplicate token ${name}`);
      if (!type) fail(`${where}: ${name} has no $type (own or inherited)`);
      else if (!TYPES.has(type))
        fail(`${where}: ${name} unknown $type "${type}"`);
      tokens.set(name, {
        name,
        type,
        value: child.$value,
        description: child.$description,
        where,
      });
    } else {
      walk(child, p, type, where, tokens);
    }
  }
}

// Returns [{ part, type, value }] for each aliasable/raw leaf of a token.
function leaves(token) {
  if (token.type === "typography") {
    const v = token.value;
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      fail(`${token.where}: ${token.name} typography $value must be an object`);
      return [];
    }
    const expected = Object.keys(PART_TYPES);
    for (const k of expected)
      if (!(k in v)) fail(`${token.where}: ${token.name} missing "${k}"`);
    for (const k of Object.keys(v))
      if (!expected.includes(k))
        fail(`${token.where}: ${token.name} unknown property "${k}"`);
    return Object.entries(v)
      .filter(([k]) => k in PART_TYPES)
      .map(([part, value]) => ({ part, type: PART_TYPES[part], value }));
  }
  return [{ part: null, type: token.type, value: token.value }];
}

let resolver;
try {
  resolver = loadResolver(root);
} catch (e) {
  console.error(`validate-tokens: ${e.message}`);
  process.exit(1);
}

// Every .json under tokens/ (except the manifest) must be reachable from it.
const listed = new Set([
  ...resolver.shared,
  ...resolver.semantic,
  ...Object.values(resolver.themes).flat(),
]);
const onDisk = readdirSync(root, { recursive: true })
  .filter((f) => f.endsWith(".json") && f !== "resolver.json")
  .map((f) => join(root, f));
for (const f of onDisk)
  if (!listed.has(f))
    fail(`${relative(root, f)} is not listed in resolver.json`);
for (const f of listed)
  if (!onDisk.includes(f))
    fail(`resolver.json lists missing file ${relative(root, f)}`);

const shared = collect(resolver.shared);
const semantic = collect(resolver.semantic);
const themed = Object.fromEntries(
  Object.entries(resolver.themes).map(([name, files]) => [
    name,
    collect(files),
  ]),
);

for (const [name, prims] of Object.entries(themed))
  for (const k of shared.keys())
    if (prims.has(k))
      fail(`theme ${name}: ${k} also exists in shared primitives`);

// Completeness (D-048): same keys and types as Base in every theme.
const base = themed[resolver.defaultTheme];
for (const [name, prims] of Object.entries(themed)) {
  if (name === resolver.defaultTheme) continue;
  for (const [k, t] of base)
    if (!prims.has(k))
      fail(
        `theme ${name} is missing ${k} (defined in ${resolver.defaultTheme})`,
      );
    else if (prims.get(k).type !== t.type)
      fail(
        `theme ${name}: ${k} is ${prims.get(k).type}, ${resolver.defaultTheme} has ${t.type}`,
      );
  for (const k of prims.keys())
    if (!base.has(k))
      fail(
        `theme ${name} defines ${k}, which ${resolver.defaultTheme} does not`,
      );
}

for (const [themeName, themePrims] of Object.entries(themed)) {
  const primitives = new Map([...shared, ...themePrims]);
  for (const token of primitives.values()) checkPrimitive(token);
  const where = Object.keys(themed).length > 1 ? ` (theme ${themeName})` : "";
  for (const name of semantic.keys())
    if (primitives.has(name))
      fail(`token ${name} exists in both primitives and semantic${where}`);
  for (const token of semantic.values())
    checkSemantic(token, primitives, where);
}

function checkPrimitive(token) {
  for (const { part, type, value } of leaves(token)) {
    if (typeof value === "string" && ALIAS.test(value)) {
      fail(
        `${token.where}: primitive ${token.name} must hold a raw value, not an alias`,
      );
      continue;
    }
    const check = VALUE_CHECKS[type];
    if (check && !check(value))
      fail(
        `${token.where}: ${token.name}${part ? `.${part}` : ""} has invalid ${type} value ${JSON.stringify(value)} (expected ${FORMAT_HINT[type]})`,
      );
  }
}

function checkSemantic(token, primitives, where) {
  if (typeof token.description !== "string" || token.description.trim() === "")
    fail(`${token.where}: semantic ${token.name} needs a $description`);
  for (const { part, type, value } of leaves(token)) {
    const label = `${token.name}${part ? `.${part}` : ""}`;
    const m = typeof value === "string" ? ALIAS.exec(value) : null;
    if (!m) {
      fail(
        `${token.where}: semantic ${label} must be an alias, got ${JSON.stringify(value)}`,
      );
      continue;
    }
    const target = primitives.get(m[1]);
    if (semantic.has(m[1]))
      fail(
        `${token.where}: ${label} aliases semantic token ${m[1]} (primitives only)`,
      );
    else if (!target)
      fail(`${token.where}: ${label} aliases missing token ${m[1]}${where}`);
    else if (type && target.type !== type)
      fail(
        `${token.where}: ${label} is ${type} but aliases ${m[1]} which is ${target.type}`,
      );
  }
}

if (errors.length) {
  console.error(`validate-tokens: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `validate-tokens: OK (${Object.keys(themed).length} theme(s), ${themed[resolver.defaultTheme].size} themeable + ${shared.size} shared primitives, ${semantic.size} semantic)`,
);
