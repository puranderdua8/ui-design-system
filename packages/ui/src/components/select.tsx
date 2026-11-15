"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext, useFieldControlProps } from "./field";
import { selectTriggerVariants } from "./select.styles";
import { ScopedPortal } from "./theme-scope";

export type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>;

/** Select root. Inside a `Field` it takes `required` from the Field. */
export const Select = ({ required, ...props }: SelectProps) => {
  const field = useFieldContext();
  return (
    <SelectPrimitive.Root required={required ?? field?.required} {...props} />
  );
};

export type SelectGroupProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Group
> & { ref?: StrictRef<HTMLDivElement> };

export const SelectGroup = (props: SelectGroupProps) => (
  <SelectPrimitive.Group {...props} data-slot="select-group" />
);

export type SelectValueProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Value
> & { ref?: StrictRef<HTMLSpanElement> };

export const SelectValue = (props: SelectValueProps) => (
  <SelectPrimitive.Value {...props} data-slot="select-value" />
);

export type SelectTriggerSize = NonNullable<
  VariantProps<typeof selectTriggerVariants>["size"]
>;

export type SelectTriggerProps = VariantProps<typeof selectTriggerVariants> &
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    ref?: StrictRef<HTMLButtonElement>;
  };

/** The button that opens the list. Inside a `Field` it takes the id, description and error wiring. */
export const SelectTrigger = ({
  size,
  id,
  className,
  children,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectTriggerProps) => {
  // `required` belongs to the Select root, which reads it from the Field.
  const control = useFieldControlProps({
    id,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  });

  return (
    <SelectPrimitive.Trigger
      {...props}
      id={control.id}
      aria-invalid={control["aria-invalid"]}
      aria-describedby={control["aria-describedby"]}
      data-slot="select-trigger"
      data-size={size ?? "md"}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-ds-icon-md text-ds-text-muted"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

export type SelectContentProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> & {
  /**
   * Element the list is portalled into. Defaults to `document.body`, where the
   * nearest `ThemeScope`'s theme and direction are re-applied (`ScopedPortal`,
   * D-091); an explicit value wins.
   */
  container?: HTMLElement | null;
  ref?: StrictRef<HTMLDivElement>;
};

export const SelectContent = ({
  className,
  children,
  container,
  position = "popper",
  align = "center",
  ...props
}: SelectContentProps) => (
  <ScopedPortal asChild container={container}>
    <SelectPrimitive.Content
      {...props}
      data-slot="select-content"
      position={position}
      align={align}
      className={cn(
        "relative ds-layer-dropdown max-h-(--radix-select-content-available-height) min-w-ds-menu origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto ds-border border-ds-border bg-ds-surface-raised font-ds-body text-ds-text shadow-ds-overlay rounded-ds-control",
        position === "popper" &&
          "data-[side=bottom]:translate-y-ds-menu-offset data-[side=left]:-translate-x-ds-menu-offset data-[side=right]:translate-x-ds-menu-offset data-[side=top]:-translate-y-ds-menu-offset",
        className,
      )}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-ds-menu",
          position === "popper" &&
            "w-full min-w-(--radix-select-trigger-width) scroll-my-ds-menu",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </ScopedPortal>
);

export type SelectLabelProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Label
> & { ref?: StrictRef<HTMLDivElement> };

/** Heading for a `SelectGroup`. */
export const SelectLabel = ({ className, ...props }: SelectLabelProps) => (
  <SelectPrimitive.Label
    {...props}
    data-slot="select-label"
    className={cn(
      "px-ds-menu-item-x py-ds-menu-item-y text-ds-control-sm text-ds-text-muted",
      className,
    )}
  />
);

export type SelectItemProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> & { ref?: StrictRef<HTMLDivElement> };

export const SelectItem = ({
  className,
  children,
  ...props
}: SelectItemProps) => (
  <SelectPrimitive.Item
    {...props}
    data-slot="select-item"
    className={cn(
      // The highlighted option is a solid fill (menu.highlight-*, 3:1 against the
      // list and 4.5:1 for its text; R35). Forced colours drop the fill, so the
      // same option also gets an outline, which they keep (R19).
      "relative flex w-full cursor-default items-center gap-ds-gap-xs rounded-ds-control py-ds-menu-item-y ps-ds-menu-item-x pe-ds-menu-item-end text-ds-control-md outline-none select-none ds-transition " +
        "data-[highlighted]:bg-ds-menu-highlight data-[highlighted]:text-ds-menu-highlight-fg " +
        "forced-colors:data-[highlighted]:outline-solid forced-colors:data-[highlighted]:outline-2 forced-colors:data-[highlighted]:-outline-offset-2 " +
        "data-[disabled]:pointer-events-none data-[disabled]:text-ds-disabled-fg " +
        // A div has no UA disabled styling, so forced colours would paint it like
        // an enabled option. GrayText is the OS palette, not a design decision.
        "forced-colors:data-[disabled]:text-[GrayText] " +
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      className,
    )}
  >
    <span
      data-slot="select-item-indicator"
      className="absolute end-ds-menu-item-x flex size-ds-icon-md items-center justify-center"
    >
      <SelectPrimitive.ItemIndicator>
        <CheckIcon aria-hidden="true" className="size-ds-icon-md" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

export type SelectSeparatorProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Separator
> & { ref?: StrictRef<HTMLDivElement> };

export const SelectSeparator = ({
  className,
  ...props
}: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    {...props}
    data-slot="select-separator"
    className={cn(
      "pointer-events-none -mx-ds-menu my-ds-menu-offset h-px bg-ds-border",
      className,
    )}
  />
);

// Rendered by `SelectContent`; not part of the public API (R09).
type SelectScrollButtonProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.ScrollUpButton
> & { ref?: StrictRef<HTMLDivElement> };

const SelectScrollUpButton = ({
  className,
  ...props
}: SelectScrollButtonProps) => (
  <SelectPrimitive.ScrollUpButton
    {...props}
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-ds-menu text-ds-text-muted",
      className,
    )}
  >
    <ChevronUpIcon aria-hidden="true" className="size-ds-icon-md" />
  </SelectPrimitive.ScrollUpButton>
);

const SelectScrollDownButton = ({
  className,
  ...props
}: SelectScrollButtonProps) => (
  <SelectPrimitive.ScrollDownButton
    {...props}
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-ds-menu text-ds-text-muted",
      className,
    )}
  >
    <ChevronDownIcon aria-hidden="true" className="size-ds-icon-md" />
  </SelectPrimitive.ScrollDownButton>
);
