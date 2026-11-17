// "Any site" format (spec 4.6): one `:root` block of resolved custom properties. Every
// value is a literal, so the file works on a plain HTML page without the package. It
// carries the decisions, not components. Pure: no React, no DOM.
import { safeValue } from "../grammar";
import type { ResolvedTheme } from "../types";
import { credit } from "./credit";

/**
 * The CSS text. Every value goes through the grammar (D-144), so a value that does not
 * parse for its token's type throws `UnsafeValueError` instead of being written.
 */
export const toCssVars = (theme: ResolvedTheme): string => {
  const lines = Object.entries(theme.vars).map(
    ([key, value]) => `  ${key}: ${safeValue(key, value)};`,
  );
  return `/* ${credit} */\n:root {\n${lines.join("\n")}\n}\n`;
};
