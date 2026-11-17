// Plain module, no "use client": Server Components can read this (D-065, H3).
// The scrim is the overlay.scrim role on the overlay layer; the panel is a raised
// surface on the modal layer, so it sits above the scrim. Layers are recipes
// (`ds-layer-*`), never a raw z-index (D-075).
export const alertDialogOverlayClasses =
  "fixed inset-0 ds-layer-overlay bg-ds-scrim";

// `inset-0 m-auto h-fit` centres the panel without a translate, so it follows
// the text direction and needs no arbitrary values.
export const alertDialogContentClasses =
  "fixed inset-0 m-auto ds-layer-modal flex h-fit max-h-full w-full max-w-ds-sm flex-col gap-ds-gap-md overflow-y-auto " +
  "ds-border border-ds-border bg-ds-surface-raised p-ds-gap-lg font-ds-body text-ds-text shadow-ds-overlay rounded-ds-card";

export const alertDialogHeaderClasses = "flex flex-col gap-ds-gap-xs";

export const alertDialogTitleClasses = "ds-type-h3 text-ds-text";

export const alertDialogDescriptionClasses = "ds-type-body text-ds-text-muted";

export const alertDialogFooterClasses =
  "flex flex-wrap items-center justify-end gap-ds-gap-sm";
