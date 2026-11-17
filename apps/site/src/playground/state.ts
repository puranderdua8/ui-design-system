// Playground UI state helpers (S34). Pure: no React, no DOM, so they are unit tested.
import { isThemeName } from "../lib/theme";
import { shadowAliases, resolveState } from "./engine";
import { fontChoices } from "./fonts";
import { parseOverride } from "./grammar";
import { dimensionIds } from "./types";
import type {
  Dims,
  FontId,
  Fonts,
  Knobs,
  PlaygroundState,
  ResolvedTheme,
  ThemeJson,
  ThemeName,
  VarMap,
} from "./types";

export const storageKey = "ds-playground";

/**
 * Version of the stored shape. 0 is the unversioned original and 1 added a version;
 * both have the same fields, and 2 adds `mode`, `dims` and `fonts` (S45, spec 5.2).
 * When a field is renamed or added, bump this and add a step to `migrate` instead of
 * dropping the user's work. A version newer than this code (written by a newer site
 * in another tab) is not read, so the default state is shown rather than a lossy guess.
 */
export const stateVersion = 2;

/** The stored form: the version, then the state. */
export const serialiseState = (state: PlaygroundState) => ({
  version: stateVersion,
  ...state,
});

const migrate = (
  input: Record<string, unknown>,
): Record<string, unknown> | null => {
  const version = input.version ?? 0;
  // 0 and 1 have no mode, dims or fonts: they read as "light, follow the start".
  if (version === 0 || version === 1 || version === stateVersion) return input;
  return null;
};

export const defaultState: PlaygroundState = {
  start: "base",
  mode: "light",
  dims: {},
  fonts: {},
  knobs: {},
  overrides: {},
};

/**
 * Plain text for a name a person typed (a project or a font): letters, numbers,
 * spaces and a few marks, collapsed, trimmed and cut to `max`. Anything else is
 * dropped, so a name can never carry markup or CSS. Returns "" when nothing is left.
 */
