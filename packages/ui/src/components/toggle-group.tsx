"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import {
  toggleGroupClasses,
  toggleGroupItemClasses,
} from "./toggle-group.styles";

export type ToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> & { ref?: StrictRef<HTMLDivElement> };

/**
 * A row of toggle buttons. `type="single"` keeps one pressed at a time;
 * `type="multiple"` lets several be pressed. Arrow keys move between items,
 * Space or Enter presses one. Name the group with `aria-label` or
 * `aria-labelledby`. A pressed item has a filled surface and a heavier border.
 */
export const ToggleGroup = ({ className, ...props }: ToggleGroupProps) => (
  <ToggleGroupPrimitive.Root
    {...props}
    data-slot="toggle-group"
    className={cn(toggleGroupClasses, className)}
  />
);

export type ToggleGroupItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> & { ref?: StrictRef<HTMLButtonElement> };

export const ToggleGroupItem = ({
  className,
  ...props
}: ToggleGroupItemProps) => (
  <ToggleGroupPrimitive.Item
    {...props}
    data-slot="toggle-group-item"
    className={cn(toggleGroupItemClasses, className)}
  />
);
