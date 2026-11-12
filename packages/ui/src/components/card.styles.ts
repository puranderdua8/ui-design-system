import { cva, type VariantProps } from "class-variance-authority";

// Plain module, no "use client": Server Components can call this (D-065, D-070).
// `raised` uses the .ds-tone-raised recipe, so the card restores the base roles
// (text, links, focus ring, actions) even inside an inverse or brand Section.
// `outline` paints nothing and follows the tone around it.
export const cardVariants = cva(
  "flex flex-col gap-ds-gap-md rounded-ds-card py-ds-gap-md",
  {
    variants: {
      variant: {
        outline: "ds-border border-ds-border",
        raised: "ds-tone-raised ds-border border-ds-border shadow-ds-raised",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export type CardVariant = NonNullable<
  VariantProps<typeof cardVariants>["variant"]
>;

export const cardMediaClasses =
  "overflow-hidden first:-mt-ds-gap-md first:rounded-t-ds-card last:-mb-ds-gap-md last:rounded-b-ds-card";
export const cardHeaderClasses = "flex flex-col gap-ds-gap-xs px-ds-gap-md";
export const cardContentClasses = "px-ds-gap-md";
export const cardFooterClasses =
  "flex flex-wrap items-center gap-ds-gap-sm px-ds-gap-md";
