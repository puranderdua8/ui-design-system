/** Gap steps shared by the layout components (`layout.gap.*` tokens). Static map, never built from strings. */
export type LayoutGap = "xs" | "sm" | "md" | "lg" | "xl";

export const gapClasses: Record<LayoutGap, string> = {
  xs: "gap-ds-gap-xs",
  sm: "gap-ds-gap-sm",
  md: "gap-ds-gap-md",
  lg: "gap-ds-gap-lg",
  xl: "gap-ds-gap-xl",
};
