import { cva } from "class-variance-authority";

// Plain module, no "use client": Server Components can call these (D-065, H3).
// `aria-invalid:enabled:` keeps a disabled control's disabled border (F28).
export const inputVariants = cva(
  "block w-full min-w-0 ds-border bg-ds-input font-ds-body text-ds-text rounded-ds-control ds-transition ds-focus-ring " +
    "border-ds-input-border hover:border-ds-input-border-hover placeholder:text-ds-placeholder " +
    "aria-invalid:enabled:border-ds-danger-border " +
    "disabled:cursor-not-allowed disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg disabled:placeholder:text-ds-disabled-fg",
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
