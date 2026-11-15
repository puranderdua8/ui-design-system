// Plain module, no "use client": shared by Field and Fieldset (R12).

/** True when a description or error has something to render. */
export const hasContent = (node: unknown): boolean =>
  node != null && node !== false && node !== "";

/** Joins ids for `aria-describedby`; empty and missing ids are dropped. */
export const joinIds = (
  ...ids: ReadonlyArray<string | false | null | undefined>
): string | undefined => ids.filter(Boolean).join(" ") || undefined;

/**
 * The description and error of a Field or Fieldset: their ids (derived from the
 * base id), whether each exists, and the `aria-describedby` value that points
 * at them. No ternary inside a logical test, so the React Compiler can compile
 * the callers (R15).
 */
export const describeMessages = (
  baseId: string,
  description: unknown,
  error: unknown,
) => {
  const hasDescription = hasContent(description);
  const hasError = hasContent(error);
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  return {
    hasDescription,
    hasError,
    descriptionId,
    errorId,
    describedBy: joinIds(hasDescription && descriptionId, hasError && errorId),
  };
};
