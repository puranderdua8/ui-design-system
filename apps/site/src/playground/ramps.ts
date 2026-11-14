// OKLCH colour ramps (culori). Same idea as the S29 themes: a fixed lightness per step,
// the hue and chroma of the chosen colour, chroma reduced until the colour fits sRGB.
import { clampChroma, converter, formatHex, parse } from "culori";
import type { VarMap } from "./types";

const toOklch = converter("oklch");

export const brandSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export const neutralSteps = [
  "0",
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const hexAt = (l: number, c: number, h: number): string =>
  formatHex(clampChroma({ mode: "oklch", l, c, h }, "oklch"));

const read = (hex: string) => {
  const color = parse(hex);
  if (!color) throw new RangeError(`not a colour: "${hex}"`);
  const { l, c, h } = toOklch(color);
  return { l, c: c ?? 0, h: h ?? 0 };
};

/** Where each step sits between the 600 step and the light end (top) / dark end (bottom). */
const toTop = {
  "500": 0.18,
  "400": 0.36,
  "300": 0.56,
  "200": 0.74,
  "100": 0.88,
  "50": 1,
};
const toBottom = { "700": 0.38, "800": 0.7, "900": 1 };

/** Share of the chosen chroma kept at each step: pale tints and deep shades are calmer. */
const brandChroma: Record<(typeof brandSteps)[number], number> = {
  "50": 0.15,
  "100": 0.28,
  "200": 0.45,
  "300": 0.68,
  "400": 0.88,
  "500": 0.97,
  "600": 1,
  "700": 0.92,
  "800": 0.78,
  "900": 0.6,
};

/**
 * A 50-900 scale around `hex`, which becomes step 600 (the primary, as in the shipped
 * themes). Lightness falls strictly from 50 to 900. A colour whose lightness is outside
 * 0.2-0.9 is moved into that range first, so a near-white pick still gives a usable scale.
 */
export const brandRamp = (hex: string): Record<string, string> => {
  const { l, c, h } = read(hex);
  const l600 = Math.min(0.9, Math.max(0.2, l));
  const top = Math.min(0.995, Math.max(0.975, l600 + 0.1));
  const bottom = Math.max(0.05, Math.min(0.27, l600 - 0.1));
  const out: Record<string, string> = {};
  for (const step of brandSteps) {
    let lightness = l600;
    if (step in toTop)
      lightness = l600 + (top - l600) * toTop[step as keyof typeof toTop];
    if (step in toBottom)
      lightness =
        l600 + (bottom - l600) * toBottom[step as keyof typeof toBottom];
    out[step] =
      step === "600" && l600 === l
        ? formatHex(parse(hex)!)
        : hexAt(lightness, c * brandChroma[step], h);
  }
  return out;
};

/** Chroma profile of a neutral scale, relative to the chroma chosen for the mid steps. */
const neutralChroma: Record<(typeof neutralSteps)[number], number> = {
  "0": 0.35,
  "50": 0.5,
  "100": 0.6,
  "200": 0.75,
  "300": 0.9,
  "400": 1,
  "500": 1,
  "600": 1,
  "700": 0.95,
  "800": 0.85,
  "900": 0.7,
  "950": 0.55,
};

/**
 * A 0-950 neutral scale in the given hue and chroma. Each step keeps the lightness it
 * has in `start` (the starting theme's neutral scale), so contrast between the steps
 * barely moves when only the tint changes. Unset hue/chroma come from `neutral-500`.
 */
export const neutralRamp = (
  start: VarMap,
  tint: { hue?: number; chroma?: number },
): Record<string, string> => {
  const mid = read(String(start["--ds-color-neutral-500"]));
  const hue = tint.hue ?? (mid.c > 0.002 ? mid.h : 260);
  const chroma = tint.chroma ?? mid.c;
  const out: Record<string, string> = {};
  for (const step of neutralSteps) {
    const { l } = read(String(start[`--ds-color-neutral-${step}`]));
    out[step] = hexAt(l, chroma * neutralChroma[step], hue);
  }
  return out;
};
