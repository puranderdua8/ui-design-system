import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import { warnRenamedProp } from "@/lib/deprecate";
import type { AsProps, ElementProps } from "@/lib/types";
import { Container, type ContainerSize } from "./container";

export type SectionTone = "canvas" | "subtle" | "inverse" | "brand";
export type SectionPadding = "sm" | "md" | "lg";

/**
 * Tone recipes (theme.css): the surface plus the role vars re-pointed inside
 * it (text, links, focus ring, actions, control border). Every tone x role is
 * contrast-checked per theme (contrast-pairs.json, D-074).
 */
export const sectionToneClasses: Record<SectionTone, string> = {
  canvas: "ds-tone-canvas",
  subtle: "ds-tone-subtle",
  inverse: "ds-tone-inverse",
  brand: "ds-tone-brand",
};

/** Vertical padding from the `layout.section-padding.*` tokens. */
export const sectionPaddingClasses: Record<SectionPadding, string> = {
  sm: "py-ds-section-sm",
  md: "py-ds-section-md",
  lg: "py-ds-section-lg",
};

export type SectionElement = "section" | "div" | "header" | "footer" | "aside";

export type SectionProps = {
  tone?: SectionTone;
  padding?: SectionPadding;
  /** Wrap the children in a `Container` of this width. Omit for a bare band. */
  contentWidth?: ContainerSize;
  /**
   * Props for the inner `Container` (`className`, `id`, `data-*`, `ref`). Only
   * used with `contentWidth`.
   */
  contentProps?: Omit<ElementProps<"div">, "children">;
  /** @deprecated Renamed `contentWidth` (D-089). Removed in 1.0.0. */
  container?: ContainerSize;
} & AsProps<"section", Exclude<SectionElement, "section">>;

/** Full-width band. Give it an accessible name (`aria-label`) if it should be a landmark. */
export const Section = ({
  as = "section",
  tone = "canvas",
  padding = "md",
  contentWidth,
  contentProps,
  container,
  className,
  children,
  ...props
}: SectionProps) => {
  if (container !== undefined) {
    warnRenamedProp("Section", "container", "contentWidth");
  }
  const width = contentWidth ?? container;
  return renderAs(as, {
    ...props,
    className: cn(
      "w-full",
      sectionToneClasses[tone],
      sectionPaddingClasses[padding],
      className,
    ),
    "data-slot": "section",
    children: width ? (
      <Container {...contentProps} size={width}>
        {children}
      </Container>
    ) : (
      children
    ),
  });
};
