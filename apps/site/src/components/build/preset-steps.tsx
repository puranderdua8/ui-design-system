"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Button,
  Cluster,
  Field,
  Fieldset,
  Grid,
  RadioCard,
  RadioGroup,
  Slider,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { themeMaps } from "@/playground/data";
import {
  outlineWidths,
  presetChoices,
  withPreset,
  type PresetDimension,
} from "@/playground/presets";
import { withKnobs } from "@/playground/state";
import { setState } from "@/playground/store";
import type { Knobs, PlaygroundState, ThemeName } from "@/playground/types";

// Shape, Spacing and Depth and motion (spec 4.4 rows 4 to 6): picture choices that each
// take one dimension from a shipped look, with a fine-tune slider whose value is said in
// words. Choosing a card starts from that choice, so its fine-tune is cleared.

const { look: text, buttons, steps } = content;
const shape = steps.find((step) => step.id === "shape")!;
const spacing = steps.find((step) => step.id === "spacing")!;
const depth = steps.find((step) => step.id === "depth")!;

type StepProps = {
  state: PlaygroundState;
  vars: Record<string, string | number>;
};

type Source = ThemeName | "flat";

/** A value of the shipped look a card is taken from, as text. */
const sample = (from: Source, key: string): string =>
  from === "flat" ? "" : String(themeMaps[from].vars[key]);

const round = (value: number): number => Math.round(value * 100) / 100;

/** `value` below, at or above 1 (the choice as it is), as one of three words. */
const word = (value: number, [below, same, above]: string[]): string =>
  value < 0.995 ? below! : value > 1.005 ? above! : same!;

type CardsProps = {
  state: PlaygroundState;
  dim: PresetDimension;
  /** The fine-tune that the choice resets. */
  knob: keyof Knobs;
  legend: string;
  choices: { name: string; hint: string }[];
  media?: (from: Source) => React.ReactNode;
};

const Cards = ({ state, dim, knob, legend, choices, media }: CardsProps) => {
  const current = presetChoices[dim].find(
    (choice) => choice.from === (state.dims[dim] ?? state.start),
  );
  return (
    <Fieldset legend={legend}>
      <RadioGroup
        value={current?.id ?? ""}
        onValueChange={(id) => {
          const next = presetChoices[dim].find((choice) => choice.id === id);
          if (next)
            setState(
              withKnobs(withPreset(state, dim, next.from), {
                [knob]: undefined,
              }),
            );
        }}
      >
        <Grid minItemWidth="sm" gap="md">
          {presetChoices[dim].map((choice, index) => (
            <RadioCard
              key={choice.id}
              value={choice.id}
              label={choices[index]!.name}
              description={choices[index]!.hint}
              media={media?.(choice.from)}
            />
          ))}
        </Grid>
      </RadioGroup>
    </Fieldset>
  );
};

type FineTuneProps = {
  state: PlaygroundState;
  knob: Exclude<keyof Knobs, "borderWidth">;
  label: string;
  min: number;
  max: number;
  step: number;
  words: string[];
};

/** A multiplier slider (1 means "as in the choice"); one drag or key run is one undo. */
const FineTune = ({
  state,
  knob,
  label,
  min,
  max,
  step,
  words,
}: FineTuneProps) => {
  const value = (state.knobs[knob] as number | undefined) ?? 1;
  return (
    <Field label={label}>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) =>
          setState(
            withKnobs(state, {
              [knob]:
                next === undefined || round(next) === 1
                  ? undefined
                  : round(next),
            }),
            `fine-tune-${knob}`,
          )
        }
        formatValue={(v) => `${Math.round(v * 100)}%`}
        aria-valuetext={(v) => word(v, words)}
      />
    </Field>
  );
};

const cornerSample = (from: Source) => (
  <span
    aria-hidden="true"
    data-testid={`corner-${from}`}
    className="ds-border block h-10 w-full border-ds-border bg-ds-surface-subtle"
    style={{ borderRadius: sample(from, "--ds-radius-lg") }}
  />
);

