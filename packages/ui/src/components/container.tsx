import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import type { AsProps } from "@/lib/types";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

/** Max width from the `layout.container.*` tokens. `full` removes the cap. */
export const containerSizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-ds-sm",
  md: "max-w-ds-md",
  lg: "max-w-ds-lg",
  xl: "max-w-ds-xl",
  full: "max-w-none",
};

export type ContainerElement =
  "div" | "section" | "main" | "article" | "header" | "footer";

export type ContainerProps = {
  size?: ContainerSize;
} & AsProps<"div", Exclude<ContainerElement, "div">>;

export const Container = ({
  as = "div",
  size = "lg",
  className,
  ...props
}: ContainerProps) => {
  return renderAs(as, {
    ...props,
    "data-slot": "container",
    className: cn(
      "mx-auto w-full px-ds-gutter",
      containerSizeClasses[size],
      className,
    ),
  });
};
