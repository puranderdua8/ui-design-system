// "Fix it for me" (S47, spec 4.5). Moves the colour behind one cause to the nearest shade
// that passes, with the same hue: an OKLCH lightness search outward from where the colour
// is now (darker first on a tie), keeping hue and chroma. The contrast check is re-run on
// the result, so the answer carries the failures left, not a promise. The background feel
// has no lightness to move (each step keeps its own), so its tint is reduced instead.
import { analyse, type Analysis, type CauseId } from "./explain";
import { hexAt, read } from "./ramps";
import type {
  ContrastPairsSpec,
  PlaygroundState,
  ThemeJson,
  ThemeName,
} from "./types";

/** The ramps are built inside this lightness range (see `brandRamp`). */
const rampRange = { lo: 0.2, hi: 0.9 };
const step = 0.005;

export type FixResult = {
  cause: CauseId;
  /** The state with the colour moved. The same state when nothing could be improved. */
  state: PlaygroundState;
  changed: boolean;
  /** The colour that moved (the one the person sees), and the failures behind the cause. */
  before: { colour: string; failing: number };
  after: { colour: string; failing: number };
  /** Every failing combination in the whole design system, before and after. */
  totalBefore: number;
  totalAfter: number;
};

type Context = {
  themes: Record<ThemeName, ThemeJson>;
  spec: ContrastPairsSpec;
};

const causeFailing = (analysis: Analysis, cause: CauseId): number =>
  analysis.explanations.find((e) => e.cause === cause)?.count ?? 0;

/**
 * Tries lightness values outward from `hex` (darker first on a tie) and returns the
 * nearest colour for which `failing` is 0, or else the nearest with the fewest failures.
 */
const searchLightness = (
  hex: string,
  range: { lo: number; hi: number },
  failing: (candidate: string) => number,
): { colour: string; failing: number } => {
  const { l, c, h } = read(hex);
  const start = Math.min(range.hi, Math.max(range.lo, l));
  let best = { colour: hex, failing: failing(hex) };
  if (best.failing === 0) return best;
  const steps = Math.ceil((range.hi - range.lo) / step);
  for (let k = 0; k <= steps; k++) {
    for (const sign of [-1, 1]) {
      const lightness = start + sign * k * step;
      if (lightness < range.lo || lightness > range.hi) continue;
      if (k === 0 && sign === 1) continue;
      const candidate = hexAt(lightness, c, h);
      const count = failing(candidate);
      if (count < best.failing) best = { colour: candidate, failing: count };
      if (count === 0) return best;
    }
  }
  return best;
};

const withKnob = (
  state: PlaygroundState,
  key: "brand" | "accent",
  colour: string,
): PlaygroundState => ({ ...state, knobs: { ...state.knobs, [key]: colour } });

export const fix = (
  cause: CauseId,
  state: PlaygroundState,
  { themes, spec }: Context,
): FixResult | null => {
  const first = analyse(state, themes, spec);
  const totalBefore = first.report.failing;
  const failingBefore = causeFailing(first, cause);
  if (failingBefore === 0) return null;

  let next = state;
  let before: string;
  let colourOf: (analysis: Analysis) => string;

  if (cause === "brand" || cause === "highlight") {
    const key = cause === "brand" ? "brand" : "accent";
    const varName = `--ds-color-${key}-600`;
    colourOf = (a) => String(a.resolved.vars[varName]);
    before = colourOf(first);
    const found = searchLightness(before, rampRange, (candidate) =>
      causeFailing(
        analyse(withKnob(state, key, candidate), themes, spec),
        cause,
      ),
    );
    if (found.failing < failingBefore)
      next = withKnob(state, key, found.colour);
  } else if (cause === "background") {
    const varName = "--ds-color-neutral-500";
    colourOf = (a) => String(a.resolved.vars[varName]);
    before = colourOf(first);
    const mid = read(before);
    const hue = state.knobs.neutral?.hue ?? (mid.c > 0.002 ? mid.h : 260);
    const chroma = state.knobs.neutral?.chroma ?? mid.c;
    let bestFailing = failingBefore;
    // Less tint, same hue: a fifth less at a time, down to plain grey.
    for (let k = 1; k <= 20 && bestFailing > 0; k++) {
      const candidate: PlaygroundState = {
        ...state,
        knobs: {
          ...state.knobs,
          neutral: { hue, chroma: chroma * (1 - k / 20) },
        },
      };
      const count = causeFailing(analyse(candidate, themes, spec), cause);
      if (count < bestFailing) {
        bestFailing = count;
        next = candidate;
      }
    }
  } else if (cause === "handSet") {
    const keys = first.explanations.find((e) => e.cause === cause)?.keys ?? [];
    const firstKey = keys[0];
    colourOf = (a) =>
      firstKey === undefined
        ? ""
        : String(a.resolved.vars[firstKey] ?? state.overrides[firstKey] ?? "");
    before = colourOf(first);
    for (const key of keys) {
      const value = next.overrides[key]!;
      const setTo = (colour: string): PlaygroundState => ({
        ...next,
        overrides: { ...next.overrides, [key]: colour },
      });
      const failingNow = causeFailing(analyse(next, themes, spec), cause);
      if (failingNow === 0) break;
      let colour: string | null = null;
      try {
        if (!value.startsWith("--ds-")) colour = read(value) && value;
      } catch {
        colour = null;
      }
      if (colour === null) {
        // A role aliased to another one, or a value that is not a colour: take the
        // override away, which gives the role its own colour back.
        const rest = { ...next.overrides };
        delete rest[key];
        const candidate = { ...next, overrides: rest };
        if (causeFailing(analyse(candidate, themes, spec), cause) < failingNow)
          next = candidate;
        continue;
      }
      const found = searchLightness(colour, { lo: 0, hi: 1 }, (candidate) =>
        causeFailing(analyse(setTo(candidate), themes, spec), cause),
      );
      if (found.failing < failingNow) next = setTo(found.colour);
    }
  } else {
    return null;
  }

  const last = next === state ? first : analyse(next, themes, spec);
  return {
    cause,
    state: next,
    changed: next !== state,
    before: { colour: before, failing: failingBefore },
    after: { colour: colourOf(last), failing: causeFailing(last, cause) },
    totalBefore,
    totalAfter: last.report.failing,
  };
};
