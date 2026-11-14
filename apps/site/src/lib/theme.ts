// Theme switching for the showcase (S32). Plain module: no "use client", so the
// server layout can read `themeInitScript` and the client switcher shares the rest.
//
// Flow: the user picks a theme, `activateTheme` import()s that theme's resolved JSON
// map (one chunk per theme, only the chosen one loads), applies its `vars` inline on
// <html> and caches the map in localStorage. `themeInitScript` (inline in <head>)
// applies the cached map before first paint, so a reload does not flash Base.

export const themeNames = ["base", "corporate", "nature", "quirky"] as const;
export type ThemeName = (typeof themeNames)[number];

export const themeLabels: Record<ThemeName, string> = {
  base: "Base",
  corporate: "Corporate",
  nature: "Nature",
  quirky: "Quirky",
};

export const defaultTheme: ThemeName = "base";
export const storageKey = "ds-theme";

// A few values (font weights) are numbers in the theme JSON.
export type ThemeVars = Record<string, string | number>;
export type StoredTheme = { name: ThemeName; vars?: ThemeVars };

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" &&
  (themeNames as readonly string[]).includes(value);

/**
 * The `next/font` CSS variable that holds each theme's heading and body family.
 * Theme JSON names a family ("Fraunces, Georgia, serif"), but next/font self-hosts
 * the file under a generated family name, so the leading family is swapped for the
 * font's variable and the theme's own fallback stack is kept.
 */
export const themeFontVars: Record<
  ThemeName,
  { heading: string; body: string }
> = {
  base: { heading: "--font-inter", body: "--font-inter" },
  corporate: { heading: "--font-plex", body: "--font-plex" },
  nature: { heading: "--font-fraunces", body: "--font-nunito" },
  quirky: { heading: "--font-bricolage", body: "--font-bricolage" },
};

const headingVar = "--ds-font-family-heading";
const bodyVar = "--ds-font-family-body";

const swapFamily = (stack: string, cssVar: string): string =>
  stack.replace(/^[^,]+/, `var(${cssVar})`);

export const withFonts = (name: ThemeName, vars: ThemeVars): ThemeVars => ({
  ...vars,
  [headingVar]: swapFamily(
    String(vars[headingVar] ?? ""),
    themeFontVars[name].heading,
  ),
  [bodyVar]: swapFamily(String(vars[bodyVar] ?? ""), themeFontVars[name].body),
});

type ThemeModule = { default: { vars: ThemeVars } };

// Literal specifiers so the bundler emits one chunk per theme. Base has no loader:
// its values come from `themes/base.css`, so choosing Base just clears the inline vars.
const loaders: Record<
  Exclude<ThemeName, "base">,
  () => Promise<ThemeModule>
> = {
  corporate: () => import("@puranderdua/ui/themes/corporate.json"),
  nature: () => import("@puranderdua/ui/themes/nature.json"),
  quirky: () => import("@puranderdua/ui/themes/quirky.json"),
};

export const readStoredTheme = (): StoredTheme | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && "name" in parsed) {
      const { name } = parsed as { name: unknown };
      if (isThemeName(name)) return parsed as StoredTheme;
    }
  } catch {
    // Storage blocked or corrupt: behave as if nothing was stored.
  }
  return null;
};

const writeStoredTheme = (stored: StoredTheme): void => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(stored));
  } catch {
    // Private mode or quota: the choice just is not remembered.
  }
};

/** Replaces the inline `--ds-*` vars on <html> with `vars` (none = back to Base). */
const applyTheme = (name: ThemeName, vars?: ThemeVars): void => {
  const root = document.documentElement;
  const stale: string[] = [];
  for (let i = 0; i < root.style.length; i++) {
    const prop = root.style.item(i);
    if (prop.startsWith("--ds-")) stale.push(prop);
  }
  for (const prop of stale) root.style.removeProperty(prop);
  for (const [prop, value] of Object.entries(vars ?? {})) {
    root.style.setProperty(prop, String(value));
  }
  root.setAttribute("data-ds-theme", name);
  for (const listener of listeners) listener();
};

// The applied theme lives on <html data-ds-theme>, which the head script may already
// have set before React runs. These three feed `useSyncExternalStore`.
const listeners = new Set<() => void>();

export const subscribeTheme = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getThemeSnapshot = (): ThemeName => {
  const applied = document.documentElement.getAttribute("data-ds-theme");
  return isThemeName(applied) ? applied : defaultTheme;
};

export const getServerThemeSnapshot = (): ThemeName => defaultTheme;

// Only the latest request may apply: a slow import must not undo a later choice.
let latestRequest = 0;

/** Loads (if needed), applies and remembers a theme. Rejects if the chunk fails. */
export const activateTheme = async (name: ThemeName): Promise<void> => {
  const request = ++latestRequest;
  if (name === "base") {
    applyTheme("base");
    writeStoredTheme({ name });
    return;
  }
  const mod = await loaders[name]();
  if (request !== latestRequest) return;
  const vars = withFonts(name, mod.default.vars);
  applyTheme(name, vars);
  writeStoredTheme({ name, vars });
};

/**
 * Runs inline in <head>, before first paint: applies the cached map. It only trusts
 * `--ds-*` keys and ignores anything malformed. ES5 on purpose: it is not transpiled.
 */
export const themeInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  storageKey,
)})||"null");if(!s||!s.vars||typeof s.name!=="string")return;var r=document.documentElement;for(var k in s.vars){if(k.indexOf("--ds-")===0)r.style.setProperty(k,String(s.vars[k]))}r.setAttribute("data-ds-theme",s.name)}catch(e){}})();`;
