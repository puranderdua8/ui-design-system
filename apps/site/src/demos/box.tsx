import type { ReactNode } from "react";

/** Placeholder block used only by the layout demos. */
export const Box = ({ children }: { children: ReactNode }) => (
  <div className="ds-border rounded-ds-control border-dashed border-ds-border bg-ds-surface-subtle px-ds-gap-sm py-ds-gap-xs ds-type-caption">
    {children}
  </div>
);
