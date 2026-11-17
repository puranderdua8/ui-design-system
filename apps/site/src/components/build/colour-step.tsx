"use client";

import {
  Cluster,
  Fieldset,
  Grid,
  RadioCard,
  RadioGroup,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { suggestHighlights } from "@/playground/presets";
import {
  currentFeel,
  feelIds,
  feelSwatch,
  readabilityLine,
  shadeStrip,
  withBrand,
  withFeel,
  type Feel,
} from "@/playground/start";
import { withKnobs } from "@/playground/state";
import { setState } from "@/playground/store";
import type { PlaygroundState } from "@/playground/types";
import { ColourField } from "./colour-field";

const { colour: text, start, steps } = content;
const feels = steps.find((step) => step.id === "colour")!.groups[0]!.choices;

type ColourStepProps = {
  state: PlaygroundState;
  vars: Record<string, string | number>;
};

/**
 * Colour (spec 4.4 row 2): the brand colour with its shades, a highlight colour (our
 * suggestions or your own) and the background feel, each with its readability line.
 */
export const ColourStep = ({ state, vars }: ColourStepProps) => {
  const brand = state.knobs.brand;
  const accent = state.knobs.accent;
  const brandNow = String(vars["--ds-color-brand-600"]);
  const accentNow = String(vars["--ds-color-accent-600"]);
  const feel = currentFeel(state);

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <ColourField
          label={text.brandLabel}
          value={brand}
          fallback={brandNow}
          pickerLabel={start.pickerLabel}
          clearLabel={start.clearBrand}
          line={readabilityLine(vars, "brand")}
          onChange={(hex) => setState(withBrand(state, hex))}
          onClear={() => setState(withBrand(state, undefined))}
          testId="brand-colour"
        />
        <div
          role="img"
          aria-label={text.shadesLabel}
          data-testid="shade-strip"
          className="flex overflow-hidden rounded-ds-card"
        >
          {shadeStrip(vars).map(({ step, hex }) => (
            <span
              key={step}
              className="h-8 flex-1"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </Stack>

      <Fieldset legend={text.highlightLabel} description={text.highlightHint}>
        <Stack gap="md">
          <Cluster gap="sm" data-testid="highlight-suggestions">
            {suggestHighlights(brandNow).map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={`${text.suggestionLabel} ${hex}`}
                aria-pressed={accent === hex}
                onClick={() => setState(withKnobs(state, { accent: hex }))}
                className="ds-focus-ring ds-hit-area size-10 rounded-ds-control border-2 border-ds-border aria-pressed:border-ds-text"
                style={{ backgroundColor: hex }}
              />
            ))}
          </Cluster>
          <ColourField
            label={text.ownHighlight}
            value={accent}
            fallback={accentNow}
            pickerLabel={start.pickerLabel}
            clearLabel={text.useLookHighlight}
            line={readabilityLine(vars, "highlight")}
            onChange={(hex) => setState(withKnobs(state, { accent: hex }))}
            onClear={() => setState(withKnobs(state, { accent: undefined }))}
            testId="highlight-colour"
          />
        </Stack>
      </Fieldset>

      <Fieldset legend={text.feelLabel}>
        <Stack gap="sm">
          <RadioGroup
            value={feel ?? ""}
            onValueChange={(next) => setState(withFeel(state, next as Feel))}
          >
            <Grid minItemWidth="sm" gap="md">
              {feelIds.map((id, index) => (
                <RadioCard
                  key={id}
                  value={id}
                  label={feels[index]!.name}
                  description={feels[index]!.hint}
                  media={
                    <span
                      className="block h-8 w-full rounded-ds-control"
                      style={{ backgroundColor: feelSwatch(id, state) }}
                    />
                  }
                />
              ))}
            </Grid>
          </RadioGroup>
          <Text variant="caption" data-testid="feel-line">
            {readabilityLine(vars, "background")}
          </Text>
        </Stack>
      </Fieldset>
    </Stack>
  );
};
