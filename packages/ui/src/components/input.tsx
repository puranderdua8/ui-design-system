"use client";

import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { useFieldContext } from "./field";
import { inputVariants } from "./input.styles";

export type InputProps = VariantProps<typeof inputVariants> &
  Omit<ElementProps<"input">, "size">;

/** Text input. Inside a `Field` it takes the id, description, error and required wiring. */
export const Input = ({
  size,
  type = "text",
  id,
  required,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) => {
  const field = useFieldContext();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  return (
    <input
      {...props}
      type={type}
      id={id ?? field?.controlId}
      required={required ?? field?.required}
      aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
      aria-describedby={describedBy}
      data-slot="input"
      data-size={size ?? "md"}
      className={cn(inputVariants({ size }), className)}
    />
  );
};
