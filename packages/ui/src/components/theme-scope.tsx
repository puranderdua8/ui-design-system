"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import type { ElementProps } from "@/lib/types";

const PortalContainerContext = React.createContext<HTMLElement | null>(null);

/**
 * The element overlays should portal into: the nearest `ThemeScope`, or `null`
 * when there is none (portal components then use `document.body`). An explicit
 * `container` prop on a portal component wins over this.
 */
export const usePortalContainer = () => React.use(PortalContainerContext);

export type ThemeScopeProps = Omit<ElementProps<"div">, "style"> & {
  /** Theme name, written to `data-ds-theme` (for example `nature`). */
  theme: string;
  /** The theme's resolved var map: `vars` from `@puranderdua/ui/themes/<name>.json`. */
  vars: Record<string, string>;
  style?: CSSProperties;
};

/**
 * Applies a theme's resolved vars to its own element and makes that element the
 * default portal container, so Select (and later Dialog, Tooltip, Toast) render
 * inside the theme instead of on `document.body`.
 */
export const ThemeScope = ({
  theme,
  vars,
  style,
  ref,
  children,
  ...props
}: ThemeScopeProps) => {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <div
      {...props}
      ref={setRef}
      data-slot="theme-scope"
      data-ds-theme={theme}
      style={{ ...vars, ...style }}
    >
      <PortalContainerContext value={element}>
        {children}
      </PortalContainerContext>
    </div>
  );
};
