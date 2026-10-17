import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const headingVariants = cva("text-ds-text", {
  variants: {
    variant: {
      display: "ds-type-display",
      h1: "ds-type-h1",
      h2: "ds-type-h2",
      h3: "ds-type-h3",
    },
  },
  defaultVariants: { variant: "h1" },
});

export type HeadingVariant = NonNullable<
  VariantProps<typeof headingVariants>["variant"]
>;
export type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Default element per variant. Static map, never built from strings. */
export const headingDefaultElement: Record<HeadingVariant, HeadingElement> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

export type HeadingProps = Omit<
  React.ComponentPropsWithRef<"h1">,
  "as" | "variant"
> &
  VariantProps<typeof headingVariants> & {
    /** HTML heading level. Independent of `variant`; derived from it if omitted. */
    as?: HeadingElement;
  };

// `forwardRef` because peerDependencies allow React 18.
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as, variant, className, ...props }, ref) => {
    const resolved: HeadingVariant = variant ?? "h1";
    const Comp = as ?? headingDefaultElement[resolved];
    return (
      <Comp
        {...props}
        ref={ref}
        data-slot="heading"
        className={cn(headingVariants({ variant: resolved }), className)}
      />
    );
  },
);
Heading.displayName = "Heading";
