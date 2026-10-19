import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";

export const linkVariants = cva(
  "rounded-ds-control text-ds-link hover:text-ds-link-hover transition-colors ds-focus-ring",
  {
    variants: {
      variant: {
        // Inside running text: the underline is the non-colour cue, always on.
        inline: "underline underline-offset-4 hover:decoration-2",
        // Stand-alone (nav, call-to-action rows): underline on hover and focus.
        standalone:
          "inline-flex items-center font-medium no-underline underline-offset-4 hover:underline focus-visible:underline",
      },
    },
    defaultVariants: { variant: "inline" },
  },
);

export type LinkProps = VariantProps<typeof linkVariants> &
  ElementProps<"a"> & {
    /** Render the child element (e.g. `next/link`) instead of an `<a>`, merging props onto it. */
    asChild?: boolean;
    /** Opens in a new tab: adds `target`, `rel`, an icon and a screen-reader hint. */
    external?: boolean;
  };

export const Link = ({
  variant,
  asChild = false,
  external = false,
  className,
  children,
  ...props
}: LinkProps) => {
  const Comp = asChild ? Slot.Root : "a";
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : undefined;

  return (
    <Comp
      {...(props as object)}
      {...externalProps}
      data-slot="link"
      data-variant={variant ?? "inline"}
      className={cn(linkVariants({ variant }), className)}
    >
      {/* Slottable lets asChild keep a single child while the icon is added beside its content. */}
      <Slot.Slottable>{children}</Slot.Slottable>
      {external ? (
        <>
          <ExternalLink
            aria-hidden="true"
            focusable="false"
            className="ml-1 inline-block size-4 align-text-bottom"
          />{" "}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : null}
    </Comp>
  );
};
