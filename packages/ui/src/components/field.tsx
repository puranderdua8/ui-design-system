"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { FieldDescription, FieldError } from "./field-parts";
import { describeMessages, joinIds } from "./field.styles";
import { Label } from "./label";

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

/** The props a form control takes from its `Field`. */
export type FieldControlProps = {
  id?: string | undefined;
  required?: boolean | undefined;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string | undefined;
};

/**
 * Resolves a control's wiring: the props it was given, merged with its `Field`
 * (R12). Inside a Field one id wins everywhere: the Field's. A control's own
 * `id` is ignored there, with a development warning, because the label,
 * description and error all point at the Field's id (R06). `required` and
 * `aria-invalid` fall back to the Field's, and `aria-describedby` is merged.
 * Outside a Field the props pass through unchanged.
 */
export const useFieldControlProps = ({
  id,
  required,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: FieldControlProps): FieldControlProps => {
  const field = useFieldContext();
  const conflict = field != null && id != null && id !== field.controlId;

  React.useEffect(() => {
    if (conflict && process.env.NODE_ENV !== "production") {
      console.warn(
        `@puranderdua/ui: a control inside a Field has its own id="${id}", which is ignored. The Field's label, description and error use the Field's id; set it with <Field id="${id}"> instead.`,
      );
    }
  }, [conflict, id]);

  const fieldInvalid = field?.invalid ? true : undefined;
  return {
    id: field?.controlId ?? id,
    required: required ?? field?.required,
    "aria-invalid": ariaInvalid ?? fieldInvalid,
    "aria-describedby": joinIds(field?.describedBy, ariaDescribedBy),
  };
};

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
  /**
   * The id of the control inside (otherwise generated with `useId`), not of the
   * wrapping `div`: the label's `htmlFor` and the description and error ids
   * derive from it. A control's own `id` is ignored inside a Field (R06). On
   * `Fieldset`, `id` is the `<fieldset>`'s own id.
   */
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
  const { hasDescription, hasError, descriptionId, errorId, describedBy } =
    describeMessages(controlId, description, error);

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
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        ) : null}
        {hasError ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    </FieldContext>
  );
};
