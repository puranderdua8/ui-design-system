"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { Label } from "./label";
import { Text } from "./text";

export type FieldContextValue = {
  controlId: string;
  /** Id of the Field's label, for groups that need `aria-labelledby`. */
  labelId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Wiring a `Field` gives its control (id, description, error, required). */
export const useFieldContext = () => React.use(FieldContext);

export type FieldProps = Omit<ElementProps<"div">, "children"> & {
  label: React.ReactNode;
  /** Help text, linked to the control with `aria-describedby`. */
  description?: React.ReactNode;
  /** Error message. Marks the control invalid and is announced when it appears. */
  error?: React.ReactNode;
  required?: boolean;
  /**
   * `stacked` puts the label above the control. `inline` puts the control first
   * and the label beside it (a Checkbox); description and error stay below.
   * The DOM follows the visual order in both layouts.
   */
  layout?: FieldLayout;
  /** Fixes the control's id (otherwise generated with `useId`). */
  id?: string;
  /** One form control, such as `Input`. For a group of controls use `Fieldset`. */
  children: React.ReactNode;
};

export type FieldLayout = "stacked" | "inline";

export const Field = ({
  label,
  description,
  error,
  required = false,
  layout = "stacked",
  id,
  className,
  children,
  ...props
}: FieldProps) => {
  const generatedId = React.useId();
  const controlId = id ?? `${generatedId}-control`;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const hasDescription =
    description != null && description !== false && description !== "";
  const hasError = error != null && error !== false && error !== "";

  const describedBy =
    [hasDescription ? descriptionId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const value = React.useMemo(
    () => ({ controlId, labelId, describedBy, invalid: hasError, required }),
    [controlId, labelId, describedBy, hasError, required],
  );

  const labelElement = (
    <Label id={labelId} htmlFor={controlId} required={required}>
      {label}
    </Label>
  );

  return (
    <FieldContext value={value}>
      <div
        {...props}
        data-slot="field"
        data-layout={layout}
        data-invalid={hasError ? "" : undefined}
        className={cn("flex flex-col gap-ds-gap-xs", className)}
      >
        {layout === "inline" ? (
          <div className="flex items-center gap-ds-gap-sm">
            {children}
            {labelElement}
          </div>
        ) : (
          <>
            {labelElement}
            {children}
          </>
        )}
        {hasDescription ? (
          <Text as="p" variant="caption" id={descriptionId}>
            {description}
          </Text>
        ) : null}
        {hasError ? (
          <Text
            as="p"
            variant="caption"
            id={errorId}
            role="alert"
            className="text-ds-danger-fg"
          >
            {error}
          </Text>
        ) : null}
      </div>
    </FieldContext>
  );
};
