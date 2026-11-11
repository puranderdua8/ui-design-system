"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { Text, textVariants } from "./text";

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
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const hasDescription =
    description != null && description !== false && description !== "";
  const hasError = error != null && error !== false && error !== "";

  const describedBy =
    [
      hasDescription ? descriptionId : null,
      hasError ? errorId : null,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const value = React.useMemo(
    () => ({ legendId, invalid: hasError, required }),
    [legendId, hasError, required],
  );

  return (
    <FieldsetContext value={value}>
      <fieldset
        {...props}
        id={id}
        data-slot="fieldset"
        data-invalid={hasError ? "" : undefined}
        aria-describedby={describedBy}
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
          {required ? (
            // Decorative, like the Label marker: `required` on the controls is announced.
            <span aria-hidden="true" className="ms-1 text-ds-danger-fg">
              *
            </span>
          ) : null}
        </legend>
        {hasDescription ? (
          <Text as="p" variant="caption" id={descriptionId}>
            {description}
          </Text>
        ) : null}
        {children}
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
      </fieldset>
    </FieldsetContext>
  );
};
