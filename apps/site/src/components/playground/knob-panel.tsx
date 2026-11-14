"use client";

import {
  Button,
  Field,
  Heading,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
} from "@puranderdua/ui";
import { themeLabels, themeNames, isThemeName } from "@/lib/theme";
import { fontChoices } from "@/playground/fonts";
import {
  asPickerColour,
  currentFont,
  startFrom,
  withKnobs,
} from "@/playground/state";
import { setState } from "@/playground/store";
import type {
  FontId,
  Knobs,
  PlaygroundState,
  ResolvedTheme,
} from "@/playground/types";
import { NumberKnob } from "./number-knob";

type KnobPanelProps = { state: PlaygroundState; resolved: ResolvedTheme };

const FontSelect = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FontId | undefined;
  onChange: (font: FontId) => void;
}) => (
  <Field label={label}>
    <Select value={value} onValueChange={(next) => onChange(next as FontId)}>
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fontChoices.map((font) => (
          <SelectItem key={font.id} value={font.id}>
            {font.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

export const KnobPanel = ({ state, resolved }: KnobPanelProps) => {
  const { knobs } = state;
  const update = (patch: Partial<Record<keyof Knobs, unknown>>) =>
    setState(withKnobs(state, patch));
  const colour = (key: "brand" | "accent", token: string) =>
    knobs[key] ?? asPickerColour(resolved.vars[token]) ?? "#000000";
  const borderWidth = parseFloat(String(resolved.vars["--ds-border-width-1"]));

  return (
    <Stack gap="lg">
      <Stack gap="md">
        <Heading as="h2" variant="h3">
          Start from
        </Heading>
        <Field
          label="Starting theme"
          description="Choosing a theme clears every knob and override."
        >
          <Select
            value={state.start}
            onValueChange={(next) => {
              if (isThemeName(next)) setState(startFrom(next));
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themeNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {themeLabels[name]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setState(startFrom(state.start))}
          >
            Reset to {themeLabels[state.start]}
          </Button>
        </div>
      </Stack>

      <Stack gap="md">
        <Heading as="h2" variant="h3">
          Knobs
        </Heading>
        <Field
          label="Brand colour"
          description="Becomes brand 600; the rest of the scale follows."
        >
          <Input
            type="color"
            size="sm"
            value={colour("brand", "--ds-color-brand-600")}
            onChange={(event) => update({ brand: event.target.value })}
          />
        </Field>
        <Field label="Accent colour" description="Tabs and accent Cards.">
          <Input
            type="color"
            size="sm"
            value={colour("accent", "--ds-color-accent-600")}
            onChange={(event) => update({ accent: event.target.value })}
          />
        </Field>
        <NumberKnob
          label="Neutral hue"
          description="Degrees, 0 to 360. Empty keeps the theme's neutrals."
          value={knobs.neutral?.hue}
          fallback=""
          step={5}
          onChange={(hue) =>
            update({
              neutral: tidyNeutral({ ...knobs.neutral, hue }),
            })
          }
        />
        <NumberKnob
          label="Neutral chroma"
          description="0 is grey, 0.04 is clearly tinted."
          value={knobs.neutral?.chroma}
          fallback=""
          min={0}
          step={0.005}
          onChange={(chroma) =>
            update({
              neutral: tidyNeutral({ ...knobs.neutral, chroma }),
            })
          }
        />
        <FontSelect
          label="Heading font"
          value={
            knobs.headingFont ??
            currentFont(resolved.vars, "--ds-font-family-heading")
          }
          onChange={(headingFont) => update({ headingFont })}
        />
        <FontSelect
          label="Body font"
          value={
            knobs.bodyFont ??
            currentFont(resolved.vars, "--ds-font-family-body")
          }
          onChange={(bodyFont) => update({ bodyFont })}
        />
        <NumberKnob
          label="Radius scale"
          description="Multiplies the small, medium and large radii."
          value={knobs.radiusScale}
          fallback="1"
          min={0.1}
          step={0.25}
          onChange={(radiusScale) => update({ radiusScale })}
        />
        <NumberKnob
          label="Border width (px)"
          value={knobs.borderWidth}
          fallback={String(borderWidth)}
          min={0}
          step={0.5}
          onChange={(width) => update({ borderWidth: width })}
        />
        <NumberKnob
          label="Shadow strength"
          description="Multiplies shadow opacity and blur."
          value={knobs.shadowStrength}
          fallback="1"
          min={0.1}
          step={0.25}
          onChange={(shadowStrength) => update({ shadowStrength })}
        />
        <NumberKnob
          label="Density"
          description="Multiplies spacing and control heights; controls stay 24px or taller."
          value={knobs.density}
          fallback="1"
          min={0.5}
          step={0.1}
          onChange={(density) => update({ density })}
        />
        <NumberKnob
          label="Motion speed"
          description="2 halves every duration."
          value={knobs.motionSpeed}
          fallback="1"
          min={0.25}
          step={0.25}
          onChange={(motionSpeed) => update({ motionSpeed })}
        />
      </Stack>
    </Stack>
  );
};

const tidyNeutral = (
  neutral: NonNullable<Knobs["neutral"]>,
): Knobs["neutral"] | undefined =>
  neutral.hue === undefined && neutral.chroma === undefined
    ? undefined
    : neutral;
