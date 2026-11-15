import type * as React from "react";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, type LayoutGap } from "@/lib/layout";
import { warnRenamedProp } from "@/lib/deprecate";
import type { AsProps } from "@/lib/types";

export type SidebarSide = "start" | "end";
export type SidebarAsideElement = "aside" | "nav" | "div";

/**
 * Wrapping row. DOM order is visual order (D-064, D-076): for `start` the aside
 * comes first, for `end` the content comes first and the aside after it. When
 * the row wraps, the aside is therefore above the content for `start` and
 * below it for `end`. There is no `flex-row-reverse` and no `order-*`.
 */
export const sidebarRowClasses = "flex flex-wrap";

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
  sidebarSide?: SidebarSide;
  /** @deprecated Renamed `sidebarSide` (D-089). Removed in 1.0.0. */
  side?: SidebarSide;
  /** Element for the aside. `aside` is a landmark; inside `<main>` prefer `div` or `nav`. */
  sidebarAs?: SidebarAsideElement;
  gap?: LayoutGap;
  /**
   * Props for the aside element: `className`, `aria-label`, `id`, `data-*`.
   * Name each `aside` or `nav` when a page has more than one (axe
   * `landmark-unique`).
   */
  sidebarProps?: Omit<React.ComponentPropsWithoutRef<"div">, "children">;
  /** Props for the content column: `className`, `id`, `data-*`. */
  contentProps?: Omit<React.ComponentPropsWithoutRef<"div">, "children">;
} & AsProps<"div", "section">;

/** Aside plus content. The children are the content column. */
export const Sidebar = ({
  as = "div",
  sidebar,
  sidebarSide,
  side,
  sidebarAs = "aside",
  gap = "lg",
  sidebarProps,
  contentProps,
  className,
  children,
  ...props
}: SidebarProps) => {
  if (side !== undefined) warnRenamedProp("Sidebar", "side", "sidebarSide");
  const edge = sidebarSide ?? side ?? "start";
  const aside = renderAs(sidebarAs, {
    ...sidebarProps,
    className: cn(sidebarAsideClasses, sidebarProps?.className),
    "data-slot": "sidebar-aside",
    children: sidebar,
  });
  const content = (
    <div
      {...contentProps}
      data-slot="sidebar-content"
      className={cn(sidebarContentClasses, contentProps?.className)}
    >
      {children}
    </div>
  );

  return renderAs(as, {
    ...props,
    className: cn(sidebarRowClasses, gapClasses[gap], className),
    "data-slot": "sidebar",
    "data-side": edge,
    children:
      edge === "end" ? (
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
