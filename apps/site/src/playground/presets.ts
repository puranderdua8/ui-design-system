// Presets, the three questions and shuffle (S46, spec 4.4). Pure: no React, no DOM.
//
// A picture choice ("Rounded" corners, "Spacious" spacing) takes ONE dimension from ONE of
// the four shipped looks, whose values were already reviewed and are checked in CI. The
// choice names the look, not a number, so it gives the same values whichever look the
// project started from. "Flat" shadows is the only value no shipped look has.
import { builderContent as content } from "../content/builder";
import { hexAt, read } from "./ramps";
import type {
  Dims,
  DimensionId,
  PlaygroundState,
  ThemeJson,
  ThemeName,
  VarMap,
} from "./types";

type Source = ThemeName | "flat";

/** The dimensions a preset can set. Colour is not one: it comes from the brand colour. */
export const presetDimensions = [
  "type",
  "shape",
  "spacing",
  "depth",
  "motion",
] as const satisfies readonly DimensionId[];
export type PresetDimension = (typeof presetDimensions)[number];

type Choice<Id extends string> = { id: Id; from: Source };

/**
 * The choices of each dimension, in the order of the Guided step (the names come from
 * the content file; a test keeps the two in step). Spacing and text size have three
 * choices, the others four.
 */
export const presetChoices = {
  type: [
    { id: "compact", from: "corporate" },
    { id: "standard", from: "base" },
    { id: "large", from: "nature" },
  ],
  shape: [
    { id: "sharp", from: "corporate" },
    { id: "soft", from: "base" },
    { id: "rounded", from: "nature" },
    { id: "extraRound", from: "quirky" },
  ],
  spacing: [
    { id: "compact", from: "corporate" },
    { id: "comfortable", from: "base" },
    { id: "spacious", from: "nature" },
  ],
  depth: [
    { id: "flat", from: "flat" },
    { id: "crisp", from: "corporate" },
    { id: "soft", from: "nature" },
    { id: "hard", from: "quirky" },
  ],
  motion: [
    { id: "quick", from: "corporate" },
    { id: "standard", from: "base" },
    { id: "calm", from: "nature" },
    { id: "bouncy", from: "quirky" },
  ],
} as const satisfies Record<PresetDimension, readonly Choice<string>[]>;

/** Outline Thin / Bold: the existing border-width fine-tune, in px. */
export const outlineWidths = { thin: 1, bold: 2 } as const;

/** No shadow at all. Valid shadow syntax with a transparent colour, so every format accepts it. */
const flatShadow = "0px 0px 0px 0px #00000000";

// ---- which vars a dimension owns ---------------------------------------------

const prefixes: Record<DimensionId, readonly string[]> = {
  colour: ["--ds-color-"],
  type: [
    "--ds-font-size-",
    "--ds-font-weight-",
    "--ds-font-line-height-",
    "--ds-font-letter-spacing-",
  ],
  shape: ["--ds-radius-"],
  spacing: ["--ds-space-", "--ds-size-control-", "--ds-size-icon-"],
  depth: ["--ds-shadow-"],
  motion: ["--ds-duration-", "--ds-easing-"],
};

const owns = (dim: DimensionId, key: string): boolean =>
  prefixes[dim].some((prefix) => key.startsWith(prefix));

/**
 * The starting look with each listed dimension's themeable values taken from another
 * look (or flattened). Semantic vars (anything in `refs`) are never touched, so roles
 * keep pointing at whatever the primitives now hold. `{}` returns `start` itself.
 */
export const applyDims = (
  start: ThemeJson,
  themes: Record<ThemeName, ThemeJson>,
  dims: Dims,
): ThemeJson => {
  const entries = Object.entries(dims) as [DimensionId, Source][];
  if (entries.length === 0) return start;
  const vars: VarMap = { ...start.vars };
  for (const [dim, from] of entries) {
    for (const key of Object.keys(start.vars)) {
      if (key in start.refs || !owns(dim, key)) continue;
      if (from === "flat") {
        if (dim === "depth") vars[key] = flatShadow;
        continue;
      }
      const value = themes[from]?.vars[key];
      if (value !== undefined) vars[key] = value;
    }
  }
  return { vars, refs: start.refs };
};

// ---- setting a preset --------------------------------------------------------

/** Returns `state` with one dimension taken from `from`, or following `start` for `undefined`. */
export const withPreset = (
  state: PlaygroundState,
  dim: PresetDimension,
  from: Source | undefined,
): PlaygroundState => {
  const dims: Record<string, string> = { ...state.dims };
  if (from === undefined) delete dims[dim];
  else dims[dim] = from;
  return { ...state, dims: dims as Dims };
};

