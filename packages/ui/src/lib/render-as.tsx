import type * as React from "react";

/** Tags a component may render through `as`. */
export type RenderAsTag = keyof React.JSX.IntrinsicElements;

/**
 * Props the component passes to the rendered element. Callers are checked
 * against the public props type (`AsProps`, `ElementProps`); inside the
 * component the element is chosen at run time, so only `className` and
 * `children` are named and any other prop (`ref`, `role`, ARIA, `data-*`)
 * passes through.
 */
export type RenderAsProps = Record<string, unknown> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Renders the element named by the dynamic `as` tag. TypeScript cannot relate
 * a props type to a tag chosen at run time, so the tag is widened to
 * `ElementType` here, once, and no component needs an assertion (see
 * `render-as.test.tsx`).
 */
export const renderAs = (as: RenderAsTag, props: RenderAsProps) => {
  const Comp = as as React.ElementType;
  return <Comp {...props} />;
};
