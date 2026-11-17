"use client";

import { useEffect, useRef, useState } from "react";
import {
  Field,
  Fieldset,
  Grid,
  Input,
  RadioCard,
  RadioGroup,
  Slider,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { fontChoices, fontPairings } from "@/playground/fonts";
import { parseFontName } from "@/playground/grammar";
import { presetChoices, withPreset } from "@/playground/presets";
import {
  currentPairing,
  withKnobs,
  withOwnFont,
  withPairing,
} from "@/playground/state";
import { setState } from "@/playground/store";
import type { PlaygroundState } from "@/playground/types";

const { typography: text, errors, steps } = content;
const typography = steps.find((step) => step.id === "typography")!;
const pairings = typography.groups[0]!.choices;
const sizes = typography.groups[1]!.choices;

const sizeRange = { min: 0.8, max: 1.3, step: 0.05 } as const;

type TypographyStepProps = {
  state: PlaygroundState;
  vars: Record<string, string | number>;
};

const sampleFont = (id: string) =>
  `var(${fontChoices.find((font) => font.id === id)!.cssVar})`;

/** The size in words, for the Slider's screen-reader value: below, at or above standard. */
const sizeWords = (scale: number): string =>
  scale < 1
    ? text.sizeWord.smaller
    : scale > 1
      ? text.sizeWord.larger
      : text.sizeWord.standard;

type OwnFontFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (name: string | undefined) => void;
  testId: string;
};

/**
 * One typed font name. A valid name applies at once, an empty field clears it, and a
 * wrong one waits for the person to leave the field (or press Enter), then says what is
 * wrong. Below it, the stand-in line says what the preview shows instead.
 */
const OwnFontField = ({
  label,
  value,
  onChange,
  testId,
}: OwnFontFieldProps) => {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | undefined>();
  const committed = useRef(value);

  // Follow a change from somewhere else (undo, a pairing, a project file).
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value ?? "");
      setError(undefined);
    }
  }, [value]);

  const commit = (input: string, showError: boolean) => {
    if (input.trim() === "") {
      setError(undefined);
      if (committed.current !== undefined) {
        committed.current = undefined;
        onChange(undefined);
      }
      return;
    }
    const name = parseFontName(input);
    if (name !== null) {
      setError(undefined);
      if (name !== committed.current) {
        committed.current = name;
        onChange(name);
      }
      return;
    }
    if (showError)
      setError(`${errors.fontInvalid.message} ${errors.fontInvalid.fix}`);
  };

  return (
    <Stack gap="sm" data-testid={testId}>
      <Field label={label} description={text.ownHint} error={error}>
        <Input
          value={draft}
          maxLength={60}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => {
            setDraft(event.target.value);
            if (
              parseFontName(event.target.value) !== null ||
              !event.target.value
            )
              commit(event.target.value, false);
            else setError(undefined);
          }}
          onBlur={() => commit(draft, true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(draft, true);
          }}
        />
      </Field>
      {value ? (
        <Text variant="caption" data-testid={`${testId}-standin`}>
          {text.standIn} {value}. {errors.fontMissing.fix}
        </Text>
      ) : null}
    </Stack>
  );
};

/**
 * Typography (spec 4.4 row 3): font pairings drawn in their own typefaces, a font you
 * name yourself (shown as a stand-in, written to the files), and the text size with a
 * fine-tune. Every font here is one the site already serves itself (D-122).
 */
export const TypographyStep = ({ state, vars }: TypographyStepProps) => {
  const pairing = currentPairing(state, vars);
  const typeSource = (state.dims.type ?? state.start) as string;
  const size = presetChoices.type.find((choice) => choice.from === typeSource);
  const scale = state.knobs.typeScale ?? 1;

  return (
    <Stack gap="lg">
      <Fieldset
        legend={typography.groups[0]!.label}
        description={text.pairingsHint}
      >
        <RadioGroup
          value={pairing?.id ?? ""}
          onValueChange={(id) => {
            const next = fontPairings.find((candidate) => candidate.id === id);
            if (next) setState(withPairing(state, next));
          }}
        >
          <Grid minItemWidth="sm" gap="md">
            {fontPairings.map((candidate, index) => (
              <RadioCard
                key={candidate.id}
                value={candidate.id}
                label={pairings[index]!.name}
                description={pairings[index]!.hint}
                media={
                  <span
                    data-testid={`pairing-${candidate.id}-sample`}
                    className="block text-ds-text"
                  >
                    <span
                      className="block text-xl font-semibold"
                      style={{ fontFamily: sampleFont(candidate.heading) }}
                    >
                      {text.headingSample}
                    </span>
                    <span
                      className="block text-sm"
                      style={{ fontFamily: sampleFont(candidate.body) }}
                    >
                      {text.bodySample}
                    </span>
                  </span>
                }
              />
            ))}
          </Grid>
        </RadioGroup>
      </Fieldset>

      <Fieldset legend={typography.fineTune!} description={text.ownIntro}>
        <Stack gap="md">
          <OwnFontField
            label={text.headingFont}
            value={state.fonts.heading}
            onChange={(name) => setState(withOwnFont(state, "heading", name))}
            testId="own-heading-font"
          />
          <OwnFontField
            label={text.bodyFont}
            value={state.fonts.body}
            onChange={(name) => setState(withOwnFont(state, "body", name))}
            testId="own-body-font"
          />
        </Stack>
      </Fieldset>

      <Fieldset legend={typography.groups[1]!.label}>
        <Stack gap="md">
          <RadioGroup
            value={size?.id ?? ""}
            onValueChange={(id) => {
              const next = presetChoices.type.find(
                (choice) => choice.id === id,
              );
              if (next)
                setState(
                  // Choosing a size starts from that size: the fine-tune is cleared.
                  withKnobs(withPreset(state, "type", next.from), {
                    typeScale: undefined,
                  }),
                );
            }}
          >
            <Grid minItemWidth="sm" gap="md">
              {presetChoices.type.map((choice, index) => (
                <RadioCard
                  key={choice.id}
                  value={choice.id}
                  label={sizes[index]!.name}
                  description={sizes[index]!.hint}
                />
              ))}
            </Grid>
          </RadioGroup>
          <Field label={text.sizeFineTune}>
            <Slider
              min={sizeRange.min}
              max={sizeRange.max}
              step={sizeRange.step}
              value={[scale]}
              onValueChange={([next]) =>
                setState(
                  withKnobs(state, {
                    typeScale:
                      next === undefined || next === 1 ? undefined : next,
                  }),
                )
              }
              formatValue={(value) => `${Math.round(value * 100)}%`}
              aria-valuetext={(value) => sizeWords(value)}
            />
          </Field>
        </Stack>
      </Fieldset>
    </Stack>
  );
};
