import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";

export const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-ds-text ds-type-body",
      lead: "text-ds-text ds-type-lead",
      caption: "text-ds-text-muted ds-type-caption",
      label: "text-ds-text ds-type-label",
    },
  },
  defaultVariants: { variant: "body" },
});

export type TextElement = "p" | "span" | "div" | "label";

type TextStyleProps = VariantProps<typeof textVariants>;

/**
 * Element-specific props and ref type per `as`. `htmlFor` only exists on
 * `as="label"`; `ref` is typed to the chosen element.
 */
export type TextProps = TextStyleProps &
  (
    | ({ as?: "p" } & ElementProps<"p">)
    | ({ as: "span" } & ElementProps<"span">)
    | ({ as: "div" } & ElementProps<"div">)
    | ({ as: "label" } & ElementProps<"label">)
  );

export const Text = ({ as = "p", variant, className, ...props }: TextProps) => {
  // Widened internally for the dynamic tag; the public `TextProps` union
  // enforces the per-element props and ref type at the call site.
  const Comp: React.ElementType = as;
  return (
    <Comp
      {...(props as object)}
      data-slot="text"
      className={cn(textVariants({ variant }), className)}
    />
  );
};
