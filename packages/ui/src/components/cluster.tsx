import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, listRole, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type ClusterJustify = "start" | "center" | "end" | "between";
export type ClusterAlign = "start" | "center" | "end" | "baseline" | "stretch";

export const clusterJustifyClasses: Record<ClusterJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const clusterAlignClasses: Record<ClusterAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
  stretch: "items-stretch",
};

export type ClusterElement = "div" | "ul" | "ol" | "nav";

export type ClusterProps = {
  gap?: LayoutGap;
  /** Main-axis (horizontal) distribution. */
  justify?: ClusterJustify;
  /** Cross-axis (vertical) alignment within a row. */
  align?: ClusterAlign;
} & AsProps<"div", Exclude<ClusterElement, "div">>;

export const Cluster = ({
  as = "div",
  gap = "md",
  justify = "start",
  align = "center",
  className,
  ...props
}: ClusterProps) => {
  return renderAs(as, {
    role: listRole(as),
    ...props,
    "data-slot": "cluster",
    className: cn(
      "flex flex-wrap",
      gapClasses[gap],
      clusterJustifyClasses[justify],
      clusterAlignClasses[align],
      className,
    ),
  });
};
