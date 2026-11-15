import type * as React from "react";
import { Text } from "./text";

// No "use client": these hold no state, so Label and the Server Components that
// use them stay server-safe (D-065). Shared by Label, Field and Fieldset (R12).

/** The `*` after a label or legend. Decorative: the control's `required` is announced. */
export const RequiredMarker = () => (
  <span aria-hidden="true" className="ms-1 text-ds-danger-fg">
    *
  </span>
);

export const FieldDescription = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => (
  <Text as="p" variant="caption" id={id}>
    {children}
  </Text>
);

/** The error text, announced when it appears (`role="alert"`). */
export const FieldError = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => (
  <Text
    as="p"
    variant="caption"
    id={id}
    role="alert"
    className="text-ds-danger-fg"
  >
    {children}
  </Text>
);
