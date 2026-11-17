"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Field,
  Fieldset,
  Grid,
  Input,
  RadioCard,
  RadioGroup,
  Stack,
  Text,
  ThemeScope,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { themeNames, type ThemeName } from "@/lib/theme";
import { themeMaps } from "@/playground/data";
import { recommend, type Answers } from "@/playground/presets";
import {
  parseBrand,
  readImageColour,
  readabilityLine,
  withBrand,
  withLook,
} from "@/playground/start";
import { previewVars, safeResolve } from "@/playground/state";
import { setState } from "@/playground/store";
import type { PlaygroundState } from "@/playground/types";
import { ColourField } from "./colour-field";

const { start: text, steps, questions } = content;
const looks = steps.find((step) => step.id === "start")!.groups[0]!.choices;

type StartStepProps = {
  state: PlaygroundState;
  /** The project's own resolved colours, for the readability line. */
  vars: Record<string, string | number>;
};

/** A look drawn in the person's colour: a small page with a heading, text and a button. */
const Thumbnail = ({
  look,
  state,
}: {
  look: ThemeName;
  state: PlaygroundState;
}) => {
  const vars = useMemo(
    () =>
      previewVars(safeResolve(withLook(state, look), themeMaps).resolved.vars),
    [state, look],
  );
  return (
    <ThemeScope
      theme={look}
      vars={vars}
      data-testid={`thumbnail-${look}`}
      className="ds-border rounded-ds-card border-ds-border bg-ds-canvas p-ds-gap-md font-ds-body"
    >
      <div className="flex flex-col gap-ds-gap-sm">
        <span className="font-ds-heading text-ds-text font-semibold">Aa</span>
        <span className="h-2 w-3/4 rounded-ds-control bg-ds-surface-subtle" />
        <span
          data-testid={`thumbnail-${look}-button`}
          className="inline-block w-fit rounded-ds-control bg-ds-primary px-ds-gap-md py-ds-gap-xs text-ds-primary-fg"
        >
          {text.thumbnailSample}
        </span>
      </div>
    </ThemeScope>
  );
};

const questionIds = ["mood", "room", "corners"] as const;

/** Start (spec 4.4 row 1): an optional brand colour, four looks, and three questions. */
export const StartStep = ({ state, vars }: StartStepProps) => {
  const [imageError, setImageError] = useState<string | undefined>();
  const [asking, setAsking] = useState(false);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [reason, setReason] = useState<string | undefined>();
  const complete = questionIds.every((id) => answers[id] !== undefined);

  const brand = state.knobs.brand;
  const fallback = String(vars["--ds-color-brand-600"] ?? "#000000");

  const fromImage = async (file: File | undefined) => {
    if (!file) return;
    const hex = await readImageColour(file);
    const parsed = hex ? parseBrand(hex) : null;
    if (parsed?.ok) {
      setImageError(undefined);
      setState(withBrand(state, parsed.hex));
    } else setImageError(`${text.imageFailed.message} ${text.imageFailed.fix}`);
  };

  return (
    <Stack gap="lg">
      <ColourField
        label={text.brandLabel}
        hint={text.brandHint}
        value={brand}
        fallback={fallback}
        pickerLabel={text.pickerLabel}
        clearLabel={text.clearBrand}
        line={readabilityLine(vars, "brand")}
        onChange={(hex) => setState(withBrand(state, hex))}
        onClear={() => setState(withBrand(state, undefined))}
        testId="brand-start"
      />
      <Field
        label={text.fromImage}
        description={text.imageNote}
        error={imageError}
      >
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            void fromImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </Field>

      <Fieldset legend={text.looksLabel} description={text.looksHint}>
        <RadioGroup
          value={state.start}
          onValueChange={(next) => {
            if (next !== state.start)
              setState(withLook(state, next as ThemeName));
          }}
        >
          <Grid minItemWidth="sm" gap="md">
            {themeNames.map((look, index) => (
              <RadioCard
                key={look}
                value={look}
                label={looks[index]!.name}
                description={looks[index]!.hint}
                media={<Thumbnail look={look} state={state} />}
              />
            ))}
          </Grid>
        </RadioGroup>
      </Fieldset>

      <Stack gap="sm">
        <div>
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={asking}
            aria-controls="three-questions"
            onClick={() => setAsking(!asking)}
          >
            {questions.link}
          </Button>
        </div>
        {asking ? (
          <Stack gap="md" id="three-questions" data-testid="three-questions">
            {questionIds.map((id) => {
              const question = questions[id];
              const options = Object.entries(question.options);
              return (
                <Fieldset key={id} legend={question.question}>
                  <RadioGroup
                    value={answers[id] ?? ""}
                    onValueChange={(next) =>
                      setAnswers({ ...answers, [id]: next })
                    }
                  >
                    <Grid minItemWidth="sm" gap="sm">
                      {options.map(([key, option]) => (
                        <RadioCard key={key} value={key} label={option.name} />
                      ))}
                    </Grid>
                  </RadioGroup>
                </Fieldset>
              );
            })}
            <div>
              <Button
                size="sm"
                disabled={!complete}
                onClick={() => {
                  if (!complete) return;
                  const result = recommend(answers as Answers);
                  setState({
                    ...withLook(state, result.start),
                    dims: result.dims,
                  });
                  setReason(result.reason);
                }}
              >
                {text.applyAnswers}
              </Button>
            </div>
          </Stack>
        ) : null}
        {reason ? (
          <div
            role="status"
            data-testid="start-reason"
            className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
          >
            <Text>
              <strong>{questions.result}</strong> {reason}
            </Text>
          </div>
        ) : null}
      </Stack>
    </Stack>
  );
};
