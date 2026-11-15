"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Direction, Slot } from "radix-ui";
import type { CSSProperties, ReactNode } from "react";
import type { ElementProps } from "@/lib/types";

export type TextDirection = "ltr" | "rtl";

type ScopeValue = {
  theme: string;
  vars: Record<string, string | number>;
};

// The nearest ThemeScope's theme name and resolved vars, for ScopedPortal.
const ScopeContext = React.createContext<ScopeValue | null>(null);

// The nearest explicit direction (a DirectionProvider or a ThemeScope `dir`).
// Radix's own context cannot tell "ltr, chosen" from "ltr, the default", and
// ScopedPortal must only write a `dir` attribute that somebody chose.
const DirectionContext = React.createContext<TextDirection | undefined>(
  undefined,
);

const subscribe = () => () => {};
const getBody = () => document.body;
const getServerBody = () => null;

/**
 * The element a portal renders into: `document.body` in the browser, and `null`
 * while rendering on the server or hydrating. `null` means "not available yet,
 * render no portal"; it never means "no ThemeScope". Overlays no longer portal
 * into a `ThemeScope` (D-091): they portal to `body` and `ScopedPortal`
 * re-applies the scope, so an ancestor with `overflow` or `transform` cannot
 * clip them. An explicit `container` prop on a portal component wins.
 */
export const usePortalContainer = (): HTMLElement | null =>
  React.useSyncExternalStore(subscribe, getBody, getServerBody);

export type ScopedPortalProps = {
  children: ReactNode;
  /** Element to portal into. Defaults to `document.body`; an explicit value wins. */
  container?: HTMLElement | null | undefined;
  /**
   * Put the scope on the single child element (which must accept `className`,
   * `style`, `dir` and `data-*`) instead of a wrapper. Use it when the child is
   * itself the surface, as `SelectContent` does; the default wrapper uses
   * `display: contents`.
   */
  asChild?: boolean;
};

/**
 * Portals its children to `document.body` (or `container`) and re-applies what
 * a portal loses by leaving the tree: the nearest `ThemeScope`'s `data-ds-theme`
 * and resolved vars, its text direction, and the raised surface tone
 * (`ds-tone-raised`), because overlays are raised surfaces. The enclosing
 * Section or Banner tone is deliberately not carried over: a list that opens
 * from a dark band is still a light, raised layer.
 *
 * Renders nothing on the server and during hydration (`usePortalContainer` is
 * `null` there). Use it for every overlay (Select today; Dialog, Tooltip and
 * Toast later) and for your own portals.
 */
export const ScopedPortal = ({
  children,
  container,
  asChild = false,
}: ScopedPortalProps) => {
  const body = usePortalContainer();
  const scope = React.use(ScopeContext);
  const dir = React.use(DirectionContext);
  const target = container ?? body;
  if (!target) return null;

  const scopeProps = {
    "data-slot": "scoped-portal",
    "data-ds-theme": scope?.theme,
    dir,
    style: scope?.vars as CSSProperties | undefined,
  };

  return createPortal(
    asChild ? (
      <Slot.Root {...scopeProps} className="ds-tone-raised">
        {children}
      </Slot.Root>
    ) : (
      <div {...scopeProps} className="contents ds-tone-raised">
        {children}
      </div>
    ),
    target,
  );
};

export type DirectionProviderProps = {
  dir: TextDirection;
  children: ReactNode;
};

/**
 * Tells Radix-based components (Tabs, RadioGroup, Select) which way the page
 * reads, so arrow keys follow it. Radix assumes `ltr` unless it is told, even
 * on a page with `<html dir="rtl">`. It does not set a `dir` attribute: put
 * that on the element too, or use `ThemeScope`'s `dir`, which does both.
 */
export const DirectionProvider = ({
  dir,
  children,
}: DirectionProviderProps) => (
  <Direction.Provider dir={dir}>
    <DirectionContext value={dir}>{children}</DirectionContext>
  </Direction.Provider>
);

export type ThemeScopeProps = Omit<ElementProps<"div">, "style" | "dir"> & {
  /** Theme name, written to `data-ds-theme` (for example `nature`). */
  theme: string;
  /** The theme's resolved var map: `vars` from `@puranderdua/ui/themes/<name>.json`. */
  vars: Record<string, string | number>;
  /**
   * Text direction of the scope. Sets the `dir` attribute and tells Radix
   * components (see `DirectionProvider`). Omit it to inherit the page.
   */
  dir?: TextDirection;
  style?: CSSProperties;
};

/**
 * Applies a theme's resolved vars to its own element. Overlays opened inside it
 * portal to `document.body` and re-apply the scope there (`ScopedPortal`), so
 * they keep the theme without being clipped by the scope's ancestors.
 */
export const ThemeScope = ({
  theme,
  vars,
  dir,
  style,
  children,
  ...props
}: ThemeScopeProps) => (
  <div
    {...props}
    dir={dir}
    data-slot="theme-scope"
    data-ds-theme={theme}
    style={{ ...vars, ...style }}
  >
    <ScopeContext value={{ theme, vars }}>
      {dir ? (
        <DirectionProvider dir={dir}>{children}</DirectionProvider>
      ) : (
        children
      )}
    </ScopeContext>
  </div>
);
