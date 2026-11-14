// Outputs of a resolved theme: a DTCG document and a CSS string (S33).
//
// - `toDtcg` has the shape of `tokens/themes/<name>/`: color, dimension, effects and
//   typography files holding the themeable primitives. Semantics are shared by every
//   theme (D-048), so a semantic override cannot live there; it is reported instead.
// - `toCss` has the shape of `themes/<name>.css`: primitives as literals, then the
//   semantic vars as `var()` references.
import { shadowAliases, parseShadow } from "./engine";
import type { ResolvedTheme, VarMap } from "./types";

export type DtcgNode = { [key: string]: DtcgNode | string | number | object };
export type DtcgFiles = Record<
  "color.json" | "dimension.json" | "effects.json" | "typography.json",
  DtcgNode
>;
export type DtcgOutput = {
  files: DtcgFiles;
  /** Overridden semantic vars that the files cannot hold. */
  unrepresentable: string[];
};

type Rule = {
  prefix: string;
  file: keyof DtcgFiles;
  /** Group path in the file; the group carries the `$type`. */
  path: string[];
  type: string;
  /** Split the rest of the name once on "-" (`control-sm` -> control, sm). */
  split: boolean;
  value: (raw: string | number) => unknown;
};

const text = (raw: string | number): string => String(raw);

const hex8 = (raw: string | number): string => {
  const value = String(raw);
  const match = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(
    value,
  );
  if (!match) return value;
  const byte = (n: number): string => n.toString(16).padStart(2, "0");
  const alpha = Math.round(Number(match[4]) * 255 + 1e-6);
  return `#${byte(Number(match[1]))}${byte(Number(match[2]))}${byte(Number(match[3]))}${alpha === 255 ? "" : byte(alpha)}`;
};

const shadow = (raw: string | number): object => parseShadow(raw);

const bezier = (raw: string | number): number[] => {
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(String(raw));
  if (!match) throw new Error(`unsupported easing "${raw}"`);
  return match[1].split(",").map(Number);
};

// The DTCG files write font names unquoted; Style Dictionary adds the quotes in CSS.
const family = (raw: string | number): string =>
  String(raw).replace(/'([^']+)'/g, "$1");

const RULES: Rule[] = [
  {
    prefix: "--ds-color-",
    file: "color.json",
    path: ["color"],
    type: "color",
    split: true,
    value: hex8,
  },
  {
    prefix: "--ds-space-",
    file: "dimension.json",
    path: ["space"],
    type: "dimension",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-size-",
    file: "dimension.json",
    path: ["size"],
    type: "dimension",
    split: true,
    value: text,
  },
  {
    prefix: "--ds-radius-",
    file: "dimension.json",
    path: ["radius"],
    type: "dimension",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-border-width-",
    file: "dimension.json",
    path: ["border-width"],
    type: "dimension",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-ring-",
    file: "dimension.json",
    path: ["ring"],
    type: "dimension",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-shadow-",
    file: "effects.json",
    path: ["shadow"],
    type: "shadow",
    split: false,
    value: shadow,
  },
  {
    prefix: "--ds-duration-",
    file: "effects.json",
    path: ["duration"],
    type: "duration",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-easing-",
    file: "effects.json",
    path: ["easing"],
    type: "cubicBezier",
    split: false,
    value: bezier,
  },
  {
    prefix: "--ds-font-family-",
    file: "typography.json",
    path: ["font", "family"],
    type: "fontFamily",
    split: false,
    value: family,
  },
  {
    prefix: "--ds-font-size-",
    file: "typography.json",
    path: ["font", "size"],
    type: "dimension",
    split: false,
    value: text,
  },
  {
    prefix: "--ds-font-weight-",
    file: "typography.json",
    path: ["font", "weight"],
    type: "fontWeight",
    split: false,
    value: Number,
  },
  {
    prefix: "--ds-font-line-height-",
    file: "typography.json",
    path: ["font", "line-height"],
    type: "number",
    split: false,
    value: Number,
  },
  {
    prefix: "--ds-font-letter-spacing-",
    file: "typography.json",
    path: ["font", "letter-spacing"],
    type: "dimension",
    split: false,
    value: text,
  },
];

const child = (node: DtcgNode, key: string): DtcgNode => {
  const existing = node[key];
  if (existing && typeof existing === "object") return existing as DtcgNode;
  const created: DtcgNode = {};
  node[key] = created;
  return created;
};

/** The themeable primitives as the four DTCG files of a theme folder. */
export const toDtcg = (theme: ResolvedTheme): DtcgOutput => {
  const files: DtcgFiles = {
    "color.json": {},
    "dimension.json": {},
    "effects.json": {},
    "typography.json": {},
  };
  for (const [key, raw] of Object.entries(theme.primitives)) {
    const rule = RULES.find((candidate) => key.startsWith(candidate.prefix));
    if (!rule) throw new Error(`no DTCG rule for ${key}`);
    let group = files[rule.file];
    for (const segment of rule.path) group = child(group, segment);
    group.$type = rule.type;
    const rest = key.slice(rule.prefix.length);
    const dash = rest.indexOf("-");
    const path =
      rule.split && dash > 0
        ? [rest.slice(0, dash), rest.slice(dash + 1)]
        : [rest];
    let node = group;
    for (const segment of path.slice(0, -1)) node = child(node, segment);
    node[path[path.length - 1]] = { $value: rule.value(raw) as string };
  }
  return { files, unrepresentable: [...theme.semanticOverrides] };
};

const CSS_HEADER = `/**
 * Do not edit directly, this file was authored in the Theme Playground.
 */
`;

/** A `themes/<name>.css` string: primitives as literals, semantics as `var()` refs. */
export const toCss = (theme: ResolvedTheme): string => {
  const literals: string[] = [];
  const semantics: string[] = [];
  for (const [key, value] of Object.entries(theme.vars)) {
    if (key in theme.primitives) literals.push(`  ${key}: ${value};`);
    else if (key in theme.refs)
      semantics.push(`  ${key}: var(${theme.refs[key]});`);
    else if (key in shadowAliases) literals.push(`  ${key}: ${value};`);
    else semantics.push(`  ${key}: ${value};`);
  }
  return `${CSS_HEADER}\n:root {\n${[...literals, ...semantics].join("\n")}\n}\n`;
};

export type { VarMap };
