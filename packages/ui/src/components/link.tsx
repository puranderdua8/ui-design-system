import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";

export const linkVariants = cva(
  "rounded-ds-control text-ds-link hover:text-ds-link-hover ds-transition ds-focus-ring",
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
  // Keep a caller's rel tokens (e.g. nofollow) next to the ones a new tab needs.
  const rel = external
    ? [
        ...new Set([
          ...(props.rel?.split(/\s+/).filter(Boolean) ?? []),
          "noopener",
          "noreferrer",
        ]),
      ].join(" ")
    : props.rel;

  return (
    <Comp
      {...(props as object)}
      {...(external ? { target: "_blank" } : undefined)}
      rel={rel}
      data-slot="link"
      data-variant={variant ?? "inline"}
      className={cn(linkVariants({ variant }), className)}
    >
      {/* Slottable lets asChild keep a single child while the icon is added beside its content. */}
      <Slot.Slottable>{children}</Slot.Slottable>
      {external ? (
        <>
          {/* The space sits before the icon so the underline does not trail past it. */}{" "}
          <ExternalLink
            aria-hidden="true"
            focusable="false"
            className="inline-block size-4 align-text-bottom"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : null}
    </Comp>
  );
};
