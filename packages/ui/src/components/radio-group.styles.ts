// Plain module, no "use client": Server Components can read this (D-065, H3).
// `Field` sets aria-invalid on the group, so the item reads it from the `group` root (F13).
export const radioGroupItemClasses =
  "peer inline-flex aspect-square size-4 shrink-0 items-center justify-center rounded-full ds-border border-ds-border-control bg-ds-input text-ds-primary ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=checked]:border-ds-primary " +
  "aria-invalid:enabled:border-ds-danger-border group-aria-invalid:enabled:border-ds-danger-border " +
  "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg";
