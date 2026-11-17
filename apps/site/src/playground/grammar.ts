// Value grammar (S48, D-144). Anything read from a URL, a file or storage is untrusted,
// and a value ends up in a downloaded CSS or JSON file, so a value is accepted only if
// it matches one allow-list pattern for its token type. Everything else (a `;`, a `}`,
// `url(`, `@import`, `</style>`, a comment, a backslash) matches none and is refused.
// Pure: no React, no DOM.
//
// The accepted forms are the ones the system writes (see `scripts/lib/dtcg.mjs` for the
// DTCG object shapes these strings convert to): hex colours and `rgba()`, `px|rem|em`
// dimensions, `ms|s` durations, `cubic-bezier()`, one shadow layer, a font stack, and a
// plain number. Each parser returns a canonical string, or `null`.
import { themeMaps } from "./data";

export type ValueType =
  | "colour"
  | "dimension"
  | "duration"
  | "easing"
  | "shadow"
  | "fontFamily"
  | "number"
  | "alias";

const maxValueLength = 200;

const num = String.raw`-?(?:\d{1,4})(?:\.\d{1,4})?`;
const unsigned = String.raw`(?:\d{1,4})(?:\.\d{1,4})?`;

const finite = (text: string): number => Number(text);

/** `#rgb`, `#rrggbb`, `#rrggbbaa` or `rgba(r, g, b, a)` -> `#rrggbb`, `#rrggbbaa` or `rgba(...)`. */
const parseColour = (input: string): string | null => {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input);
  if (hex) {
    const digits = hex[1]!.toLowerCase();
    return digits.length === 3
      ? `#${[...digits].map((c) => c + c).join("")}`
      : `#${digits}`;
  }
  const rgba = new RegExp(
    `^rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*(?:,\\s*(${unsigned})\\s*)?\\)$`,
    "i",
  ).exec(input);
  if (!rgba) return null;
  const channels = [rgba[1], rgba[2], rgba[3]].map((c) => finite(c!));
  if (channels.some((c) => c > 255)) return null;
  const alpha = rgba[4] === undefined ? 1 : finite(rgba[4]);
  if (alpha > 1) return null;
  return `rgba(${channels.join(", ")}, ${alpha})`;
};

/** `1.5rem`, `-2px`, `0.02em`. A bare `0` is not accepted: a unit is always written. */
const parseDimension = (input: string): string | null =>
  new RegExp(`^(${num})(px|rem|em)$`).test(input) ? input : null;

/** `200ms`, `0.2s`: not negative. */
const parseDuration = (input: string): string | null =>
  new RegExp(`^(${unsigned})(ms|s)$`).test(input) ? input : null;

const easingKeywords = new Set([
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
]);

/** `cubic-bezier(x1, y1, x2, y2)` with x in 0..1, or a CSS easing keyword. */
const parseEasing = (input: string): string | null => {
  if (easingKeywords.has(input)) return input;
  const match = new RegExp(
    `^cubic-bezier\\(\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*\\)$`,
  ).exec(input);
  if (!match) return null;
  const [x1, y1, x2, y2] = [match[1], match[2], match[3], match[4]].map((n) =>
    finite(n!),
  ) as [number, number, number, number];
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return null;
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
};

/** One shadow layer: `offsetX offsetY blur spread colour` (the form the themes hold). */
const parseShadowValue = (input: string): string | null => {
  const parts = input.split(" ");
  if (parts.length !== 5) return null;
  const [x, y, blur, spread, colour] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];
  // A hex colour only: `rgba(…)` contains spaces and the themes never write it here.
  if (!/^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(colour)) return null;
  if (![x, y, blur, spread].every((p) => parseDimension(p) !== null))
    return null;
  if (blur.startsWith("-")) return null;
  return `${x} ${y} ${blur} ${spread} ${colour.toLowerCase()}`;
};

const bareFont = /^[A-Za-z][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+){0,5}$/;
const quotedFont = /^'[\p{L}\p{N} .&_-]{1,60}'$/u;

