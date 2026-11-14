// Playground engine (S33): starting theme + knobs + overrides -> a resolved var map.
//
// 1. Knobs rewrite the themeable primitives (the literal vars of the starting theme).
// 2. Overrides are applied on top: a literal wins over whatever a knob generated.
// 3. Every semantic var is re-resolved through the theme JSON's `refs`, so a changed
//    primitive flows to everything that aliases it.
//
// Nothing here touches the DOM. An unset knob (or one at its neutral value) is a no-op,
// so an untouched state resolves to exactly the starting theme.
import { fontStack } from "./fonts";
import { brandRamp, neutralRamp } from "./ramps";
import type {
  IgnoredOverride,
  Knobs,
  PlaygroundState,
  ResolvedTheme,
  ThemeJson,
  ThemeName,
  VarMap,
} from "./types";

/**
 * `elevation.*` aliases `shadow.*` in the DTCG semantics, but the shipped theme JSON
 * holds them as literals (Style Dictionary resolves shadow aliases early, D-059), so
 * they are not in `refs`. The engine knows the aliases and re-resolves them.
 */
export const shadowAliases: Record<string, string> = {
  "--ds-elevation-raised": "--ds-shadow-sm",
  "--ds-elevation-overlay": "--ds-shadow-lg",
};

const ACCENT_AFTER = "--ds-color-neutral-950";

const number = (n: number): string => String(+n.toFixed(4));

const positive = (name: string, value: number): number => {
  if (!Number.isFinite(value) || value <= 0)
    throw new RangeError(`${name} must be a positive number, got ${value}`);
  return value;
};

const unit = (value: string | number, suffix: string, what: string): number => {
  const match = new RegExp(`^(-?\\d*\\.?\\d+)${suffix}$`).exec(String(value));
  if (!match)
    throw new Error(`${what}: expected a ${suffix} value, got "${value}"`);
  return Number(match[1]);
};

const scaleRem = (value: string | number, factor: number, floor = 0): string =>
  `${number(Math.max(unit(value, "rem", "rem value") * factor, floor))}rem`;

// ---- shadows ---------------------------------------------------------------

