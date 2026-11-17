"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ThemeScope } from "@puranderdua/ui";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeTheme,
} from "@/lib/theme";

/**
 * Everything inside wears the look chosen under "Showing examples in" (D-128); the
 * tool's own chrome never does. The head script already styles `[data-examples-scope]`
 * from the cache, so a reload shows the right look before this hydrates.
 */
export const ExamplesScope = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const { name, vars } = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  return (
    <ThemeScope
      theme={name}
      vars={vars}
      data-examples-scope=""
      className={className}
    >
      {children}
    </ThemeScope>
  );
};