export const ShapeStep = ({ state, vars }: StepProps) => {
  const width = Number.parseFloat(String(vars["--ds-border-width-1"]));
  const bold = (state.knobs.borderWidth ?? 1) >= 2;
  return (
    <Stack gap="lg">
      <Cards
        state={state}
        dim="shape"
        knob="radiusScale"
        legend={shape.groups[0]!.label}
        choices={shape.groups[0]!.choices}
        media={cornerSample}
      />
      <FineTune
        state={state}
        knob="radiusScale"
        label={text.cornersFineTune}
        min={0.5}
        max={1.5}
        step={0.1}
        words={[
          text.cornersWord.squarer,
          text.cornersWord.same,
          text.cornersWord.rounder,
        ]}
      />
      <Fieldset legend={shape.groups[1]!.label}>
        <Stack gap="md">
          <RadioGroup
            value={bold ? "bold" : "thin"}
            onValueChange={(id) =>
              setState(
                withKnobs(state, {
                  borderWidth:
                    id === "bold" ? outlineWidths.bold : outlineWidths.thin,
                }),
              )
            }
          >
            <Grid minItemWidth="sm" gap="md">
              {(["thin", "bold"] as const).map((id, index) => (
                <RadioCard
                  key={id}
                  value={id}
                  label={shape.groups[1]!.choices[index]!.name}
                  description={shape.groups[1]!.choices[index]!.hint}
                  media={
                    <span
                      aria-hidden="true"
                      className="block h-10 w-full rounded-ds-card border-ds-border"
                      style={{
                        borderStyle: "solid",
                        borderWidth: `${outlineWidths[id]}px`,
                      }}
                    />
                  }
                />
              ))}
            </Grid>
          </RadioGroup>
          <Field label={text.outlineFineTune}>
            <Slider
              min={1}
              max={4}
              step={1}
              value={[Number.isFinite(width) ? width : 1]}
              onValueChange={([next]) =>
                setState(
                  withKnobs(state, { borderWidth: next ?? 1 }),
                  "fine-tune-borderWidth",
                )
              }
              formatValue={(v) => `${v}px`}
              aria-valuetext={(v) =>
                text.outlineWord.replace("{count}", String(v))
              }
            />
          </Field>
        </Stack>
      </Fieldset>
    </Stack>
  );
};

export const SpacingStep = ({ state }: StepProps) => (
  <Stack gap="lg">
    <Cards
      state={state}
      dim="spacing"
      knob="density"
      legend={spacing.groups[0]!.label}
      choices={spacing.groups[0]!.choices}
      media={(from) => (
        <span
          aria-hidden="true"
          data-testid={`spacing-${from}`}
          className="flex flex-col"
          style={{ gap: sample(from, "--ds-space-3") }}
        >
          {[0, 1, 2].map((bar) => (
            <span
              key={bar}
              className="block h-2 rounded-ds-control bg-ds-border"
            />
          ))}
        </span>
      )}
    />
    <FineTune
      state={state}
      knob="density"
      label={text.spacingFineTune}
      min={0.8}
      max={1.3}
      step={0.05}
      words={[
        text.spacingWord.tighter,
        text.spacingWord.same,
        text.spacingWord.roomier,
      ]}
    />
    <Text variant="caption">{text.tapNote}</Text>
  </Stack>
);

const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const reducedNow = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The Play button and its sample. The sample moves with the project's own duration and
 * easing; when the device asks for less movement it jumps instead and says so.
 */
const MotionPlay = ({ vars }: { vars: StepProps["vars"] }) => {
  const [moved, setMoved] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    reducedNow,
    () => false,
  );
  return (
    <Stack gap="sm">
      <Text variant="caption">{text.playHint}</Text>
      <div className="ds-border rounded-ds-card border-ds-border p-2">
        <span
          data-testid="motion-sample"
          className="block w-1/4 rounded-ds-control bg-ds-primary px-2 py-1 text-center text-ds-primary-fg"
          style={{
            transform: moved ? "translateX(300%)" : "none",
            transitionProperty: "transform",
            transitionDuration: reduced
              ? "0s"
              : String(vars["--ds-duration-200"]),
            transitionTimingFunction: String(vars["--ds-easing-out-strong"]),
          }}
        >
          {text.playSample}
        </span>
      </div>
      <Cluster>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMoved((was) => !was)}
        >
          {buttons.play}
        </Button>
      </Cluster>
      {reduced ? <Text variant="caption">{text.reducedMotion}</Text> : null}
    </Stack>
  );
};

export const DepthStep = ({ state, vars }: StepProps) => (
  <Stack gap="lg">
    <Cards
      state={state}
      dim="depth"
      knob="shadowStrength"
      legend={depth.groups[0]!.label}
      choices={depth.groups[0]!.choices}
      media={(from) => (
        <span
          aria-hidden="true"
          data-testid={`shadow-${from}`}
          className="block h-10 w-full rounded-ds-card bg-ds-surface-raised px-2 py-2 text-ds-text"
          style={{
            boxShadow:
              from === "flat" ? "none" : sample(from, "--ds-shadow-lg"),
          }}
        >
          {text.shadowSample}
        </span>
      )}
    />
    <FineTune
      state={state}
      knob="shadowStrength"
      label={text.shadowFineTune}
      min={0.25}
      max={2}
      step={0.25}
      words={[
        text.shadowWord.lighter,
        text.shadowWord.same,
        text.shadowWord.darker,
      ]}
    />
    <Cards
      state={state}
      dim="motion"
      knob="motionSpeed"
      legend={depth.groups[1]!.label}
      choices={depth.groups[1]!.choices}
    />
    <FineTune
      state={state}
      knob="motionSpeed"
      label={text.motionFineTune}
      min={0.5}
      max={2}
      step={0.25}
      words={[
        text.motionWord.slower,
        text.motionWord.same,
        text.motionWord.faster,
      ]}
    />
    <MotionPlay vars={vars} />
  </Stack>
);
