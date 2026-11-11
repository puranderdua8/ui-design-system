import { cva } from "class-variance-authority";

// Plain module, no "use client": Server Components can call this (D-065, H3).
export const selectTriggerVariants = cva(
  "flex w-full min-w-0 items-center justify-between gap-ds-gap-xs ds-border bg-ds-input font-ds-body text-ds-text rounded-ds-control whitespace-nowrap ds-transition ds-focus-ring " +
    "border-ds-input-border hover:border-ds-input-border-hover " +
    "data-[placeholder]:text-ds-placeholder " +
    "aria-invalid:enabled:border-ds-danger-border " +
    "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg " +
    "*:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-ds-control-sm px-ds-control-px-sm text-ds-control-sm",
        md: "h-ds-control-md px-ds-control-px-md text-ds-control-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);
