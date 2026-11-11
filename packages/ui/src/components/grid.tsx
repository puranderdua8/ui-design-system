import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { gapClasses, listRole, type LayoutGap } from "@/lib/layout";
import type { AsProps } from "@/lib/types";

export type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
export type GridMinItemWidth = "sm" | "md" | "lg";

/**
 * Fixed column counts. Every map starts at one column and adds columns as the
 * Grid's own container grows (Tailwind v4 container queries, `@sm:` = 24rem,
 * `@md:` = 28rem, `@2xl:` = 42rem, …), not as the viewport grows (F17, D-064).
 * The queries need the `@container` wrapper that `Grid` renders around the grid.
 */
export const gridColsClasses: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 @md:grid-cols-2",
  3: "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3",
  4: "grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-4",
  6: "grid-cols-1 @sm:grid-cols-3 @4xl:grid-cols-6",
  12: "grid-cols-1 @sm:grid-cols-6 @5xl:grid-cols-12",
};

/** The element that is the query container for `gridColsClasses`. */
export const gridContainerClasses = "@container";

/** Auto-fit columns from the `layout.item-min.*` tokens (recipes in theme.css). */
export const gridFitClasses: Record<GridMinItemWidth, string> = {
  sm: "ds-grid-fit-sm",
  md: "ds-grid-fit-md",
  lg: "ds-grid-fit-lg",
};

export type GridElement = "div" | "ul" | "ol" | "section";

export type GridProps = {
  /** Responsive column count. Ignored when `minItemWidth` is set. */
  cols?: GridCols;
  /** Auto-fit mode: as many columns as fit, each at least this wide. */
  minItemWidth?: GridMinItemWidth;
  gap?: LayoutGap;
} & AsProps<"div", Exclude<GridElement, "div">>;

export const Grid = ({
  as = "div",
  cols = 1,
  minItemWidth,
  gap = "md",
  className,
  ...props
}: GridProps) => {
  const grid = renderAs(as, {
    role: listRole(as),
    ...props,
    "data-slot": "grid",
    className: cn(
      "grid",
      minItemWidth ? gridFitClasses[minItemWidth] : gridColsClasses[cols],
      gapClasses[gap],
      className,
    ),
  });

  // Auto-fit already follows the container, so it needs no wrapper. A column
  // count needs one, because a container query cannot style its own container.
  // `as`, `ref`, `role` and every other prop stay on the grid itself.
  return minItemWidth ? (
    grid
  ) : (
    <div data-slot="grid-container" className={gridContainerClasses}>
      {grid}
    </div>
  );
};
