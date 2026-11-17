// Outputs of a resolved theme: a DTCG document and a CSS string (S33).
//
// - `toDtcg` has the shape of `tokens/themes/<name>/`: color, dimension, effects and
//   typography files holding the themeable primitives. Semantics are shared by every
//   theme (D-048), so a semantic override cannot live there; it is reported instead.
// - `toCss` has the shape of `themes/<name>.css`: primitives as literals, then the
//   semantic vars as `var()` references.
import { shadowAliases, parseShadow } from "./engine";
import { UnsafeValueError, parseAlias, safeValue, tokenType } from "./grammar";
import type { ResolvedTheme } from "./types";

type DtcgNode = { [key: string]: DtcgNode | string | number | object };
type DtcgFiles = Record<
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

// The files are DTCG Format Module 2025.10 (D-090): dimensions, durations,
// colours and shadows are objects, not CSS strings. A value that is not in a
// shape we can convert is written as it came, so `validate-tokens` reports it.

const hexByte = (n: number): string => n.toString(16).padStart(2, "0");

const hex8 = (raw: string | number): string => {
  const value = String(raw);
  const match = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(
    value,
  );
  if (!match) return value;
  const alpha = Math.round(Number(match[4]) * 255 + 1e-6);
  return `#${hexByte(Number(match[1]))}${hexByte(Number(match[2]))}${hexByte(Number(match[3]))}${alpha === 255 ? "" : hexByte(alpha)}`;
};

type Colour = {
  colorSpace: "srgb";
  components: number[];
  alpha?: number;
  hex: string;
};

/** "#rrggbb" / "#rrggbbaa" (or an `rgba()` string) -> a 2025.10 colour. */
const colour = (raw: string | number): Colour | string => {
  const value = hex8(raw);
  const match = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(value);
  if (!match) return value;
  const n = parseInt(match[1], 16);
  const result: Colour = {
    colorSpace: "srgb",
    components: [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
      (c) => +(c / 255).toFixed(4),
    ),
    hex: `#${match[1].toLowerCase()}`,
  };
  if (match[2] !== undefined) {
    const a = parseInt(match[2], 16);
    if (a !== 255) {
      // The shortest decimal that rounds back to the same byte.
      for (let digits = 2; digits <= 6; digits++) {
        const alpha = +(a / 255).toFixed(digits);
        if (Math.round(alpha * 255) === a) {
          result.alpha = alpha;
          break;
        }
      }
    }
  }
  return result;
};

type Dimension = { value: number; unit: "px" | "rem" };

/** "0.25rem" -> { value: 0.25, unit: "rem" }. */
const dimension = (raw: string | number): Dimension | string => {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(String(raw));
  return match
    ? { value: Number(match[1]), unit: match[2] as Dimension["unit"] }
    : String(raw);
};

/** "100ms" -> { value: 100, unit: "ms" }. */
const duration = (
  raw: string | number,
): { value: number; unit: "ms" | "s" } | string => {
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(String(raw));
  return match
    ? { value: Number(match[1]), unit: match[2] as "ms" | "s" }
    : String(raw);
};

/** "-0.02em" -> -0.02: a multiple of the font size (2025.10 has no em unit). */
const letterSpacing = (raw: string | number): number | string => {
  const match = /^(-?\d*\.?\d+)em$/.exec(String(raw));
  return match ? Number(match[1]) : String(raw);
};

const shadow = (raw: string | number): object => {
  const s = parseShadow(raw);
  return {
    color: colour(s.color),
    offsetX: dimension(s.offsetX),
    offsetY: dimension(s.offsetY),
    blur: dimension(s.blur),
    spread: dimension(s.spread),
  };
};

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
    value: colour,
  },
  {
    prefix: "--ds-space-",
    file: "dimension.json",
    path: ["space"],
    type: "dimension",
    split: false,
    value: dimension,
  },
  {
    prefix: "--ds-size-",
    file: "dimension.json",
    path: ["size"],
    type: "dimension",
    split: true,
    value: dimension,
  },
  {
    prefix: "--ds-radius-",
    file: "dimension.json",
    path: ["radius"],
    type: "dimension",
    split: false,
    value: dimension,
  },
  {
    prefix: "--ds-border-width-",
    file: "dimension.json",
    path: ["border-width"],
    type: "dimension",
    split: false,
    value: dimension,
  },
  {
    prefix: "--ds-ring-",
    file: "dimension.json",
    path: ["ring"],
    type: "dimension",
    split: false,
    value: dimension,
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
    value: duration,
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
    value: dimension,
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
    type: "number",
    split: false,
    value: letterSpacing,
  },
];

