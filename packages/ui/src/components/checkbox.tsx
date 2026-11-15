"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldControlProps } from "./field";
import { checkboxClasses } from "./checkbox.styles";

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & { ref?: StrictRef<HTMLButtonElement> };

/** Checkbox. Inside a `Field` it takes the id, description, error and required wiring. */
export const Checkbox = ({
  id,
  required,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) => {
  const control = useFieldControlProps({
    id,
    required,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <CheckboxPrimitive.Root
      {...props}
      {...control}
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
