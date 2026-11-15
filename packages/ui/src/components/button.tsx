import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { controlSizeClasses } from "@/lib/control";
import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";

const base =
  "inline-flex shrink-0 items-center justify-center gap-ds-control-gap whitespace-nowrap ds-border font-ds-body font-ds-control rounded-ds-control ds-transition ds-focus-ring " +
  "disabled:pointer-events-none disabled:border-ds-disabled-border disabled:bg-ds-disabled disabled:text-ds-disabled-fg " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0";

export const buttonVariants = cva(base, {
  variants: {
    variant: {
      primary:
        "border-transparent bg-ds-primary text-ds-primary-fg hover:bg-ds-primary-hover active:bg-ds-primary-active",
      secondary:
        "border-ds-secondary-border bg-ds-secondary text-ds-secondary-fg hover:bg-ds-secondary-hover active:bg-ds-secondary-active",
    },
    size: controlSizeClasses,
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>;

export type ButtonProps = VariantProps<typeof buttonVariants> &
  ElementProps<"button"> & {
    /** Render the child element instead of a `<button>`, merging props onto it. */
    asChild?: boolean;
  };

export const Button = ({
  variant,
  size,
  asChild = false,
  type,
  className,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      // Default `type="button"` only on a real <button>; asChild may be a link.
      type={asChild ? type : (type ?? "button")}
      {...props}
      data-slot="button"
      data-variant={variant ?? "primary"}
      data-size={size ?? "md"}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  );
};
