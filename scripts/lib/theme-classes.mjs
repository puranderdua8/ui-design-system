// Parses the class lists `cn()` (tailwind-merge) needs out of theme.css. Shared
// by scripts/build-classes.mjs (writes ds-classes.ts) and utils.test.ts (checks
// the generated file), so the two cannot disagree about what a name looks like.

// Bridge namespaces that tailwind-merge sorts by value shape (T-shirt sizes,
// numbers). Without these, `shadow-ds-raised` reads as a shadow colour,
// `max-w-ds-md` and `rounded-ds-card` go ungrouped, and a later `shadow-md`
// would not replace them. Keys are tailwind-merge theme keys.
export const THEME_NAMESPACES = {
  shadow: "shadow",
  radius: "radius",
  container: "container",
  spacing: "spacing",
  ease: "ease",
};

const recipeList = (css, prefix) =>
  [...css.matchAll(new RegExp(`^\\s*\\.(${prefix}-[a-z0-9-]+)\\s*\\{`, "gm"))]
    .map((m) => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);

/**
 * @param {string} css contents of packages/ui/src/styles/theme.css
 * @returns the five lists, in file order, without duplicates
 */
export const parseThemeClasses = (css) => ({
  // `--text-ds-<size>:`; the size may contain hyphens (e.g. `control-px-sm`)
  sizes: [...css.matchAll(/--text-ds-([a-z0-9]+(?:-[a-z0-9]+)*):/g)]
    .map((m) => `ds-${m[1]}`)
    .filter((v, i, a) => a.indexOf(v) === i),
  typeRecipes: recipeList(css, "ds-type"),
  toneRecipes: recipeList(css, "ds-tone"),
  layerRecipes: recipeList(css, "ds-layer"),
  themeValues: Object.fromEntries(
    Object.entries(THEME_NAMESPACES).map(([key, ns]) => [
      key,
      [...css.matchAll(new RegExp(`--${ns}-(ds-[a-z0-9-]+):`, "g"))].map(
        (m) => m[1],
      ),
    ]),
  ),
});
