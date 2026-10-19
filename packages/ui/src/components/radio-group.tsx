"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext } from "./field";

export type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & { ref?: StrictRef<HTMLDivElement> };

/** Group of radios. Inside a `Field` it is named by the Field's label. */
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
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  return (
    <RadioGroupPrimitive.Root
      {...props}
      id={id ?? field?.controlId}
      required={required ?? field?.required}
      aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
      aria-describedby={describedBy}
      aria-labelledby={ariaLabelledBy ?? field?.labelId}
      data-slot="radio-group"
      className={cn("grid gap-ds-gap-sm", className)}
    />
  );
};

export const radioGroupItemClasses =
  "peer inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full ds-border border-ds-border-control bg-ds-input text-ds-primary ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=checked]:border-ds-primary " +
  "aria-invalid:border-ds-danger-border " +
  "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg";

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
