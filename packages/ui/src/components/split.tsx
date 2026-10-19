import type * as React from "react";
import { cn } from "@/lib/utils";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SplitRatio = "1:1" | "1:2" | "2:1";
export type SplitAlign = "start" | "center" | "end" | "stretch";

/**
 * One column under `md`. From `md` up the 1:2 and 2:1 ratios use three tracks
 * and span the wider child over two of them.
 */
export const splitRatioClasses: Record<SplitRatio, string> = {
  "1:1": "grid-cols-1 md:grid-cols-2",
  "1:2":
    "grid-cols-1 md:grid-cols-3 md:[&>:first-child]:col-span-1 md:[&>:last-child]:col-span-2",
  "2:1":
    "grid-cols-1 md:grid-cols-3 md:[&>:first-child]:col-span-2 md:[&>:last-child]:col-span-1",
};

export const splitAlignClasses: Record<SplitAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

/** Swaps the two columns from `md` up; the stacked order stays the DOM order. */
export const splitReverseClasses =
  "md:[&>:first-child]:order-2 md:[&>:last-child]:order-1";

export type SplitElement = "div" | "section";

export type SplitProps = {
  /** Width ratio of the first to the second child (DOM order, before `reverse`). */
  ratio?: SplitRatio;
  /** Show the second child first from `md` up. */
  reverse?: boolean;
  /** Vertical alignment of the two columns. */
  align?: SplitAlign;
  gap?: LayoutGap;
} & AsProps<"div", Exclude<SplitElement, "div">>;

/** Two columns that stack under `md`. Pass exactly two children. */
export const Split = ({
  as = "div",
  ratio = "1:1",
  reverse = false,
  align = "stretch",
  gap = "lg",
  className,
  ...props
}: SplitProps) => {
  const Comp: React.ElementType = as;
  return (
    <Comp
      {...(props as object)}
      data-slot="split"
      className={cn(
        "grid",
        splitRatioClasses[ratio],
        splitAlignClasses[align],
        gapClasses[gap],
        reverse && splitReverseClasses,
        className,
      )}
    />
  );
};
