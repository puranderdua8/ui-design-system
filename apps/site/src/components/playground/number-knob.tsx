"use client";

import { useState } from "react";
import { Field, Input } from "@puranderdua/ui";

type NumberKnobProps = {
  label: string;
  description?: string;
  /** The knob's value, or `undefined` when the knob is unset. */
  value: number | undefined;
  /** What an unset knob means (shown in the field). */
  fallback: string;
  min?: number;
  step: number;
  /** Receives a number, or `undefined` when the field is emptied. */
  onChange: (value: number | undefined) => void;
};

/**
 * A number field that keeps what the user is typing ("0." on the way to "0.5")
 * while the knob only ever receives complete numbers. The draft is dropped on blur.
 */
export const NumberKnob = ({
  label,
  description,
  value,
  fallback,
  min,
  step,
  onChange,
}: NumberKnobProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === undefined ? fallback : String(value));

  return (
    <Field label={label} description={description}>
      <Input
        type="number"
        size="sm"
        min={min}
        step={step}
        value={shown}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          if (text === "") return onChange(undefined);
          const parsed = Number(text);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        onBlur={() => setDraft(null)}
      />
    </Field>
  );
};
