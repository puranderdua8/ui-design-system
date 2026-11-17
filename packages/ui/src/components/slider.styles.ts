// Plain module, no "use client": Server Components can read this (D-065, H3).
// The root is a 32px row, so the whole row is the pointer target; each thumb
// also gets `.ds-hit-area` so it is at least 24px (D-076).
export const sliderClasses =
  "relative flex h-ds-control-sm w-full touch-none items-center select-none " +
  "data-[disabled]:cursor-not-allowed";

// The track is border.control (3:1 on every surface); the filled part is the
// brand action colour. Both are roles the tone re-maps.
export const sliderTrackClasses =
  "relative h-ds-gap-xs w-full grow overflow-hidden rounded-ds-pill bg-ds-border-control " +
  "data-[disabled]:bg-ds-disabled-border";

export const sliderRangeClasses =
  "absolute h-full bg-ds-primary data-[disabled]:bg-ds-disabled-fg";

// The thumb keeps its own border, so it still shows in forced-colours mode.
export const sliderThumbClasses =
  "block ds-hit-area size-ds-icon-md shrink-0 rounded-full ds-border-strong border-ds-primary bg-ds-input ds-transition ds-focus-ring " +
  "hover:border-ds-primary-hover " +
  "data-[disabled]:cursor-not-allowed data-[disabled]:border-ds-disabled-border data-[disabled]:bg-ds-disabled";

export const sliderValueClasses =
  "font-ds-body text-ds-control-md text-ds-text-muted tabular-nums";

export const sliderWrapperClasses = "flex flex-col gap-ds-gap-xs";
