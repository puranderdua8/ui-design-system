import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, listRole, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type StackAlign = "start" | "center" | "end" | "stretch";

export const stackAlignClasses: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export type StackElement = "div" | "section" | "ul" | "ol" | "nav" | "article";

export type StackProps = {
  gap?: LayoutGap;
  /** Cross-axis (horizontal) alignment of the children. */
  align?: StackAlign;
} & AsProps<"div", Exclude<StackElement, "div">>;

export const Stack = ({
  as = "div",
  gap = "md",
  align = "stretch",
  className,
  ...props
}: StackProps) => {
  return renderAs(as, {
    role: listRole(as),
    ...props,
    "data-slot": "stack",
    className: cn(
      "flex flex-col",
      gapClasses[gap],
      stackAlignClasses[align],
      className,
    ),
  });
};
