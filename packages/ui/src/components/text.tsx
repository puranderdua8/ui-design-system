import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const textVariants = cva("text-ds-text", {
  variants: {
    variant: {
      body: "ds-type-body",
      lead: "ds-type-lead",
      caption: "ds-type-caption text-ds-text-muted",
      label: "ds-type-label",
    },
  },
  defaultVariants: { variant: "body" },
});

export type TextElement = "p" | "span" | "div" | "label";

export type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    /** HTML element to render. Independent of `variant`. */
    as?: TextElement;
    /** Only meaningful when `as="label"`. */
    htmlFor?: string;
  };

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Comp = "p", variant, className, ...props }, ref) => {
    return React.createElement(Comp, {
      ref,
      className: cn(textVariants({ variant }), className),
      ...props,
    });
  },
);
Text.displayName = "Text";
