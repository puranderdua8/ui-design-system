"use client";

import { useState } from "react";
import {
  Button,
  Cluster,
  Field,
  Fieldset,
  Grid,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Text,
} from "@puranderdua/ui";
import {
  themeLabels,
  themeNames,
  isThemeName,
  type ThemeName,
} from "@/lib/theme";
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

  const hasEdits =
    Object.keys(knobs).length > 0 || Object.keys(state.overrides).length > 0;
  // A different look is held here until the person confirms; nothing changes yet.
  const [pending, setPending] = useState<ThemeName | null>(null);

  return (
    <Stack gap="lg">
      <Stack gap="md">
        <Field
          label="Starting look"
          description="Choosing a new look replaces the changes you have made."
        >
          <Select
            value={state.start}
            onValueChange={(next) => {
              if (!isThemeName(next) || next === state.start) return;
              if (hasEdits) setPending(next);
              else setState(startFrom(next));
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
        {pending ? (
          <div
            role="alert"
            data-testid="look-confirm"
            className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
          >
            <Stack gap="sm">
              <Text>
                Switch to {themeLabels[pending]}? This replaces the changes you
                have made.
              </Text>
              <Cluster gap="sm">
                <Button
                  size="sm"
                  onClick={() => {
                    setState(startFrom(pending));
                    setPending(null);
                  }}
                >
                  Replace my changes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPending(null)}
                >
                  Keep my changes
                </Button>
              </Cluster>
            </Stack>
          </div>
        ) : null}
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPending(null);
              setState(startFrom(state.start));
            }}
          >
            Reset to {themeLabels[state.start]}
          </Button>
        </div>
      </Stack>

      <Stack gap="md">
        <Grid minItemWidth="sm" gap="md">
          <Field
            label="Brand colour"
            description="Your main colour, used for buttons and links (brand 600). The lighter and darker shades follow."
          >
            <Input
              type="color"
              size="sm"
              value={colour("brand", "--ds-color-brand-600")}
              onChange={(event) => update({ brand: event.target.value })}
            />
          </Field>
          <Field
            label="Highlight colour"
            description="Used for tabs and highlighted cards (the accent colour)."
          >
            <Input
              type="color"
              size="sm"
              value={colour("accent", "--ds-color-accent-600")}
              onChange={(event) => update({ accent: event.target.value })}
            />
          </Field>
        </Grid>
        <Fieldset
          legend="Background feel"
          description="Tints the greys behind and between your content. Leave both empty to keep the look's own greys."
        >
          <Grid minItemWidth="sm" gap="sm">
            <NumberKnob
              label="Tint colour"
              description="A place on the colour wheel, 0 to 360 (hue)."
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
              label="Tint strength"
              description="0 is plain grey, 0.04 is clearly tinted (chroma)."
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
          </Grid>
        </Fieldset>
        <Grid minItemWidth="sm" gap="md">
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
        </Grid>
        <Grid minItemWidth="sm" gap="md">
          <NumberKnob
            label="Corners"
            description="Higher is rounder (the radius scale). 1 keeps the look's own."
            value={knobs.radiusScale}
            fallback="1"
            min={0.1}
            step={0.25}
            onChange={(radiusScale) => update({ radiusScale })}
          />
          <NumberKnob
            label="Outline (px)"
            description="How thick borders are (the border width)."
            value={knobs.borderWidth}
            fallback={String(borderWidth)}
            min={0}
            step={0.5}
            onChange={(width) => update({ borderWidth: width })}
          />
          <NumberKnob
            label="Shadows"
            description="Higher is stronger and softer. 1 keeps the look's own."
            value={knobs.shadowStrength}
            fallback="1"
            min={0.1}
            step={0.25}
            onChange={(shadowStrength) => update({ shadowStrength })}
          />
          <NumberKnob
            label="Spacing"
            description="Higher is roomier. Controls stay at least 24px."
            value={knobs.density}
            fallback="1"
            min={0.5}
            step={0.1}
            onChange={(density) => update({ density })}
          />
          <NumberKnob
            label="Motion"
            description="Higher is faster. 2 halves every duration."
            value={knobs.motionSpeed}
            fallback="1"
            min={0.25}
            step={0.25}
            onChange={(motionSpeed) => update({ motionSpeed })}
          />
        </Grid>
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
