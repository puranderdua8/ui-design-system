// "@puranderdua/ui" format (spec 4.6): the CSS file a project that uses the package imports
// after `foundations.css`. It is the same theme file the theme-folder export writes
// (roles keep pointing at the shades, so the package's components follow every change),
// with the credit line first. Every value is re-checked by `toCss` (D-144). Pure.
import { themeSlug } from "../export";
import { toCss } from "../output";
import type { ResolvedTheme } from "../types";
import { credit } from "./credit";

export type PackageCss = { name: string; mime: string; content: string };

export const toPackageCss = (
  theme: ResolvedTheme,
  name = "custom",
): PackageCss => ({
  name: `${themeSlug(name)}.css`,
  mime: "text/css",
  content: `/* ${credit} */\n${toCss(theme)}`,
});
