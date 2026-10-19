import type * as React from "react";

/**
 * Ref accepted by components. React's own `RefCallback` is declared with a
 * bivariance hack, so a `(el: HTMLButtonElement | null) => void` callback is
 * accepted on a `<span>`. This version is strictly contravariant, so a callback
 * ref must accept the element the component renders.
 */
export type StrictRef<T> =
  | ((instance: T | null) => void | (() => void))
  | React.RefObject<T | null>
  | null;

/** Native props of intrinsic element `E`, with `ref` typed via `StrictRef`. */
export type ElementProps<E extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<E> & {
    ref?: StrictRef<React.ComponentRef<E>>;
  };

type Tag = keyof React.JSX.IntrinsicElements;

/**
 * Props for a component that renders one of several elements via `as`.
 * `Default` is used when `as` is omitted; `Others` need an explicit `as`.
 * Each branch carries that element's native props and ref type.
 */
export type AsProps<Default extends Tag, Others extends Tag = never> =
  | (Default extends Tag ? { as?: Default } & ElementProps<Default> : never)
  | (Others extends Tag ? { as: Others } & ElementProps<Others> : never);
