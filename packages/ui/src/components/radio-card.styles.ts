// Plain module, no "use client": Server Components can read this (D-065, H3).
// The selected state is a heavier border (the strong width) plus a check mark,
// so it never relies on colour alone. `Field`/`Fieldset` set aria-invalid on the
// group, so the card reads it from the `group` root, like RadioGroupItem (F13).
export const radioCardClasses =
  "group/card relative flex w-full flex-col items-stretch gap-ds-gap-sm rounded-ds-card bg-ds-input p-ds-gap-md text-start text-ds-text " +
  "ds-border border-ds-border-control ds-transition ds-focus-ring " +
  "hover:border-ds-input-border-hover " +
  "data-[state=checked]:ds-border-strong data-[state=checked]:border-ds-primary " +
  "aria-invalid:enabled:border-ds-danger-border group-aria-invalid:enabled:border-ds-danger-border " +
  "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg";

export const radioCardMediaClasses =
  "block overflow-hidden rounded-ds-control [&_img]:block [&_img]:w-full";

export const radioCardLabelClasses =
  "block font-ds-body text-ds-control-md font-ds-control";

export const radioCardDescriptionClasses =
  "block font-ds-body text-ds-caption text-ds-text-muted group-disabled/card:text-ds-disabled-fg";

// A check in the corner of the selected card. Shown only when checked.
export const radioCardCheckClasses =
  "absolute end-ds-gap-sm top-ds-gap-sm hidden size-ds-icon-md items-center justify-center rounded-full bg-ds-primary text-ds-primary-fg " +
  "group-data-[state=checked]/card:flex";
