import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
    | ({ as?: "p" } & React.ComponentPropsWithRef<"p">)
    | ({ as: "span" } & React.ComponentPropsWithRef<"span">)
    | ({ as: "div" } & React.ComponentPropsWithRef<"div">)
    | ({ as: "label" } & React.ComponentPropsWithRef<"label">)
  );

// `forwardRef` (not ref-as-prop) because peerDependencies allow React 18.
// The cast restores the per-element ref typing of `TextProps`.
export const Text = React.forwardRef<HTMLElement, Record<string, unknown>>(
  function Text({ as = "p", variant, className, ...props }, ref) {
    const Comp = as as React.ElementType;
    return (
      <Comp
        {...props}
        ref={ref}
        data-slot="text"
        className={cn(
          textVariants({ variant: variant as TextStyleProps["variant"] }),
          className as string | undefined,
        )}
      />
    );
  },
) as unknown as (props: TextProps) => React.ReactElement | null;
(Text as { displayName?: string }).displayName = "Text";