const SHADOW = /^(\S+) (\S+) (\S+) (\S+) (#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$/;

export type Shadow = {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
};

/** Parses a resolved `--ds-shadow-*` value ("0px 1px 3px 0px #0d0f121a"). */
export const parseShadow = (value: string | number): Shadow => {
  const match = SHADOW.exec(String(value));
  if (!match) throw new Error(`unsupported shadow "${value}"`);
  const [, offsetX, offsetY, blur, spread, color] = match;
  return { offsetX, offsetY, blur, spread, color: color.toLowerCase() };
};

export const formatShadow = (s: Shadow): string =>
  `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`;

const hexByte = (n: number): string => n.toString(16).padStart(2, "0");

const scaleShadow = (value: string | number, strength: number): string => {
  const shadow = parseShadow(value);
  const alpha =
    shadow.color.length === 9 ? parseInt(shadow.color.slice(7), 16) / 255 : 1;
  const scaled = Math.min(1, alpha * strength);
  const byte = Math.round(scaled * 255 + 1e-6);
  const rgb = shadow.color.slice(0, 7);
  const blur = Math.max(0, unit(shadow.blur, "px", "shadow blur") * strength);
  return formatShadow({
    ...shadow,
    blur: `${number(blur)}px`,
    color: byte >= 255 ? rgb : `${rgb}${hexByte(byte)}`,
  });
};

// ---- knobs -----------------------------------------------------------------

const withoutAccent = (key: string): boolean =>
  !key.startsWith("--ds-color-accent-");

/** Rebuilds `literals` with `entries` inserted right after `after`. */
const insertAfter = (
  literals: VarMap,
  after: string,
  entries: VarMap,
): VarMap => {
  const out: VarMap = {};
  for (const [key, value] of Object.entries(literals)) {
    if (withoutAccent(key)) out[key] = value;
    if (key === after) Object.assign(out, entries);
  }
  return out;
};

const scrimFrom = (start: VarMap, neutral950: string): string => {
  const alpha = /,\s*([\d.]+)\s*\)$/.exec(String(start["--ds-color-scrim"]));
  const n = parseInt(neutral950.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha?.[1] ?? "0.7"})`;
};

/** Applies the knobs to the starting theme's primitives. Returns a new map. */
export const applyKnobs = (primitives: VarMap, knobs: Knobs): VarMap => {
  let out: VarMap = { ...primitives };

  if (knobs.brand !== undefined) {
    const ramp = brandRamp(knobs.brand);
    for (const [step, hex] of Object.entries(ramp))
      out[`--ds-color-brand-${step}`] = hex;
  }

  if (knobs.neutral !== undefined) {
    const ramp = neutralRamp(primitives, knobs.neutral);
    for (const [step, hex] of Object.entries(ramp))
      out[`--ds-color-neutral-${step}`] = hex;
    out["--ds-color-scrim"] = scrimFrom(primitives, ramp["950"]);
  }

  if (knobs.accent !== undefined) {
    const entries: VarMap = {};
    for (const [step, hex] of Object.entries(brandRamp(knobs.accent)))
      entries[`--ds-color-accent-${step}`] = hex;
    out = insertAfter(out, ACCENT_AFTER, entries);
  }

  if (knobs.headingFont !== undefined)
    out["--ds-font-family-heading"] = fontStack(knobs.headingFont);
  if (knobs.bodyFont !== undefined)
    out["--ds-font-family-body"] = fontStack(knobs.bodyFont);

  if (knobs.radiusScale !== undefined && knobs.radiusScale !== 1) {
    const factor = positive("radiusScale", knobs.radiusScale);
    for (const size of ["sm", "md", "lg"])
      out[`--ds-radius-${size}`] = scaleRem(out[`--ds-radius-${size}`], factor);
  }

  if (knobs.borderWidth !== undefined) {
    const width = knobs.borderWidth;
    if (!Number.isFinite(width) || width < 0)
      throw new RangeError(`borderWidth must be 0 or more, got ${width}`);
    const step = Math.max(
      1,
      unit(out["--ds-border-width-2"], "px", "border-width.2") -
        unit(out["--ds-border-width-1"], "px", "border-width.1"),
    );
    out["--ds-border-width-1"] = `${number(width)}px`;
    out["--ds-border-width-2"] = `${number(width + step)}px`;
  }

  if (knobs.shadowStrength !== undefined && knobs.shadowStrength !== 1) {
    const strength = positive("shadowStrength", knobs.shadowStrength);
    for (const size of ["sm", "lg"])
      out[`--ds-shadow-${size}`] = scaleShadow(
        out[`--ds-shadow-${size}`],
        strength,
      );
  }

  if (knobs.density !== undefined && knobs.density !== 1) {
    const factor = positive("density", knobs.density);
    const floor = unit(out["--ds-size-target-min"], "rem", "size.target.min");
    for (const key of Object.keys(out)) {
      if (key.startsWith("--ds-space-")) out[key] = scaleRem(out[key], factor);
    }
    // A denser theme may not shrink a control below the 24px target (WCAG 2.5.8).
    for (const size of ["sm", "md"])
      out[`--ds-size-control-${size}`] = scaleRem(
        out[`--ds-size-control-${size}`],
        factor,
        floor,
      );
  }

  if (knobs.motionSpeed !== undefined && knobs.motionSpeed !== 1) {
    const speed = positive("motionSpeed", knobs.motionSpeed);
    for (const key of ["--ds-duration-100", "--ds-duration-200"])
      out[key] = `${Math.round(unit(out[key], "ms", key) / speed)}ms`;
  }

  return out;
};

// ---- resolution ------------------------------------------------------------

const resolveVar = (
  key: string,
  refs: Record<string, string>,
  literals: VarMap,
): string | number => {
  const seen = new Set<string>();
  let current = key;
  while (current in refs) {
    if (seen.has(current)) throw new Error(`alias cycle at ${current}`);
    seen.add(current);
    current = refs[current];
  }
  if (!(current in literals)) throw new Error(`${current} has no value`);
  return literals[current];
};

/** Resolves a theme with knobs and overrides. See the file header for the order. */
export const resolveTheme = (
  start: ThemeJson,
  knobs: Knobs = {},
  overrides: Record<string, string> = {},
): ResolvedTheme => {
  const startRefs: Record<string, string> = { ...start.refs, ...shadowAliases };
  const isSemantic = (key: string): boolean => key in startRefs;

  const primitives0: VarMap = {};
  for (const [key, value] of Object.entries(start.vars))
    if (!isSemantic(key)) primitives0[key] = value;

  let primitives = applyKnobs(primitives0, knobs);
  const refs = { ...startRefs };
  const semanticLiterals: VarMap = {};
  const ignored: IgnoredOverride[] = [];
  const semanticOverrides: string[] = [];

  const known = (key: string): boolean => key in primitives || isSemantic(key);

  for (const [key, value] of Object.entries(overrides)) {
    if (!known(key)) {
      ignored.push({ key, reason: "unknown token" });
      continue;
    }
    const alias = value.startsWith("--ds-");
    if (!isSemantic(key)) {
      if (alias) {
        ignored.push({
          key,
          reason: "a primitive takes a value, not an alias",
        });
        continue;
      }
      primitives = { ...primitives, [key]: value };
      continue;
    }
    if (alias) {
      if (!known(value)) {
        ignored.push({ key, reason: `alias target ${value} is unknown` });
        continue;
      }
      const before = refs[key];
      refs[key] = value;
      try {
        resolveVar(key, refs, { ...primitives, ...semanticLiterals });
      } catch (error) {
        if (before === undefined) delete refs[key];
        else refs[key] = before;
        ignored.push({ key, reason: (error as Error).message });
        continue;
      }
      delete semanticLiterals[key];
    } else {
      delete refs[key];
      semanticLiterals[key] = value;
    }
    semanticOverrides.push(key);
  }

  const literals: VarMap = { ...primitives, ...semanticLiterals };
  const order = Object.keys(
    insertAfter(start.vars, ACCENT_AFTER, pickAccent(primitives)),
  );
  const vars: VarMap = {};
  for (const key of order) vars[key] = resolveVar(key, refs, literals);

  const finalRefs: Record<string, string> = {};
  // The built-in elevation aliases are not in the shipped `refs` (they are literals
  // there), so they only show up here when an override re-pointed them.
  for (const key of order) {
    if (key in refs && refs[key] !== shadowAliases[key])
      finalRefs[key] = refs[key];
  }

  return {
    vars,
    refs: finalRefs,
    primitives,
    semanticLiterals,
    semanticOverrides,
    ignored,
  };
};

const pickAccent = (primitives: VarMap): VarMap => {
  const out: VarMap = {};
  for (const [key, value] of Object.entries(primitives))
    if (!withoutAccent(key)) out[key] = value;
  return out;
};

/** The state-shaped entry point: look the starting theme up, then resolve. */
export const resolveState = (
  state: PlaygroundState,
  themes: Record<ThemeName, ThemeJson>,
): ResolvedTheme =>
  resolveTheme(themes[state.start], state.knobs, state.overrides);
