import type * as React from "react";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type SidebarSide = "start" | "end";
export type SidebarAsideElement = "aside" | "nav" | "div";

/**
 * Wrapping row. DOM order is visual order (D-064, D-076): for `start` the aside
 * comes first, for `end` the content comes first and the aside after it. When
 * the row wraps, the aside is therefore above the content for `start` and
 * below it for `end`. There is no `flex-row-reverse` and no `order-*`.
 */
export const sidebarSideClasses: Record<SidebarSide, string> = {
  start: "flex flex-wrap",
  end: "flex flex-wrap",
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
  /**
   * Other props for the aside element: `aria-label`, `id`, `data-*`. Name each
   * `aside` or `nav` when a page has more than one (axe `landmark-unique`).
   */
  sidebarProps?: Omit<React.ComponentPropsWithoutRef<"div">, "children">;
} & AsProps<"div", "section">;

/** Aside plus content. The children are the content column. */
export const Sidebar = ({
  as = "div",
  sidebar,
  side = "start",
  sidebarAs = "aside",
  gap = "lg",
  sidebarClassName,
  sidebarProps,
  className,
  children,
  ...props
}: SidebarProps) => {
  const aside = renderAs(sidebarAs, {
    ...sidebarProps,
    "data-slot": "sidebar-aside",
    className: cn(
      sidebarAsideClasses,
      sidebarClassName,
      sidebarProps?.className,
    ),
    children: sidebar,
  });
  const content = (
    <div data-slot="sidebar-content" className={sidebarContentClasses}>
      {children}
    </div>
  );

  return renderAs(as, {
    ...props,
    "data-slot": "sidebar",
    "data-side": side,
    className: cn(sidebarSideClasses[side], gapClasses[gap], className),
    children:
      side === "end" ? (
        <>
          {content}
          {aside}
        </>
      ) : (
        <>
          {aside}
          {content}
        </>
      ),
  });
};
