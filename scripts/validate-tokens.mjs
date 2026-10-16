// Sanity checks for the DTCG token source in tokens/.
// - every token has $value and an (own or inherited) $type
// - aliases resolve to existing tokens
// - semantic tokens alias primitives only (no raw values, no semantic -> semantic)
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "tokens");
const TYPES = new Set([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "number",
  "typography",
]);
const COMPOSITE_KEYS = {
  typography: [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
  ],
};
const ALIAS = /^\{([^{}]+)\}$/;

const errors = [];
const fail = (msg) => errors.push(msg);

function collect(tier) {
  const dir = join(root, tier);
  const tokens = new Map();
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const where = `${tier}/${file}`;
    let json;
    try {
      json = JSON.parse(readFileSync(join(dir, file), "utf8"));
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
      tokens.set(name, { name, type, value: child.$value, where });
    } else {
      walk(child, p, type, where, tokens);
    }
  }
}

function leaves(token) {
  if (token.type === "typography") {
    const v = token.value;
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      fail(`${token.where}: ${token.name} typography $value must be an object`);
      return [];
    }
    const expected = COMPOSITE_KEYS.typography;
    for (const k of expected)
      if (!(k in v)) fail(`${token.where}: ${token.name} missing "${k}"`);
    for (const k of Object.keys(v))
      if (!expected.includes(k))
        fail(`${token.where}: ${token.name} unknown property "${k}"`);
    return Object.values(v);
  }
  return [token.value];
}

const primitives = collect("primitives");
const semantic = collect("semantic");

for (const name of semantic.keys())
  if (primitives.has(name))
    fail(`token ${name} exists in both primitives and semantic`);

for (const token of primitives.values()) {
  for (const v of leaves(token)) {
    if (typeof v === "string" && ALIAS.test(v))
      fail(
        `${token.where}: primitive ${token.name} must hold a raw value, not an alias`,
      );
  }
}

for (const token of semantic.values()) {
  for (const v of leaves(token)) {
    const m = typeof v === "string" ? ALIAS.exec(v) : null;
    if (!m) {
      fail(
        `${token.where}: semantic ${token.name} must be an alias, got ${JSON.stringify(v)}`,
      );
      continue;
    }
    if (semantic.has(m[1]))
      fail(
        `${token.where}: ${token.name} aliases semantic token ${m[1]} (primitives only)`,
      );
    else if (!primitives.has(m[1]))
      fail(`${token.where}: ${token.name} aliases missing token ${m[1]}`);
  }
}

if (errors.length) {
  console.error(`validate-tokens: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `validate-tokens: OK (${primitives.size} primitives, ${semantic.size} semantic)`,
);
