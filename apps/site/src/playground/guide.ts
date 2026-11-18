// The data behind the style guide (S58, spec 4.6 item 2). It turns a resolved var map into
// plain-named colours, shape, spacing, shadow and motion samples. A value reaches the page
// only if the value grammar accepts it: the guide can be opened from a link, so every value
// is treated as untrusted. Pure: no React, no DOM.
import { builderContent } from "../content/builder";
import { parseFontName, parseValue, type ValueType } from "./grammar";
import type { VarMap } from "./types";

const { guide } = builderContent;

export type GuideColour = {
  name: string;
  useFor: string;
  /** `#rrggbb` (or with alpha), as the grammar writes it. */
  hex: string;
};

export type GuideSample = { name: string; value: string };

/** The accepted value of `key`, or `null` when it is missing or the grammar refuses it. */
const accepted = (
  vars: VarMap,
  key: string,
  type: ValueType,
): string | null => {
  const raw = vars[key];
  return raw === undefined ? null : parseValue(type, String(raw));
};

const samples = (
  vars: VarMap,
  items: readonly { key: string; name: string }[],
  type: ValueType,
): GuideSample[] =>
  items.flatMap(({ key, name }) => {
    const value = accepted(vars, key, type);
    return value === null ? [] : [{ name, value }];
  });

/** Every colour with a plain name, a hex value and where to use it. */
export const guideColours = (vars: VarMap): GuideColour[] =>
  guide.colours.flatMap(({ key, name, useFor }) => {
    const hex = accepted(vars, key, "colour");
    return hex === null ? [] : [{ name, useFor, hex }];
  });

export const guideShapes = (vars: VarMap): GuideSample[] =>
  samples(vars, guide.shapes, "dimension");

export const guideSpaces = (vars: VarMap): GuideSample[] =>
  samples(vars, guide.spaces, "dimension");

export const guideDepths = (vars: VarMap): GuideSample[] =>
  samples(vars, guide.depths, "shadow");

export const guideMotions = (vars: VarMap): GuideSample[] =>
  samples(vars, guide.motions, "duration");

/** The first family of a font stack, for showing a font's name (null if it is not a plain name). */
export const fontName = (stack: string | number | undefined): string | null => {
  if (typeof stack !== "string") return null;
  return parseFontName((stack.split(",")[0] ?? "").replace(/['"]/g, ""));
};

/** The accessibility sentence: all easy to read, or how many pairs are not. */
export const readSummary = (failing: number): string =>
  failing === 0
    ? guide.readAll
    : guide.readSome.replace("{count}", String(failing));