export const sanitiseText = (input: unknown, max = 60): string =>
  typeof input === "string"
    ? input
        .replace(/[^\p{L}\p{N} .,'&()+_-]/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
        .trim()
    : "";

const sanitiseDims = (input: unknown): Dims => {
  const dims: Dims = {};
  if (!isRecord(input)) return dims;
  for (const id of dimensionIds) {
    const value = input[id];
    if (isThemeName(value) || (id === "depth" && value === "flat"))
      (dims as Record<string, string>)[id] = value;
  }
  return dims;
};

const sanitiseFonts = (input: unknown): Fonts => {
  const fonts: Fonts = {};
  if (!isRecord(input)) return fonts;
  for (const key of ["heading", "body"] as const) {
    const name = sanitiseText(input[key]);
    if (name) fonts[key] = name;
  }
  return fonts;
};

const hex6 = /^#[0-9a-f]{6}$/i;
const fontIds = new Set<string>(fontChoices.map((font) => font.id));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const positive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/** Keeps only the knob values the engine accepts; anything else is dropped. */
export const sanitiseKnobs = (input: unknown): Knobs => {
  if (!isRecord(input)) return {};
  const knobs: Knobs = {};
  for (const key of ["brand", "accent"] as const) {
    const value = input[key];
    if (typeof value === "string" && hex6.test(value)) knobs[key] = value;
  }
  for (const key of ["headingFont", "bodyFont"] as const) {
    const value = input[key];
    if (typeof value === "string" && fontIds.has(value))
      knobs[key] = value as FontId;
  }
  for (const key of [
    "radiusScale",
    "shadowStrength",
    "density",
    "motionSpeed",
    "typeScale",
  ] as const) {
    if (positive(input[key])) knobs[key] = input[key];
  }
  const width = input.borderWidth;
  if (typeof width === "number" && Number.isFinite(width) && width >= 0)
    knobs.borderWidth = width;
  const neutral = input.neutral;
  if (isRecord(neutral)) {
    const next: NonNullable<Knobs["neutral"]> = {};
    if (typeof neutral.hue === "number" && Number.isFinite(neutral.hue))
      next.hue = neutral.hue;
    if (
      typeof neutral.chroma === "number" &&
      Number.isFinite(neutral.chroma) &&
      neutral.chroma >= 0
    )
      next.chroma = neutral.chroma;
    if (next.hue !== undefined || next.chroma !== undefined)
      knobs.neutral = next;
  }
  return knobs;
};

/** Reads a stored or untrusted value back into a state, or `null` if it is not one. */
export const parseState = (raw: unknown): PlaygroundState | null => {
  const input = isRecord(raw) ? migrate(raw) : null;
  if (!input || !isThemeName(input.start)) return null;
  const overrides: Record<string, string> = {};
  // Untrusted (D-144): an override stays only if its token is known and its value
  // parses for that token's type; anything else is dropped, not repaired.
  if (isRecord(input.overrides))
    for (const [key, value] of Object.entries(input.overrides)) {
      const parsed = parseOverride(key, value);
      if (parsed !== null) overrides[key] = parsed;
    }
  return {
    start: input.start,
    mode: "light",
    dims: sanitiseDims(input.dims),
    fonts: sanitiseFonts(input.fonts),
    knobs: sanitiseKnobs(input.knobs),
    overrides,
  };
};

export type Resolution = {
  resolved: ResolvedTheme;
  /** Set when the state could not be resolved and the starting theme is shown instead. */
  error?: string;
};

/** `resolveState` that never throws: a bad state falls back to its starting theme. */
export const safeResolve = (
  state: PlaygroundState,
  themes: Record<ThemeName, ThemeJson>,
): Resolution => {
  try {
    return { resolved: resolveState(state, themes) };
  } catch (error) {
    return {
      resolved: resolveState(
        { ...state, dims: {}, fonts: {}, knobs: {}, overrides: {} },
        themes,
      ),
      error: (error as Error).message,
    };
  }
};

const leadingFamily = (stack: string): string =>
  (stack.split(",")[0] ?? "").trim().replace(/['"]/g, "");

/**
 * The resolved map names a family ("Fraunces, Georgia, serif"), but `next/font`
 * self-hosts the file under a generated name. Like `withFonts` in `lib/theme.ts`,
 * swap the leading family for the font's CSS variable and keep the fallback stack.
 * Every var that names a family is swapped, so the `type-*-font-family` roles follow.
 */
export const previewVars = (vars: VarMap): VarMap => {
  const out: VarMap = { ...vars };
  for (const [key, value] of Object.entries(vars)) {
    if (!key.includes("font-family")) continue;
    const stack = String(value);
    const font = fontChoices.find(
      (choice) => leadingFamily(choice.stack) === leadingFamily(stack),
    );
    if (font) out[key] = stack.replace(/^[^,]+/, `var(${font.cssVar})`);
  }
  return out;
};

/** The curated font a resolved family var currently names, if it is one of them. */
export const currentFont = (
  vars: VarMap,
  key: "--ds-font-family-heading" | "--ds-font-family-body",
): FontId | undefined =>
  fontChoices.find(
    (choice) =>
      leadingFamily(choice.stack) === leadingFamily(String(vars[key] ?? "")),
  )?.id;

/** Semantic var names: the theme's aliases plus the elevation aliases the engine adds. */
export const semanticKeys = (start: ThemeJson): string[] =>
  Object.keys(start.vars).filter(
    (key) => key in start.refs || key in shadowAliases,
  );

export type TokenGroup = { id: string; keys: string[] };

/** Groups semantic vars by their first name segment (`--ds-action-primary-bg` -> action). */
export const groupSemantic = (keys: string[]): TokenGroup[] => {
  const groups = new Map<string, string[]>();
  for (const key of keys) {
    const id = key.replace(/^--ds-/, "").split("-")[0] ?? "other";
    groups.set(id, [...(groups.get(id) ?? []), key]);
  }
  return [...groups].map(([id, list]) => ({ id, keys: list }));
};

/** `#rrggbb` for a picker, or `null` when the value is not a plain 6-digit hex. */
export const asPickerColour = (value: string | number): string | null =>
  typeof value === "string" && hex6.test(value) ? value.toLowerCase() : null;

/** Returns `state` with one override set, or removed for an empty value. */
export const withOverride = (
  state: PlaygroundState,
  key: string,
  value: string,
): PlaygroundState => {
  const overrides = { ...state.overrides };
  if (value === "") delete overrides[key];
  else overrides[key] = value;
  return { ...state, overrides };
};

/** Returns `state` with the knob patch applied; an `undefined` value clears the knob. */
export const withKnobs = (
  state: PlaygroundState,
  patch: Partial<Record<keyof Knobs, unknown>>,
): PlaygroundState => {
  const merged: Record<string, unknown> = { ...state.knobs };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete merged[key];
    else merged[key] = value;
  }
  return { ...state, knobs: sanitiseKnobs(merged) };
};

/** A fresh state for a starting theme: no knobs, no overrides. */
export const startFrom = (start: ThemeName): PlaygroundState => ({
  start,
  mode: "light",
  dims: {},
  fonts: {},
  knobs: {},
  overrides: {},
});
