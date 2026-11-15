"use client";

import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { useFieldControlProps } from "./field";
import { inputVariants } from "./input.styles";

export type InputSize = NonNullable<VariantProps<typeof inputVariants>["size"]>;

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
  const control = useFieldControlProps({
    id,
    required,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <input
      {...props}
      {...control}
      type={type}
      data-slot="input"
      data-size={size ?? "md"}
      className={cn(inputVariants({ size }), className)}
    />
  );
};
