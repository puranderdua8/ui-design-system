"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import {
  tabsClasses,
  tabsContentClasses,
  tabsListClasses,
  tabsTriggerClasses,
} from "./tabs.styles";

export type TabsProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Root
> & { ref?: StrictRef<HTMLDivElement> };

/**
 * Tabs (Radix). `activationMode="automatic"` (default) selects a tab when it is
 * focused with the arrow keys; `"manual"` selects it on Enter or Space.
 */
export const Tabs = ({
  className,
  orientation = "horizontal",
  ...props
}: TabsProps) => (
  <TabsPrimitive.Root
    {...props}
    data-slot="tabs"
    data-orientation={orientation}
    orientation={orientation}
    className={cn(tabsClasses, className)}
  />
);

export type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> & { ref?: StrictRef<HTMLDivElement> };

/** Give the list an accessible name (`aria-label`) when the page has more than one. */
export const TabsList = ({ className, ...props }: TabsListProps) => (
  <TabsPrimitive.List
    {...props}
    data-slot="tabs-list"
    className={cn(tabsListClasses, className)}
  />
);

export type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & { ref?: StrictRef<HTMLButtonElement> };

export const TabsTrigger = ({ className, ...props }: TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    {...props}
    data-slot="tabs-trigger"
    className={cn(tabsTriggerClasses, className)}
  />
);

export type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> & { ref?: StrictRef<HTMLDivElement> };

export const TabsContent = ({ className, ...props }: TabsContentProps) => (
  <TabsPrimitive.Content
    {...props}
    data-slot="tabs-content"
    className={cn(tabsContentClasses, className)}
  />
);
