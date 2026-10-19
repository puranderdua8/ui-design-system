import type * as React from "react";
import { cn } from "@/lib/utils";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SplitRatio = "1:1" | "1:2" | "2:1";
export type SplitAlign = "start" | "center" | "end" | "stretch";

/**
 * Recipes in theme.css. The columns sit side by side while each has at least
 * its share of `layout.item-min.md`, and stack once the container is narrower
 * than that. The decision uses the width the Split is given, not the viewport,
 * so it also holds inside a narrow sidebar, card or dialog.
 */
export const splitRatioClasses: Record<SplitRatio, string> = {
  "1:1": "ds-split",
  "1:2": "ds-split ds-split-1-2",
  "2:1": "ds-split ds-split-2-1",
};

export const splitAlignClasses: Record<SplitAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export type SplitElement = "div" | "section";

export type SplitProps = {
  /** Width ratio of the first to the second child. */
  ratio?: SplitRatio;
  /** Vertical alignment of the two columns. */
  align?: SplitAlign;
  gap?: LayoutGap;
} & AsProps<"div", Exclude<SplitElement, "div">>;

/** Two columns that stack when their container is too narrow. Pass exactly two children. */
export const Split = ({
  as = "div",
  ratio = "1:1",
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
        splitRatioClasses[ratio],
        splitAlignClasses[align],
        gapClasses[gap],
        className,
      )}
    />
  );
};
