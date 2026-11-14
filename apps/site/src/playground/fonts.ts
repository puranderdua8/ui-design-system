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

export const fontStack = (id: FontId): string => {
  const choice = fontChoices.find((font) => font.id === id);
  if (!choice) throw new RangeError(`unknown font "${id}"`);
  return choice.stack;
};
