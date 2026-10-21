import type * as React from "react";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SidebarSide = "start" | "end";
export type SidebarAsideElement = "aside" | "nav" | "div";

/**
 * Wrapping row. `end` reverses the row; when it wraps, the aside is still the
 * first line, so a stacked sidebar sits above the content on either side.
 */
export const sidebarSideClasses: Record<SidebarSide, string> = {
  start: "flex flex-wrap",
  end: "flex flex-row-reverse flex-wrap",
};

/** Starts at the `layout.sidebar-width` token and takes almost none of the spare room. */
export const sidebarAsideClasses = "grow basis-ds-sidebar";

/**
 * Takes the spare room but is never narrower than half the row. When the aside
 * and that half no longer fit side by side, the content wraps below the aside.
 * The decision uses the width the Sidebar is given, not the viewport.
 */
export const sidebarContentClasses = "grow-999 basis-0 min-w-1/2";

export type SidebarProps = {
  /** The aside column. */
  sidebar: React.ReactNode;
  /** Which edge the aside sits on when the row has room. */
  side?: SidebarSide;
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
  sidebarAs = "aside",
  gap = "lg",
  sidebarClassName,
  className,
  children,
  ...props
}: SidebarProps) => {
  return renderAs(as, {
    ...props,
    "data-slot": "sidebar",
    className: cn(sidebarSideClasses[side], gapClasses[gap], className),
    children: (
      <>
        {renderAs(sidebarAs, {
          "data-slot": "sidebar-aside",
          className: cn(sidebarAsideClasses, sidebarClassName),
          children: sidebar,
        })}
        <div data-slot="sidebar-content" className={sidebarContentClasses}>
          {children}
        </div>
      </>
    ),
  });
};
