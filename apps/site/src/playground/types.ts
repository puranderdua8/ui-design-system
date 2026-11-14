// Types for the playground engine (S33). Pure data: no React, no DOM.
import type { ThemeName } from "../lib/theme";

export type { ThemeName };

/** A resolved CSS var map. A few values (font weights) are numbers in the theme JSON. */
export type VarMap = Record<string, string | number>;

/** Shape of `@puranderdua/ui/themes/<name>.json`: resolved vars plus semantic -> primitive refs. */
export type ThemeJson = {
  vars: VarMap;
  refs: Record<string, string>;
};

export type FontId = "inter" | "plex" | "fraunces" | "nunito" | "bricolage";

/**
 * High-level controls. Every knob is optional: an unset knob (or one at its neutral
 * value) leaves the starting theme's values exactly as they are.
 */
export type Knobs = {
  /** Hex colour that becomes `brand.600`; the rest of the brand scale is generated. */
  brand?: string;
  /** Hex colour that becomes `accent.600`; drives Tabs and accent Cards (0.8.0). */
  accent?: string;
  /** Hue (degrees, OKLCH) and chroma of the neutral scale; lightness per step is kept. */
  neutral?: { hue?: number; chroma?: number };
  headingFont?: FontId;
  bodyFont?: FontId;
  /** Multiplier for `radius.sm|md|lg` (`full` is not scaled). 1 = unchanged. */
  radiusScale?: number;
  /** Width of `border-width.1` in px; `border-width.2` keeps the theme's step above it. */
  borderWidth?: number;
  /** Multiplier for shadow alpha and blur. 1 = unchanged. */
  shadowStrength?: number;
  /** Multiplier for `space.*` and the control heights (never below the 24px target). */
  density?: number;
  /** Speed multiplier: 2 = durations halve. 1 = unchanged. */
  motionSpeed?: number;
};

export type PlaygroundState = {
  start: ThemeName;
  knobs: Knobs;
  /**
   * Per-token overrides, keyed by var name (`--ds-action-primary-bg`). A value starting
   * with `--ds-` aliases another var (semantic tokens only); anything else is a literal.
   */
  overrides: Record<string, string>;
};

export type IgnoredOverride = { key: string; reason: string };

export type ResolvedTheme = {
  /** Every var, resolved. Same keys and order as the starting theme. */
  vars: VarMap;
  /** Semantic -> var aliases that survived (an override that sets a literal removes one). */
  refs: Record<string, string>;
  /** Themeable primitive values (what a `tokens/themes/<name>/` folder holds). */
  primitives: VarMap;
  /** Semantic vars an override set to a literal value. */
  semanticLiterals: VarMap;
  /** Overridden semantic vars: a theme folder cannot hold them (semantics are shared). */
  semanticOverrides: string[];
  /** Overrides that could not be applied (unknown key, cycle, alias on a primitive). */
  ignored: IgnoredOverride[];
};

export type ContrastPairsSpec = {
  pairs: { fg: string; bg: string; min: string }[];
  contexts?: Record<
    string,
    { surface: string; surfaceEnd?: string; map: Record<string, string> }
  >;
  roles?: { fg: string; bg?: string; min: string }[];
  exclusions?: { context: string; fg: string }[];
  scrim?: { fg: string; min: string; strengths: Record<string, number> };
};

export type ContrastResult = {
  kind: "pair" | "scrim";
  /** Var names without the `--ds-` prefix (`text-primary`). */
  fg: string;
  bg: string;
  /** Resolved colours; the scrim result uses the flattened scrim colour for `bg`. */
  fgValue: string;
  bgValue: string;
  /** " in inverse" / " in inverse (end)" for a tone check, else "". */
  tone: string;
  strength?: number;
  ratio: number | null;
  min: number;
  ok: boolean;
  error?: string;
};

export type ContrastReport = {
  results: ContrastResult[];
  failing: number;
  /** Tone x role checks left out on purpose (`exclusions` in contrast-pairs.json). */
  skipped: number;
};
