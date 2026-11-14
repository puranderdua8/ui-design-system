// Export of a resolved playground theme (S35): the four DTCG files of a theme folder
// plus the CSS file. Pure (no DOM), so the round-trip test can write the same bytes the
// browser downloads.
import { toCss, toDtcg } from "./output";
import type { ResolvedTheme } from "./types";

export type ExportFile = {
  /** File name inside `tokens/themes/<name>/`, or `<name>.css` for the CSS. */
  name: string;
  mime: string;
  content: string;
};

export type ThemeExport = {
  /** The DTCG files first, then the CSS. */
  files: ExportFile[];
  /** Overridden semantic vars that no theme folder can hold (semantics are shared). */
  unrepresentable: string[];
};

/** A theme name usable as a folder and a CSS file name. */
export const themeSlug = (input: string): string => {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "custom" : slug;
};

export const exportTheme = (
  theme: ResolvedTheme,
  name = "custom",
): ThemeExport => {
  const slug = themeSlug(name);
  const { files, unrepresentable } = toDtcg(theme);
  return {
    files: [
      ...Object.entries(files).map(([file, node]) => ({
        name: file,
        mime: "application/json",
        content: `${JSON.stringify(node, null, 2)}\n`,
      })),
      { name: `${slug}.css`, mime: "text/css", content: toCss(theme) },
    ],
    unrepresentable,
  };
};
