// The curated heading and body fonts: the five fonts the site already loads with
// next/font (layout.tsx). `stack` is exactly what the theme JSON files hold, so
// choosing a theme's own font changes nothing; `cssVar` is the next/font variable the
// UI swaps in for the leading family (see `withFonts` in lib/theme.ts).
import type { FontId } from "./types";

export type FontChoice = {
  id: FontId;
  label: string;
  stack: string;
  cssVar: string;
};

export const fontChoices: readonly FontChoice[] = [
  {
    id: "inter",
    label: "Inter",
    stack: "Inter, system-ui, sans-serif",
    cssVar: "--font-inter",
  },
  {
    id: "plex",
    label: "IBM Plex Sans",
    stack: "'IBM Plex Sans', system-ui, sans-serif",
    cssVar: "--font-plex",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    stack: "Fraunces, Georgia, serif",
    cssVar: "--font-fraunces",
  },
  {
    id: "nunito",
    label: "Nunito Sans",
    stack: "'Nunito Sans', system-ui, sans-serif",
    cssVar: "--font-nunito",
  },
  {
    id: "bricolage",
    label: "Bricolage Grotesque",
    stack: "'Bricolage Grotesque', system-ui, sans-serif",
    cssVar: "--font-bricolage",
  },
];

/**
 * The Typography pairings (spec 4.4 row 3), each made only of fonts the site already
 * self-hosts, so choosing one never asks another server for a file. Fonts come from the
 * shipped looks: Clean and modern is Base, Classic and warm is Nature, Friendly and
 * round is Quirky's heading with Nature's body. The names are in the content file.
 */
export const fontPairings = [
  { id: "clean", heading: "inter", body: "inter" },
  { id: "classic", heading: "fraunces", body: "nunito" },
  { id: "friendly", heading: "bricolage", body: "nunito" },
] as const satisfies readonly { id: string; heading: FontId; body: FontId }[];

export type FontPairing = (typeof fontPairings)[number];

const genericFallback = "system-ui, sans-serif";

/** What follows the leading family in a stack: the fallbacks a missing font falls back to. */
export const fallbackOf = (stack: string): string => {
  const rest = stack.split(",").slice(1).join(",").trim();
  return rest === "" ? genericFallback : rest;
};

/**
 * A typed font name as a stack: the name, quoted, then the fallbacks of the stack it
 * replaces. `name` must already have passed `parseFontName`. This is what the exports
 * carry; the preview shows the fallbacks only (see `previewVars`).
 */
export const ownFontStack = (name: string, replaced: string): string =>
  `'${name}', ${fallbackOf(replaced)}`;

export const fontStack = (id: FontId): string => {
  const choice = fontChoices.find((font) => font.id === id);
  if (!choice) throw new RangeError(`unknown font "${id}"`);
  return choice.stack;
};
