// The font snippet shown beside the "Build with it" files (spec 4.6): a `<link>` that asks
// a font host for the fonts the design names. The exported CSS only names families; a page
// still has to load them. Names go through `parseFontName`, so nothing but letters,
// numbers and spaces reaches the text. Pure: no React, no DOM.
import { parseFontName } from "../grammar";
import type { ResolvedTheme } from "../types";

const familyVars = ["--ds-font-family-heading", "--ds-font-family-body"];

/** Families every device already has: nothing to load. */
const builtIn = new Set([
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
  "georgia",
  "arial",
  "helvetica",
  "times new roman",
  "ui-sans-serif",
  "ui-serif",
]);

const leadingFamily = (stack: string): string =>
  (stack.split(",")[0] ?? "").trim().replace(/['"]/g, "");

/** The fonts the design names that a page has to load, once each, heading first. */
export const fontFamilies = (theme: ResolvedTheme): string[] => {
  const names: string[] = [];
  for (const key of familyVars) {
    const value = theme.vars[key];
    if (typeof value !== "string") continue;
    const name = parseFontName(leadingFamily(value));
    if (name === null || builtIn.has(name.toLowerCase())) continue;
    if (!names.includes(name)) names.push(name);
  }
  return names;
};

/**
 * The `<link>` line for the fonts, or `null` when the design uses only fonts every
 * device has. The host is fixed; only validated names are placed in the query.
 */
export const fontSnippet = (theme: ResolvedTheme): string | null => {
  const names = fontFamilies(theme);
  if (names.length === 0) return null;
  const query = names
    .map((name) => `family=${name.replace(/ /g, "+")}`)
    .join("&");
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${query}&display=swap">`;
};
