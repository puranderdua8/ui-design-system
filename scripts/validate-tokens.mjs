// Sanity checks for the DTCG token source in tokens/.
// - every token has $value and an (own or inherited) $type
// - primitives hold raw values in the right format for their $type
// - aliases resolve to existing tokens of the matching $type
// - semantic tokens alias primitives only (no raw values, no semantic -> semantic)
// - semantic tokens carry a $description
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

const primitives = collect("primitives");
const semantic = collect("semantic");

for (const name of semantic.keys())
  if (primitives.has(name))
    fail(`token ${name} exists in both primitives and semantic`);

for (const token of primitives.values()) {
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

for (const token of semantic.values()) {
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
      fail(`${token.where}: ${label} aliases missing token ${m[1]}`);
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
  `validate-tokens: OK (${primitives.size} primitives, ${semantic.size} semantic)`,
);
