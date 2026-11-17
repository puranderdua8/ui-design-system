// The Start and Colour steps' logic (S53, spec 4.4 rows 1 and 2). Pure: no React, no DOM,
// except `readImageColour`, which reads one picture in the browser and never sends it.
import { builderContent as content } from "../content/builder";
import { contrastRatio } from "./contrast";
import { parseValue } from "./grammar";
import { hexAt, read } from "./ramps";
import { startFrom, withKnobs } from "./state";
import type { Knobs, PlaygroundState, ThemeName, VarMap } from "./types";

// ---- a typed or picked colour ------------------------------------------------

export type BrandInput =
  { ok: true; hex: string } | { ok: false; message: string };

const invalid = (): BrandInput => ({
  ok: false,
  message: `${content.errors.colourInvalid.message} ${content.errors.colourInvalid.fix}`,
});

/**
 * Reads a colour a person typed, pasted or picked. Anything that is not a plain colour
 * code comes back as a sentence plus a suggestion (never stored). `#abc`, `abc` and
 * `#aabbcc` are accepted; a colour with transparency is not, because a brand colour has
 * to be solid to be checked.
 */
export const parseBrand = (input: string): BrandInput => {
  const text = input.trim();
  const withHash = /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(text)
    ? `#${text}`
    : text;
  const parsed = parseValue("colour", withHash);
  return parsed !== null && /^#[0-9a-f]{6}$/.test(parsed)
    ? { ok: true, hex: parsed }
    : invalid();
};

// ---- a colour from a picture --------------------------------------------------

/**
 * The most characteristic colour in a picture's pixels (RGBA bytes): pixels are grouped
 * into coarse colour buckets and the biggest bucket wins, with colourful pixels
 * counting for more, so a white background or black outline does not win over the
 * subject. Transparent pixels are skipped. Returns `null` for an empty picture.
 */
export const dominantColour = (pixels: ArrayLike<number>): string | null => {
  const buckets = new Map<
    number,
    { score: number; r: number; g: number; b: number; n: number }
  >();
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3]! < 128) continue;
    const r = pixels[i]!;
    const g = pixels[i + 1]!;
    const b = pixels[i + 2]!;
    const max = Math.max(r, g, b);
    const spread = (max - Math.min(r, g, b)) / 255;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { score: 0, r: 0, g: 0, b: 0, n: 0 };
    bucket.score += 0.1 + spread;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }
  let best: {
    score: number;
    r: number;
    g: number;
    b: number;
    n: number;
  } | null = null;
  for (const bucket of buckets.values())
    if (!best || bucket.score > best.score) best = bucket;
  if (!best) return null;
  const channel = (sum: number): string =>
    Math.round(sum / best.n)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(best.r)}${channel(best.g)}${channel(best.b)}`;
};

const maxImageBytes = 10 * 1024 * 1024;

/**
 * Reads one picture file in the browser and returns its main colour, or `null`. The file
 * is drawn on a small canvas and dropped: nothing is uploaded, stored or kept.
 */
export const readImageColour = async (file: File): Promise<string | null> => {
  if (!file.type.startsWith("image/") || file.size > maxImageBytes) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, size, size);
    bitmap.close();
    return dominantColour(context.getImageData(0, 0, size, size).data);
  } catch {
    return null;
  }
};

// ---- background feel ------------------------------------------------------------

export const feelIds = ["cool", "neutral", "warm", "tinted"] as const;
export type Feel = (typeof feelIds)[number];

const feelChroma = 0.014;
const feelHues = { cool: 250, warm: 70 } as const;

const brandHue = (state: PlaygroundState): number | null => {
  const brand = state.knobs.brand;
  if (!brand) return null;
  const { c, h } = read(brand);
  return c < 0.02 ? null : h;
};

/** The neutral-scale setting a feel stands for. "Tinted" follows the brand colour. */
const feelNeutral = (feel: Feel, state: PlaygroundState): Knobs["neutral"] => {
  if (feel === "neutral") return { chroma: 0 };
  if (feel === "tinted")
    return { hue: brandHue(state) ?? feelHues.cool, chroma: feelChroma };
  return { hue: feelHues[feel], chroma: feelChroma };
};

const hueGap = (a: number, b: number): number => {
  const gap = Math.abs(a - b) % 360;
  return Math.min(gap, 360 - gap);
};

/** Which feel the project has now, or `undefined` for "the greys of the starting look". */
export const currentFeel = (state: PlaygroundState): Feel | undefined => {
  const tint = state.knobs.neutral;
  if (!tint) return undefined;
  if ((tint.chroma ?? 1) < 0.002) return "neutral";
  if (tint.hue === undefined) return undefined;
  const brand = brandHue(state);
  if (brand !== null && hueGap(tint.hue, brand) < 3) return "tinted";
  if (hueGap(tint.hue, feelHues.cool) < 3) return "cool";
  if (hueGap(tint.hue, feelHues.warm) < 3) return "warm";
  return undefined;
};

export const withFeel = (
  state: PlaygroundState,
  feel: Feel | undefined,
): PlaygroundState =>
  withKnobs(state, {
    neutral: feel === undefined ? undefined : feelNeutral(feel, state),
  });

// ---- setting the brand colour and the look ---------------------------------------

/**
 * Sets the brand colour, or clears it for `undefined`. A "tinted to brand" background
 * keeps following the colour. Highlight and fine-tunes are untouched.
 */
export const withBrand = (
  state: PlaygroundState,
  hex: string | undefined,
): PlaygroundState => {
  const tinted = currentFeel(state) === "tinted";
  const next = withKnobs(state, { brand: hex });
  return tinted ? withFeel(next, "tinted") : next;
};

/**
 * Picks a starting look. The brand colour (and the highlight) the person chose stay;
 * everything else starts again from the look, as in the playground.
 */
export const withLook = (
  state: PlaygroundState,
  look: ThemeName,
): PlaygroundState => {
  const fresh = startFrom(look);
  return withKnobs(fresh, {
    brand: state.knobs.brand,
    accent: state.knobs.accent,
  });
};

// ---- a readability line under each colour -------------------------------------------

export type ColourKind = "brand" | "highlight" | "background";

const pairFor: Record<ColourKind, [string, string]> = {
  brand: ["--ds-action-primary-fg", "--ds-action-primary-bg"],
  highlight: ["--ds-text-accent", "--ds-surface-canvas"],
  background: ["--ds-text-primary", "--ds-surface-canvas"],
};

/** The plain sentence under a colour: is the text that sits on or beside it readable? */
export const readabilityLine = (vars: VarMap, kind: ColourKind): string => {
  const [fg, bg] = pairFor[kind];
  let ok = false;
  try {
    ok = contrastRatio(String(vars[fg]), String(vars[bg])) >= 4.5;
  } catch {
    ok = false;
  }
  const text = content.colour;
  if (kind === "brand") return ok ? text.readableBrand : text.hardBrand;
  return ok ? text.readable : text.hard;
};

// ---- suggestions ---------------------------------------------------------------------

/** A step-by-step strip of the brand colour's shades (50 to 900), as `#rrggbb`. */
export const shadeStrip = (vars: VarMap): { step: string; hex: string }[] =>
  ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map(
    (step) => ({ step, hex: String(vars[`--ds-color-brand-${step}`]) }),
  );

/** A neutral swatch for a feel (its mid grey), used to draw the background choices. */
export const feelSwatch = (feel: Feel, state: PlaygroundState): string => {
  const tint = feelNeutral(feel, state) ?? {};
  return hexAt(0.93, (tint.chroma ?? 0) * 0.6, tint.hue ?? 0);
};