const child = (node: DtcgNode, key: string): DtcgNode => {
  const existing = node[key];
  if (existing && typeof existing === "object") return existing as DtcgNode;
  const created: DtcgNode = {};
  node[key] = created;
  return created;
};

const leafPath = (rule: Rule, key: string): string[] => {
  const rest = key.slice(rule.prefix.length);
  const dash = rest.indexOf("-");
  return rule.split && dash > 0
    ? [rest.slice(0, dash), rest.slice(dash + 1)]
    : [rest];
};

/** Where a value goes in a DTCG file: its path, its `$type` and how the value converts. */
export type DtcgSlot = {
  path: string[];
  type: string;
  convert: (raw: string | number) => unknown;
};

/** The DTCG slot of a themeable primitive var (`--ds-color-brand-600`), or `null`. */
export const primitiveSlot = (key: string): DtcgSlot | null => {
  const rule = RULES.find((candidate) => key.startsWith(candidate.prefix));
  return rule
    ? {
        path: [...rule.path, ...leafPath(rule, key)],
        type: rule.type,
        convert: rule.value,
      }
    : null;
};

/** The DTCG type and conversion for a role that holds a value of its own, by its token type. */
export const literalSlot = (
  key: string,
): Pick<DtcgSlot, "type" | "convert"> | null => {
  switch (tokenType(key)) {
    case "colour":
      return { type: "color", convert: colour };
    case "dimension":
      return { type: "dimension", convert: dimension };
    case "duration":
      return { type: "duration", convert: duration };
    case "easing":
      return { type: "cubicBezier", convert: bezier };
    case "shadow":
      return { type: "shadow", convert: shadow };
    case "fontFamily":
      return { type: "fontFamily", convert: family };
    case "number":
      if (key.includes("font-weight"))
        return { type: "fontWeight", convert: Number };
      return {
        type: "number",
        convert: key.includes("letter-spacing") ? letterSpacing : Number,
      };
    default:
      return null;
  }
};

/** The themeable primitives as the four DTCG files of a theme folder. */
export const toDtcg = (theme: ResolvedTheme): DtcgOutput => {
  const files: DtcgFiles = {
    "color.json": {},
    "dimension.json": {},
    "effects.json": {},
    "typography.json": {},
  };
  for (const [key, unchecked] of Object.entries(theme.primitives)) {
    const raw = safeValue(key, unchecked);
    const rule = RULES.find((candidate) => key.startsWith(candidate.prefix));
    if (!rule) throw new Error(`no DTCG rule for ${key}`);
    let group = files[rule.file];
    for (const segment of rule.path) group = child(group, segment);
    group.$type = rule.type;
    const path = leafPath(rule, key);
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
  // Every value is re-checked here (D-144): a value that does not parse for its token's
  // type throws instead of being written, whatever path it took to get this far.
  for (const [key, value] of Object.entries(theme.vars)) {
    if (key in theme.primitives)
      literals.push(`  ${key}: ${safeValue(key, value)};`);
    else if (key in theme.refs) {
      const target = parseAlias(theme.refs[key] ?? "");
      if (target === null || tokenType(target) === null)
        throw new UnsafeValueError(key, theme.refs[key]);
      semantics.push(`  ${key}: var(${target});`);
    } else if (key in shadowAliases)
      literals.push(`  ${key}: ${safeValue(key, value)};`);
    else semantics.push(`  ${key}: ${safeValue(key, value)};`);
  }
  return `${CSS_HEADER}\n:root,\n[data-ds-mode="light"] {\n  color-scheme: light;\n${[...literals, ...semantics].join("\n")}\n}\n`;
};
