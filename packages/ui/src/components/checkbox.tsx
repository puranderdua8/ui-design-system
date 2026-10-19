"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext } from "./field";

export const checkboxClasses =
  "peer inline-flex size-4 shrink-0 items-center justify-center rounded-ds-control ds-border border-ds-border-control bg-ds-input text-ds-primary-fg ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=checked]:border-ds-primary data-[state=checked]:bg-ds-primary " +
  "data-[state=indeterminate]:border-ds-primary data-[state=indeterminate]:bg-ds-primary " +
  "aria-invalid:border-ds-danger-border " +
  "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg";

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & { ref?: StrictRef<HTMLButtonElement> };

/** Checkbox. Inside a `Field` it takes the id, description, error and required wiring. */
export const Checkbox = ({
  id,
  required,
  className,
  checked,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) => {
  const field = useFieldContext();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  return (
    <CheckboxPrimitive.Root
      {...props}
      checked={checked}
      id={id ?? field?.controlId}
      required={required ?? field?.required}
      aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
      aria-describedby={describedBy}
      data-slot="checkbox"
      className={cn(checkboxClasses, className)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {checked === "indeterminate" ? (
          <MinusIcon aria-hidden="true" className="size-3.5" />
        ) : (
          <CheckIcon aria-hidden="true" className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};
