"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext } from "./field";
import { checkboxClasses } from "./checkbox.styles";

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
        {/* Both icons are rendered; `data-state` picks one, so it also works uncontrolled (F14). */}
        <CheckIcon
          aria-hidden="true"
          className="size-3.5 group-data-[state=indeterminate]/checkbox:hidden"
        />
        <MinusIcon
          aria-hidden="true"
          className="hidden size-3.5 group-data-[state=indeterminate]/checkbox:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};
