"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Cluster, Field, Input, Stack, Text } from "@puranderdua/ui";
import { parseBrand } from "@/playground/start";

type ColourFieldProps = {
  /** The label of the text field, and the start of the picker's name. */
  label: string;
  hint?: string;
  /** The chosen colour (`#rrggbb`), or `undefined` when the look's own colour is used. */
  value: string | undefined;
  /** What the picker shows when there is no chosen colour. */
  fallback: string;
  pickerLabel: string;
  clearLabel?: string;
  /** The sentence under the colour: is the text on it readable? */
  line: string;
  onChange: (hex: string) => void;
  onClear?: () => void;
  testId: string;
};

const complete = /^#?[0-9a-f]{6}$/i;

/**
 * One colour, every way (spec 4.4): a text field, the picker beside it, and the
 * readability line under it. A full 6-digit code applies at once; a shorter or wrong one
 * waits until the person leaves the field or presses Enter, then says what is wrong.
 */
export const ColourField = ({
  label,
  hint,
  value,
  fallback,
  pickerLabel,
  clearLabel,
  line,
  onChange,
  onClear,
  testId,
}: ColourFieldProps) => {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | undefined>();
  const committed = useRef(value);

  // Follow a change that came from somewhere else (undo, a picture, a suggestion).
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value ?? "");
      setError(undefined);
    }
  }, [value]);

  const commit = (text: string, showError: boolean) => {
    if (text.trim() === "") {
      setError(undefined);
      return;
    }
    const result = parseBrand(text);
    if (result.ok) {
      setError(undefined);
      committed.current = result.hex;
      onChange(result.hex);
      return;
    }
    if (showError) setError(result.message);
  };

  return (
    <Stack gap="sm" data-testid={testId}>
      <Cluster gap="md" align="end">
        <Field label={label} description={hint} error={error}>
          <Input
            value={draft}
            maxLength={9}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setDraft(event.target.value);
              if (complete.test(event.target.value.trim()))
                commit(event.target.value, false);
              else setError(undefined);
            }}
            onBlur={() => commit(draft, true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit(draft, true);
            }}
          />
        </Field>
        <Input
          type="color"
          size="sm"
          aria-label={`${label}: ${pickerLabel}`}
          value={value ?? fallback}
          onChange={(event) => {
            committed.current = event.target.value;
            setDraft(event.target.value);
            setError(undefined);
            onChange(event.target.value);
          }}
        />
        {onClear && value ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        ) : null}
      </Cluster>
      <Text variant="caption" data-testid={`${testId}-line`}>
        {line}
      </Text>
    </Stack>
  );
};
