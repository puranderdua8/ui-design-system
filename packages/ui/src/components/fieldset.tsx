"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { FieldDescription, FieldError, RequiredMarker } from "./field-parts";
import { describeMessages, hasContent, joinIds } from "./field.styles";
import { textVariants } from "./text";

export type FieldsetContextValue = {
  /** Id of the legend, so a group inside can be named by it. */
  legendId: string;
  invalid: boolean;
  required: boolean;
};

const FieldsetContext = React.createContext<FieldsetContextValue | null>(null);

/** What a `Fieldset` gives the group inside it (legend id, invalid, required). */
export const useFieldsetContext = () => React.use(FieldsetContext);

export type FieldsetProps = Omit<ElementProps<"fieldset">, "children"> & {
  /** The group's name. Rendered as the `<legend>`. */
  legend: React.ReactNode;
  /** Help text for the whole group, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Error message. Marks the group invalid and is announced when it appears. */
  error?: React.ReactNode;
  /** Shows the required marker and tells a `RadioGroup` inside it. */
  required?: boolean;
  /**
   * The id of the `<fieldset>` element itself; the legend, description and error
   * ids derive from it. (On `Field`, `id` is the control's id instead.)
   */
  id?: string;
  /** The group of controls, such as a `RadioGroup` or a list of `Checkbox` fields. */
  children: React.ReactNode;
};

/**
 * A group of controls: `<fieldset>` and `<legend>`, with a description and an
 * error for the group. Use it where `Field` would put one label on several
 * controls (RadioGroup, a list of checkboxes).
 */
export const Fieldset = ({
  legend,
  description,
  error,
  required = false,
  id,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: FieldsetProps) => {
  const generatedId = React.useId();
  const baseId = id ?? generatedId;
  const legendId = `${baseId}-legend`;
  const { hasDescription, hasError, descriptionId, errorId, describedBy } =
    describeMessages(baseId, description, error);

  const invalid = hasContent(error);
  const value = React.useMemo(
    () => ({ legendId, invalid, required }),
    [legendId, invalid, required],
  );

  return (
    <FieldsetContext value={value}>
      <fieldset
        {...props}
        id={id}
        data-slot="fieldset"
        data-invalid={hasError ? "" : undefined}
        aria-describedby={joinIds(describedBy, ariaDescribedBy)}
        className={cn(
          "flex min-w-0 flex-col gap-ds-gap-xs border-0 p-0 m-0",
          className,
        )}
      >
        <legend
          id={legendId}
          data-slot="legend"
          className={cn(textVariants({ variant: "label" }), "mb-ds-gap-xs p-0")}
        >
          {legend}
          {required ? <RequiredMarker /> : null}
        </legend>
        {hasDescription ? (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        ) : null}
        {children}
        {hasError ? <FieldError id={errorId}>{error}</FieldError> : null}
      </fieldset>
    </FieldsetContext>
  );
};
