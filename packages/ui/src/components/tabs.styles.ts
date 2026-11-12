// Plain module, no "use client": Server Components can call this (D-065, D-070).
// Underline tabs only. Every colour is a role the tone re-maps (text, text.muted,
// border.control, focus ring), so Tabs read on canvas, subtle, raised, inverse
// and brand surfaces without a prop.

export const tabsClasses =
  "group/tabs flex gap-ds-gap-sm data-[orientation=horizontal]:flex-col";

export const tabsListClasses =
  "inline-flex w-fit max-w-full items-center gap-ds-gap-xs " +
  "group-data-[orientation=horizontal]/tabs:flex-row group-data-[orientation=horizontal]/tabs:overflow-x-auto " +
  "group-data-[orientation=horizontal]/tabs:border-b group-data-[orientation=horizontal]/tabs:border-ds-border " +
  "group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch " +
  "group-data-[orientation=vertical]/tabs:border-e group-data-[orientation=vertical]/tabs:border-ds-border";

// min-h-ds-control-sm keeps every trigger at least 32px (target size, D-076).
// The active marker is a 2px `after` bar in border.control (3:1 on every tone).
export const tabsTriggerClasses =
  "relative inline-flex min-h-ds-control-sm shrink-0 items-center justify-center gap-ds-gap-xs px-ds-control-px-md " +
  "font-ds-body text-ds-control-md font-medium whitespace-nowrap text-ds-text-muted rounded-ds-control ds-transition ds-focus-ring " +
  "hover:text-ds-text data-[state=active]:text-ds-text " +
  "disabled:pointer-events-none disabled:text-ds-disabled-fg " +
  "after:absolute after:bg-ds-border-control after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100 " +
  "group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-px group-data-[orientation=horizontal]/tabs:after:h-0.5 " +
  "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start " +
  "group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-end-px group-data-[orientation=vertical]/tabs:after:w-0.5 " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// The panel is focusable when it has no focusable content (Radix sets tabindex
// 0), so it needs the same visible focus ring.
export const tabsContentClasses = "flex-1 ds-focus-ring rounded-ds-control";
