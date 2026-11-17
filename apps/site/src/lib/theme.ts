// "Showing examples in" (S32, reworked in S50 for D-128). Plain module: no "use client",
// so the server layout can read `themeInitScript` and the client parts share the rest.
//
// The tool's own chrome always wears Base: nothing is applied to <html>. The chosen
// look only reaches examples, through `ExamplesScope` (a ThemeScope that reads this
// store). Flow: the user picks a look, `activateTheme` import()s its resolved JSON map
// (one chunk per look), updates the store and caches the map in localStorage.
// `themeInitScript` (inline in <head>) turns the cached map into a style rule for
// `[data-examples-scope]`, so a reload does not flash Base in the examples.

export const themeNames = ["base", "corporate", "nature", "quirky"] as const;
export type ThemeName = (typeof themeNames)[number];

export const themeLabels: Record<ThemeName, string> = {
  base: "Base",
  corporate: "Corporate",
  nature: "Nature",
  quirky: "Quirky",
};

export const defaultTheme: ThemeName = "base";
const storageKey = "ds-theme";
// Shape of the stored value. Version 0 is the unversioned original: it has the
// same fields, so reading it needs no change beyond accepting it; a version this
// code does not know (a newer site in another tab) is ignored, not overwritten
// blindly. Bump this and extend `readStoredTheme` and `themeInitScript` together.
const storedVersion = 1;

// A few values (font weights) are numbers in the theme JSON.
type ThemeVars = Record<string, string | number>;
export type StoredTheme = {
  version?: number;
  name: ThemeName;
  vars?: ThemeVars;
  /** Set when the examples wear one of the person's own projects (S51). */
  project?: string;
};

const projectIdPattern = /^[A-Za-z0-9_-]{1,64}$/;

/** A stored project id is untrusted text: only a plain id is kept. */
const readProjectId = (value: unknown): string | undefined =>
  typeof value === "string" && projectIdPattern.test(value) ? value : undefined;

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" &&
  (themeNames as readonly string[]).includes(value);

/**
 * The `next/font` CSS variable that holds each theme's heading and body family.
 * Theme JSON names a family ("Fraunces, Georgia, serif"), but next/font self-hosts
 * the file under a generated family name, so the leading family is swapped for the
 * font's variable and the theme's own fallback stack is kept.
 */
const themeFontVars: Record<ThemeName, { heading: string; body: string }> = {
  base: { heading: "--font-inter", body: "--font-inter" },
  corporate: { heading: "--font-plex", body: "--font-plex" },
  nature: { heading: "--font-fraunces", body: "--font-nunito" },
  quirky: { heading: "--font-bricolage", body: "--font-bricolage" },
};

const headingVar = "--ds-font-family-heading";
const bodyVar = "--ds-font-family-body";

const swapFamily = (stack: string, cssVar: string): string =>
  stack.replace(/^[^,]+/, `var(${cssVar})`);

const withFonts = (name: ThemeName, vars: ThemeVars): ThemeVars => ({
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
      const { version } = parsed as { version?: unknown };
      // 0 (no version) migrates as is; anything newer is not ours to read.
      if (isThemeName(name) && (version === undefined || version === 1))
        return parsed as StoredTheme;
    }
  } catch {
    // Storage blocked or corrupt: behave as if nothing was stored.
  }
  return null;
};

const writeStoredTheme = (stored: StoredTheme): void => {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ version: storedVersion, ...stored }),
    );
  } catch {
    // Private mode or quota: the choice just is not remembered.
  }
};

/**
 * The look the examples wear: its name and resolved var map (none = Base). For one of
 * the person's own projects, `name` is the look it started from and `project` its id.
 */
export type Look = { name: ThemeName; vars: ThemeVars; project?: string };

const baseLook: Look = { name: defaultTheme, vars: {} };
// Read lazily from storage on the first client snapshot (the server and hydration
// use `baseLook`), then replaced whole on every change so snapshots stay stable.
let current: Look | undefined;
const listeners = new Set<() => void>();

const setLook = (look: Look): void => {
  current = look;
  for (const listener of listeners) listener();
};

export const subscribeTheme = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getThemeSnapshot = (): Look => {
  if (!current) {
    const stored = readStoredTheme();
    const project = readProjectId(stored?.project);
    current =
      stored && stored.vars && (stored.name !== "base" || project)
        ? { name: stored.name, vars: stored.vars, ...(project && { project }) }
        : stored
          ? { name: stored.name, vars: {} }
          : baseLook;
  }
  return current;
};

export const getServerThemeSnapshot = (): Look => baseLook;

// Only the latest request may apply: a slow import must not undo a later choice.
let latestRequest = 0;

/** Starts a request: every earlier one that has not finished yet will be dropped. */
export const beginRequest = (): number => ++latestRequest;

/**
 * Applies one of the person's projects as the look (S51), if `request` (from
 * `beginRequest`) is still the latest. `lib/project-look.ts` resolves the project.
 */
export const applyProjectLook = (
  request: number,
  look: Required<Pick<Look, "name" | "vars" | "project">>,
  remember = true,
): void => {
  if (request !== latestRequest) return;
  setLook(look);
  if (remember) writeStoredTheme(look);
};

/**
 * Loads (if needed), applies and remembers a theme. Rejects if the chunk fails.
 * `remember: false` applies it without writing (used when another tab chose it).
 */
export const activateTheme = async (
  name: ThemeName,
  { remember = true }: { remember?: boolean } = {},
): Promise<void> => {
  const request = ++latestRequest;
  if (name === "base") {
    setLook({ name, vars: {} });
    if (remember) writeStoredTheme({ name });
    return;
  }
  const mod = await loaders[name]();
  if (request !== latestRequest) return;
  const vars = withFonts(name, mod.default.vars);
  setLook({ name, vars });
  if (remember) writeStoredTheme({ name, vars });
};

/** Calls `listener` when another tab changes the stored theme. Returns the unsubscribe. */
export const subscribeStoredTheme = (listener: () => void): (() => void) => {
  const onStorage = (event: StorageEvent) => {
    // `key` is null when the storage was cleared.
    if (event.key === null || event.key === storageKey) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
};

/**
 * Runs inline in <head>, before first paint: writes the cached map as one style rule
 * for `[data-examples-scope]`, never on <html>, so the chrome stays Base. Stored
 * values are untrusted: only `--ds-*` keys whose value has no `;{}<>`, double quote
 * or backslash and balanced single quotes are kept, and anything malformed is ignored. ES5 on purpose: it is not transpiled.
 */
export const themeInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  storageKey,
)})||"null");if(!s||!s.vars||typeof s.name!=="string"||(s.version!==undefined&&s.version!==${storedVersion}))return;var c="";for(var k in s.vars){var v=String(s.vars[k]);if(k.indexOf("--ds-")===0&&/^[-a-z0-9]+$/i.test(k.slice(5))&&!/[;{}<>"\\\\]/.test(v)&&v.split("'").length%2===1)c+=k+":"+v+";"}if(c){var e=document.createElement("style");e.setAttribute("data-examples-look","");e.textContent="[data-examples-scope]{"+c+"}";document.head.appendChild(e)}}catch(e){}})();`;
