"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext, useFieldControlProps } from "./field";
import { useFieldsetContext } from "./fieldset";
import { radioGroupItemClasses } from "./radio-group.styles";

export type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & { ref?: StrictRef<HTMLDivElement> };

/**
 * Group of radios. Put it in a `Fieldset`: the legend names it and the
 * Fieldset's invalid and required state reach it. A `Field` is for one control,
 * so a RadioGroup inside one still works but warns in development (its label
 * would point at a `div`, which a `<label>` cannot label).
 */
export const RadioGroup = ({
  id,
  required,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: RadioGroupProps) => {
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const wrongParent = field != null && fieldset == null;
  // The Field's wiring. Inside a Fieldset the group takes the Fieldset's state
  // instead (its own description and error sit on the `<fieldset>`).
  const control = useFieldControlProps({
    id,
    required,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  });
  const fieldsetInvalid = fieldset?.invalid ? true : undefined;

  React.useEffect(() => {
    if (wrongParent && process.env.NODE_ENV !== "production") {
      console.warn(
        "@puranderdua/ui: RadioGroup is inside a Field. A Field labels one control; use a Fieldset (legend, description, error) for a group of radios.",
      );
    }
  }, [wrongParent]);

  const groupProps =
    fieldset == null
      ? control
      : {
          id,
          required: required ?? fieldset.required,
          "aria-invalid": ariaInvalid ?? fieldsetInvalid,
          "aria-describedby": ariaDescribedBy,
        };

  return (
    <RadioGroupPrimitive.Root
      {...props}
      {...groupProps}
      aria-labelledby={ariaLabelledBy ?? fieldset?.legendId ?? field?.labelId}
      data-slot="radio-group"
      className={cn("group grid gap-ds-gap-sm", className)}
    />
  );
};

export type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & { ref?: StrictRef<HTMLButtonElement> };

export const RadioGroupItem = ({
  className,
  ...props
}: RadioGroupItemProps) => (
  <RadioGroupPrimitive.Item
    {...props}
    data-slot="radio-group-item"
    className={cn(radioGroupItemClasses, className)}
  >
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="flex items-center justify-center"
    >
      <CircleIcon aria-hidden="true" className="size-2 fill-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
