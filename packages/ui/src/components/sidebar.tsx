import type * as React from "react";
import { cn } from "@/lib/utils";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SidebarSide = "start" | "end";
export type SidebarCollapse = "md" | "lg";
export type SidebarAsideElement = "aside" | "nav" | "div";

/** Stacked (aside first) below the breakpoint, a row at and above it. */
export const sidebarSideClasses: Record<
  SidebarCollapse,
  Record<SidebarSide, string>
> = {
  md: { start: "flex-col md:flex-row", end: "flex-col md:flex-row-reverse" },
  lg: { start: "flex-col lg:flex-row", end: "flex-col lg:flex-row-reverse" },
};

/** Fixed `layout.sidebar-width` token from the breakpoint up; full width when stacked. */
export const sidebarAsideClasses: Record<SidebarCollapse, string> = {
  md: "md:w-ds-sidebar md:shrink-0",
  lg: "lg:w-ds-sidebar lg:shrink-0",
};

/** Content grows, may shrink to zero inside (long words, tables) but is never narrower than half the row. */
export const sidebarContentClasses: Record<SidebarCollapse, string> = {
  md: "min-w-0 flex-1 md:min-w-1/2",
  lg: "min-w-0 flex-1 lg:min-w-1/2",
};

export type SidebarProps = {
  /** The aside column. */
  sidebar: React.ReactNode;
  /** Which edge the aside sits on from the breakpoint up. */
  side?: SidebarSide;
  /** Below this breakpoint the aside stacks above the content. */
  collapseBelow?: SidebarCollapse;
  /** Element for the aside. `aside` is a landmark; inside `<main>` prefer `div` or `nav`. */
  sidebarAs?: SidebarAsideElement;
  gap?: LayoutGap;
  /** Passed to the aside element. */
  sidebarClassName?: string;
} & AsProps<"div", "section">;

/** Aside plus content. The children are the content column. */
export const Sidebar = ({
  as = "div",
  sidebar,
  side = "start",
  collapseBelow = "md",
  sidebarAs = "aside",
  gap = "lg",
  sidebarClassName,
  className,
  children,
  ...props
}: SidebarProps) => {
  const Comp: React.ElementType = as;
  const Aside: React.ElementType = sidebarAs;
  return (
    <Comp
      {...(props as object)}
      data-slot="sidebar"
      className={cn(
        "flex",
        sidebarSideClasses[collapseBelow][side],
        gapClasses[gap],
        className,
      )}
    >
      <Aside
        data-slot="sidebar-aside"
        className={cn(sidebarAsideClasses[collapseBelow], sidebarClassName)}
      >
        {sidebar}
      </Aside>
      <div
        data-slot="sidebar-content"
        className={sidebarContentClasses[collapseBelow]}
      >
        {children}
      </div>
    </Comp>
  );
};
