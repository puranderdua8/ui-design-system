// Design Tokens Format Module 2025.10 value shapes (D-090, R21), and the
// conversion of those values to the CSS strings Style Dictionary writes.
//   dimension  { value, unit: "px" | "rem" }
//   duration   { value, unit: "ms" | "s" }
//   color      { colorSpace: "srgb", components: [r, g, b], alpha?, hex? }
//   shadow     { color, offsetX, offsetY, blur, spread } (or an array of those)
// Only the subset the system uses is accepted. Anything else is a validation
// error, never silently passed on.

const DIMENSION_UNITS = ["px", "rem"];
const DURATION_UNITS = ["ms", "s"];
const COLOR_SPACES = ["srgb"];

// Letter-spacing is a unitless number in the source: a multiple of the font
// size. `em` is not a 2025.10 dimension unit, and `rem` would change the look
// of every heading (em follows the element's own font size), so the build
// writes the number as `em` and the generated CSS stays as it always was.
export const LETTER_SPACING_PATH = ["font", "letter-spacing"];

const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);
const byte = (n) => Math.round(n * 255);
const hexByte = (n) => n.toString(16).padStart(2, "0");

export const isDimension = (v) =>
  isObject(v) &&
  Object.keys(v).sort().join() === "unit,value" &&
  isFiniteNumber(v.value) &&
  DIMENSION_UNITS.includes(v.unit);

export const isDuration = (v) =>
  isObject(v) &&
  Object.keys(v).sort().join() === "unit,value" &&
  isFiniteNumber(v.value) &&
  v.value >= 0 &&
  DURATION_UNITS.includes(v.unit);

export const isColor = (v) =>
  isObject(v) &&
  Object.keys(v).every((k) =>
    ["colorSpace", "components", "alpha", "hex"].includes(k),
  ) &&
  COLOR_SPACES.includes(v.colorSpace) &&
  Array.isArray(v.components) &&
  v.components.length === 3 &&
  v.components.every((c) => isFiniteNumber(c) && c >= 0 && c <= 1) &&
  (v.alpha === undefined ||
    (isFiniteNumber(v.alpha) && v.alpha >= 0 && v.alpha <= 1)) &&
  (v.hex === undefined ||
    (typeof v.hex === "string" && /^#[0-9a-f]{6}$/i.test(v.hex)));

// `hex` is a fallback for tools that do not read components; it must agree.
export const colorHexMatches = (v) =>
  v.hex === undefined ||
  v.hex.toLowerCase() ===
    `#${v.components.map((c) => hexByte(byte(c))).join("")}`;

// "#rrggbb" or "#rrggbbaa" (any case) -> a colour object.
export const hexToColor = (hex) => {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) throw new Error(`unsupported colour "${hex}"`);
  const n = parseInt(m[1], 16);
  const components = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
    (c) => +(c / 255).toFixed(4),
  );
  const color = {
    colorSpace: "srgb",
    components,
    hex: `#${m[1].toLowerCase()}`,
  };
  if (m[2] !== undefined) {
    const a = parseInt(m[2], 16);
    if (a !== 255) {
      // The shortest decimal that rounds back to the same byte.
      for (let digits = 2; digits <= 6; digits++) {
        const alpha = +(a / 255).toFixed(digits);
        if (byte(alpha) === a) {
          color.alpha = alpha;
          break;
        }
      }
    }
  }
  return color;
};

// A colour object -> "#rrggbb" or "#rrggbbaa" (lower case).
const colorToHex = (v) => {
  const rgb = v.components.map((c) => hexByte(byte(c))).join("");
  const a = v.alpha === undefined ? 255 : byte(v.alpha);
  return `#${rgb}${a === 255 ? "" : hexByte(a)}`;
};

const dimensionToString = (v) => `${v.value}${v.unit}`;
const durationToString = (v) => `${v.value}${v.unit}`;

// A shadow layer object -> its CSS parts (what Style Dictionary turns into
// "0px 1px 3px 0px #0d0f121a").
const shadowToCss = (layer) => ({
  color: colorToHex(layer.color),
  offsetX: dimensionToString(layer.offsetX),
  offsetY: dimensionToString(layer.offsetY),
  blur: dimensionToString(layer.blur),
  spread: dimensionToString(layer.spread),
});

// Converts one raw (non-alias) $value of the given $type to the string form
// Style Dictionary's CSS transforms read. Types with no object form pass
// through unchanged.
export const toLegacyValue = (type, value) => {
  switch (type) {
    case "dimension":
      return dimensionToString(value);
    case "duration":
      return durationToString(value);
    case "color":
      return colorToHex(value);
    case "shadow":
      return Array.isArray(value) ? value.map(shadowToCss) : shadowToCss(value);
    default:
      return value;
  }
};