/** A font stack: up to eight comma-separated names, bare words or `'Quoted Name'`. */
const parseFontFamily = (input: string): string | null => {
  const items = input.split(",").map((item) => item.trim());
  if (items.length > 8) return null;
  return items.every(
    (item) => item !== "" && (bareFont.test(item) || quotedFont.test(item)),
  )
    ? items.join(", ")
    : null;
};

const fontName = /^[\p{L}\p{N}][\p{L}\p{N} .&_-]{0,59}$/u;

/**
 * A font's name as a person types it ("Space Grotesk"): letters, numbers, spaces and
 * `. & _ -`, up to 60 characters, with runs of spaces collapsed. Anything else is `null`,
 * so a name can never close a quote or carry CSS. The same set `quotedFont` allows.
 */
export const parseFontName = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  const text = input.replace(/\s+/g, " ").trim();
  return fontName.test(text) ? text : null;
};

/** A plain number (font weight, line height, a letter-spacing multiple). */
const parseNumber = (input: string): string | null =>
  new RegExp(`^${num}$`).test(input) ? String(Number(input)) : null;

/** The `--ds-*` name of another token. Whether it exists is checked against the theme. */
export const parseAlias = (input: string): string | null =>
  /^--ds-[a-z0-9]+(?:-[a-z0-9]+){0,6}$/.test(input) && input.length <= 80
    ? input
    : null;

const parsers: Record<ValueType, (input: string) => string | null> = {
  colour: parseColour,
  dimension: parseDimension,
  duration: parseDuration,
  easing: parseEasing,
  shadow: parseShadowValue,
  fontFamily: parseFontFamily,
  number: parseNumber,
  alias: parseAlias,
};

/** Parses `input` as `type`. Returns the canonical value or `null`. Never throws. */
export const parseValue = (type: ValueType, input: unknown): string | null => {
  const text =
    typeof input === "number" && Number.isFinite(input) ? String(input) : input;
  if (typeof text !== "string" || text.length > maxValueLength) return null;
  return parsers[type](text.trim());
};

// ---- the type of a token -------------------------------------------------------

/** What a `--ds-*` var holds, found from its value in the Base theme (every theme has
 * the same keys, D-048). A key no theme has is `null`: it is not a token. */
const classify = (key: string, value: string | number): ValueType | null => {
  if (key.includes("font-family")) return "fontFamily";
  const text = String(value);
  if (parseColour(text) !== null) return "colour";
  if (parseShadowValue(text) !== null) return "shadow";
  if (parseEasing(text) !== null) return "easing";
  if (parseDuration(text) !== null) return "duration";
  if (parseDimension(text) !== null) return "dimension";
  if (parseNumber(text) !== null) return "number";
  return null;
};

const baseVars = themeMaps.base.vars;
const types = new Map<string, ValueType>();
for (const [key, value] of Object.entries(baseVars)) {
  const type = classify(key, value);
  if (type) types.set(key, type);
}

/** The value type of a token, or `null` if it is not a known token. */
export const tokenType = (key: string): ValueType | null =>
  types.get(key) ?? null;

/**
 * The canonical form of an override value for a token, or `null` when the key is not a
 * token or the value is not allowed for its type. A value that names another token
 * (`--ds-…`) is accepted only for a semantic token and only when the target exists;
 * the engine still checks for cycles.
 */
export const parseOverride = (key: string, value: unknown): string | null => {
  const type = tokenType(key);
  if (!type || typeof value !== "string") return null;
  if (value.startsWith("--ds-")) {
    const alias = parseAlias(value);
    return alias !== null && types.has(alias) ? alias : null;
  }
  return parseValue(type, value);
};

export class UnsafeValueError extends Error {
  constructor(key: string, value: unknown) {
    super(
      `${key}: "${String(value).slice(0, 40)}" is not an allowed value, so it was not written`,
    );
    this.name = "UnsafeValueError";
  }
}

/**
 * The canonical value of one var for an output file. Throws `UnsafeValueError` when it
 * does not parse for its token's type: every formatter calls this, so a bad value can
 * be refused but never written.
 */
export const safeValue = (key: string, value: string | number): string => {
  const type = tokenType(key);
  const parsed = type ? parseValue(type, value) : null;
  if (parsed === null) throw new UnsafeValueError(key, value);
  return parsed;
};
