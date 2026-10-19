/** Gap steps shared by the layout components (`layout.gap.*` tokens). Static map, never built from strings. */
export type LayoutGap = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * `list-style: none` (Tailwind's reset) makes Safari + VoiceOver stop announcing
 * a list, so `ul`/`ol` get an explicit role. A caller's `role` still wins.
 */
export const listRole = (as: string): "list" | undefined =>
  as === "ul" || as === "ol" ? "list" : undefined;

export const gapClasses: Record<LayoutGap, string> = {
  xs: "gap-ds-gap-xs",
  sm: "gap-ds-gap-sm",
  md: "gap-ds-gap-md",
  lg: "gap-ds-gap-lg",
  xl: "gap-ds-gap-xl",
};
