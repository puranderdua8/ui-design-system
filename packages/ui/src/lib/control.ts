/**
 * Height, padding and text size of a control (`size` = sm | md). One map for
 * Button, Input and SelectTrigger (R12). Static strings, never built from parts.
 */
export const controlSizeClasses = {
  sm: "h-ds-control-sm px-ds-control-px-sm text-ds-control-sm",
  md: "h-ds-control-md px-ds-control-px-md text-ds-control-md",
} as const;
