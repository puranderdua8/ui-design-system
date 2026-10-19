"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { useFieldContext } from "./field";

export const inputVariants = cva(
  "block w-full min-w-0 ds-border bg-ds-input font-ds-body text-ds-text rounded-ds-control ds-transition ds-focus-ring " +
    "border-ds-input-border hover:border-ds-input-border-hover placeholder:text-ds-placeholder " +
    "aria-invalid:border-ds-danger-border " +
    "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg disabled:placeholder:text-ds-disabled-fg",
  {
    variants: {
      size: {
        sm: "h-ds-control-sm px-ds-control-px-sm text-ds-control-sm",
        md: "h-ds-control-md px-ds-control-px-md text-ds-control-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);

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
