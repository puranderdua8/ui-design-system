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

/**
 * Either a column count (`cols`) or an auto-fit minimum width (`minItemWidth`),
 * never both (R07).
 */
type GridColumns =
  | {
      /** Responsive column count; follows the Grid's own width, which must be definite. */
      cols?: GridCols;
      minItemWidth?: never;
    }
  | {
      cols?: never;
      /** Auto-fit mode: as many columns as fit, each at least this wide. */
      minItemWidth: GridMinItemWidth;
    };

export type GridProps = GridColumns & {
  gap?: LayoutGap;
} & AsProps<"div", Exclude<GridElement, "div">>;

/** Props that belong on the outermost element: the one that is the flex or grid item. */
const isOuterProp = (name: string) =>
  name === "style" || name.startsWith("data-");

/**
 * With `minItemWidth` the Grid is one element and every prop lands on it. With
 * `cols` a container query needs a wrapper (an element cannot query itself), so
 * the outermost element is a `div` that fills its parent (`w-full min-w-0`,
 * otherwise a flex parent sizes it to zero) and takes `className`, `style` and
 * `data-*`: `col-span-2`, `flex-1` and `self-start` work on it. `as`, `ref`,
 * `role`, `id`, `aria-*` and the children stay on the grid element inside it.
 */
export const Grid = ({
  as = "div",
  cols = 1,
  minItemWidth,
  gap = "md",
  className,
  ...props
}: GridProps) => {
  if (minItemWidth) {
    return renderAs(as, {
      role: listRole(as),
      ...props,
      className: cn(
        "grid",
        gridFitClasses[minItemWidth],
        gapClasses[gap],
        className,
      ),
      "data-slot": "grid",
    });
  }

  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    (isOuterProp(name) ? outer : inner)[name] = value;
  }

  return (
    <div
      {...outer}
      data-slot="grid-container"
      className={cn(gridContainerClasses, "w-full min-w-0", className)}
    >
      {renderAs(as, {
        role: listRole(as),
        ...inner,
        className: cn("grid", gridColsClasses[cols], gapClasses[gap]),
        "data-slot": "grid",
      })}
    </div>
  );
};
