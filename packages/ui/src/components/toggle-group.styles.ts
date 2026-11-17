// Plain module, no "use client": Server Components can read this (D-065, H3).
// A pressed item is a filled primary surface plus a heavier border (the strong
// width, via the `.ds-border-selected` recipe), so the state never relies on
// colour alone. Forced colours drop the fill but keep the border and add an
// outline. Every colour is a role the tone re-maps.
export const toggleGroupClasses =
  "inline-flex w-fit max-w-full flex-wrap gap-ds-gap-xs";

export const toggleGroupItemClasses =
  "inline-flex min-h-ds-control-md shrink-0 items-center justify-center gap-ds-control-gap px-ds-control-px-md " +
  "ds-border ds-border-selected border-ds-border-control bg-ds-input font-ds-body text-ds-control-md font-ds-control text-ds-text rounded-ds-control whitespace-nowrap ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=on]:border-ds-primary data-[state=on]:bg-ds-primary data-[state=on]:text-ds-primary-fg " +
  "forced-colors:data-[state=on]:outline-solid forced-colors:data-[state=on]:outline-2 forced-colors:data-[state=on]:-outline-offset-2 " +
  "disabled:pointer-events-none disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-ds-icon-md";
