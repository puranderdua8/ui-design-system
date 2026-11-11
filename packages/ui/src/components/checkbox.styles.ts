// Plain module, no "use client": Server Components can read this (D-065, H3).
export const checkboxClasses =
  "peer group/checkbox inline-flex size-4 shrink-0 items-center justify-center rounded-ds-control ds-border border-ds-border-control bg-ds-input text-ds-primary-fg ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=checked]:border-ds-primary data-[state=checked]:bg-ds-primary " +
  "data-[state=indeterminate]:border-ds-primary data-[state=indeterminate]:bg-ds-primary " +
  "aria-invalid:enabled:border-ds-danger-border " +
  "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg";
