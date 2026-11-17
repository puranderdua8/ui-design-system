// The Guided steps as the Builder shell needs them (S51, spec 4.3): the URL of each step,
// its neighbours, and the person's current choice in words. Pure: no React, no DOM.
// Every string comes from the content file; nothing here is shown to a person unchanged
// except what the content file already holds.
import { builderContent as content, type StepId } from "../content/builder";
import { presetChoices, type PresetDimension } from "./presets";
import type { PlaygroundState, ThemeName } from "./types";

const { steps, shell } = content;

export const stepIds: readonly StepId[] = steps.map((step) => step.id);

export const isStepId = (value: unknown): value is StepId =>
  typeof value === "string" && (stepIds as readonly string[]).includes(value);

/** The step's URL. Each step has its own, so Back, Forward and deep links work. */
export const stepHref = (id: StepId): string => `/build/${id}`;

export const getStep = (id: StepId) => steps.find((step) => step.id === id)!;

/** The step before and after `id` (`undefined` at the ends). */
export const neighbours = (
  id: StepId,
): { previous?: StepId; next?: StepId } => {
  const at = stepIds.indexOf(id);
  return { previous: stepIds[at - 1], next: stepIds[at + 1] };
};

const lookOrder: readonly ThemeName[] = [
  "base",
  "corporate",
  "nature",
  "quirky",
];

/** The name of the picture choice a dimension currently has, from the content file. */
const choiceName = (
  step: StepId,
  group: number,
  dim: PresetDimension,
  state: PlaygroundState,
): string => {
  const options = presetChoices[dim];
  const from: string = state.dims[dim] ?? state.start;
  const index = options.findIndex((option) => option.from === from);
  const g = getStep(step).groups[group]!;
  // The Base look's shadows match none of the four shadow choices: say so plainly
  // instead of naming a choice that is not the one in use.
  return `${g.label}: ${index === -1 ? shell.sameAsLook : g.choices[index]!.name}`;
};

export type ChoiceSummary = {
  /** The step's row reads these, one per line. */
  lines: string[];
  /** A brand colour to draw as a small swatch (`#rrggbb`), when the step has one. */
  swatch?: string;
};

/**
 * What the step's row says about the current choice. `failing` is the number of colour
 * pairs that are hard to read (from the contrast report); it only matters for Check.
 */
export const currentChoice = (
  id: StepId,
  state: PlaygroundState,
  failing = 0,
): ChoiceSummary => {
  switch (id) {
    case "start": {
      const look = getStep("start").groups[0]!;
      const index = Math.max(0, lookOrder.indexOf(state.start));
      return { lines: [`${look.label}: ${look.choices[index]!.name}`] };
    }
    case "colour":
      return state.knobs.brand
        ? {
            lines: [`${shell.brandColour}: ${state.knobs.brand}`],
            swatch: state.knobs.brand,
          }
        : { lines: [shell.brandFromLook] };
    case "typography":
      return { lines: [choiceName("typography", 1, "type", state)] };
    case "shape": {
      const bold = (state.knobs.borderWidth ?? 1) >= 2;
      const outline = getStep("shape").groups[1]!;
      return {
        lines: [
          choiceName("shape", 0, "shape", state),
          `${outline.label}: ${bold ? shell.outlineBold : shell.outlineThin}`,
        ],
      };
    }
    case "spacing":
      return { lines: [choiceName("spacing", 0, "spacing", state)] };
    case "depth":
      return {
        lines: [
          choiceName("depth", 0, "depth", state),
          choiceName("depth", 1, "motion", state),
        ],
      };
    case "check":
      return {
        lines: [
          failing === 0
            ? shell.checkReadable
            : failing === 1
              ? content.status.fixOne
              : content.status.fixMany.replace("{count}", String(failing)),
        ],
      };
    case "use":
      return { lines: [shell.useSummary] };
  }
};
