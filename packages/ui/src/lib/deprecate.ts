const warned = new Set<string>();

/**
 * Development warning for a renamed prop (D-089, `docs/versioning.md`). The old
 * name keeps working for one release; it warns once per component and prop, and
 * is silent in production builds.
 */
export const warnRenamedProp = (
  component: string,
  oldName: string,
  newName: string,
) => {
  if (process.env.NODE_ENV === "production") return;
  const key = `${component}.${oldName}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `@puranderdua/ui: <${component} ${oldName}> is deprecated and is removed in 1.0.0. Use \`${newName}\` instead.`,
  );
};

/** Test helper: forget which warnings were already shown. */
export const resetRenamedPropWarnings = () => {
  warned.clear();
};
