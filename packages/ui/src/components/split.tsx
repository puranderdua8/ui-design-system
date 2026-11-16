import { Children } from "react";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { warnOnce } from "@/lib/deprecate";
import {
  alignClasses,
  gapClasses,
  type LayoutAlign,
  type LayoutGap,
} from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SplitRatio = "1:1" | "1:2" | "2:1";
export type SplitAlign = LayoutAlign;

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
  const count = Children.toArray(props.children).length;
  if (count !== 2)
    warnOnce(
      "Split.children",
      `<Split> expects exactly two children but got ${count} (a fragment counts as one). Wrap extra content in an element, or use Stack or Grid.`,
    );
  return renderAs(as, {
    ...props,
    "data-slot": "split",
    className: cn(
      splitRatioClasses[ratio],
      alignClasses[align],
      gapClasses[gap],
      className,
    ),
  });
};