// ---- the three questions -----------------------------------------------------

type Mood = keyof typeof content.questions.mood.options;
type Room = keyof typeof content.questions.room.options;
type Corners = keyof typeof content.questions.corners.options;
export type Answers = { mood: Mood; room: Room; corners: Corners };

const lookFor: Record<Mood, ThemeName> = {
  calm: "base",
  serious: "corporate",
  warm: "nature",
  bold: "quirky",
};
const spacingFor: Record<Room, ThemeName> = {
  tight: "corporate",
  balanced: "base",
  airy: "nature",
};
const shapeFor: Record<Corners, ThemeName> = {
  sharp: "corporate",
  soft: "base",
  rounded: "nature",
  extraRound: "quirky",
};

export type Recommendation = {
  start: ThemeName;
  dims: Dims;
  /** Plain-language reason, from the content file. */
  reason: string;
};

/**
 * Mood picks the starting look (and with it type, depth and motion); Room picks the
 * spacing and Corners the shape. Both are set explicitly so they hold if the person
 * later changes the starting look.
 */
export const recommend = (answers: Answers): Recommendation => {
  const { mood, room, corners } = content.questions;
  return {
    start: lookFor[answers.mood],
    dims: {
      spacing: spacingFor[answers.room],
      shape: shapeFor[answers.corners],
    },
    reason: [
      mood.options[answers.mood].reason,
      room.options[answers.room].reason,
      corners.options[answers.corners].reason,
    ].join(" "),
  };
};

// ---- highlight colours -------------------------------------------------------

/** Hues used when the brand colour is grey and has no hue of its own. */
const greyHues = [250, 150, 30, 330];

/**
 * Four highlight colours to suggest next to a brand colour: the opposite, the two
 * neighbours of the opposite, and a close neighbour. Each keeps the brand colour's
 * lightness (so it reads about as strongly) and at least a visible amount of colour.
 */
export const suggestHighlights = (brand: string): string[] => {
  const { l, c, h } = read(brand);
  const lightness = Math.min(0.85, Math.max(0.3, l));
  if (c < 0.02) return greyHues.map((hue) => hexAt(lightness, 0.12, hue));
  const chroma = Math.max(c, 0.1);
  return [180, 150, 210, 30].map((turn) =>
    hexAt(lightness, chroma, (h + turn) % 360),
  );
};

// ---- shuffle -----------------------------------------------------------------

/**
 * "Try another combination": another mix of presets. Every value comes from a reviewed
 * look, so any mix is valid. The new mix always differs from the current one. Colours
 * (brand, highlight, background feel and the colour dimension) are kept unless
 * `colours` is true, which also moves to another starting look. Fine-tunes of the
 * shuffled dimensions are cleared so they do not stack on the new mix. Fonts,
 * and per-role overrides are kept. `random` is injectable for tests.
 */
export const shuffle = (
  state: PlaygroundState,
  options: { colours?: boolean; random?: () => number } = {},
): PlaygroundState => {
  const random = options.random ?? Math.random;
  const pick = (n: number): number => Math.min(n - 1, Math.floor(random() * n));

  const next: Record<string, string> = {};
  for (const dim of presetDimensions)
    next[dim] = presetChoices[dim][pick(presetChoices[dim].length)]!.from;

  const same = (dims: Record<string, string>): boolean =>
    presetDimensions.every(
      (dim) => (state.dims[dim] ?? state.start) === (dims[dim] ?? state.start),
    );
  if (same(next)) {
    // Guarantee a change: move the first dimension to its following choice.
    const dim = presetDimensions[pick(presetDimensions.length)]!;
    const list = presetChoices[dim];
    const at = list.findIndex(
      (c) => c.from === (state.dims[dim] ?? state.start),
    );
    next[dim] = list[(at + 1) % list.length]!.from;
  }

  const dims: Record<string, string> = {};
  if (state.dims.colour) dims.colour = state.dims.colour;
  for (const dim of presetDimensions) dims[dim] = next[dim]!;

  const knobs = { ...state.knobs };
  for (const key of [
    "radiusScale",
    "borderWidth",
    "shadowStrength",
    "density",
    "motionSpeed",
    "typeScale",
  ] as const)
    delete knobs[key];

  let start = state.start;
  if (options.colours) {
    const others = (["base", "corporate", "nature", "quirky"] as const).filter(
      (name) => name !== state.start,
    );
    start = others[pick(others.length)]!;
    delete dims.colour;
    delete knobs.brand;
    delete knobs.accent;
    delete knobs.neutral;
  }

  return { ...state, start, dims: dims as Dims, knobs };
};
