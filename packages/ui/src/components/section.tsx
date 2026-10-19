import type * as React from "react";
import { cn } from "@/lib/utils";
import type { AsProps } from "@/lib/types";
import { Container, type ContainerSize } from "./container";

export type SectionTone = "canvas" | "subtle" | "inverse" | "brand";
export type SectionPadding = "sm" | "md" | "lg";

/** Surface plus the text colour that is contrast-checked on it (contrast-pairs.json). */
export const sectionToneClasses: Record<SectionTone, string> = {
  canvas: "bg-ds-canvas text-ds-text",
  subtle: "bg-ds-surface-subtle text-ds-text",
  inverse: "bg-ds-surface-inverse text-ds-text-inverse",
  brand: "bg-ds-surface-brand text-ds-on-brand",
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
  /** Wrap the children in a `Container` of this size. Omit for a bare band. */
  container?: ContainerSize;
} & AsProps<"section", Exclude<SectionElement, "section">>;

/** Full-width band. Give it an accessible name (`aria-label`) if it should be a landmark. */
export const Section = ({
  as = "section",
  tone = "canvas",
  padding = "md",
  container,
  className,
  children,
  ...props
}: SectionProps) => {
  const Comp: React.ElementType = as;
  return (
    <Comp
      {...(props as object)}
      data-slot="section"
      className={cn(
        "w-full",
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
    >
      {container ? (
        <Container size={container}>{children}</Container>
      ) : (
        children
      )}
    </Comp>
  );
};
