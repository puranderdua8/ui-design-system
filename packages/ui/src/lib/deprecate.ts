const warned = new Set<string>();

/**
 * Development-only warning, shown once per key and silent in production builds.
 * Use it for a misuse TypeScript cannot catch (a runtime child count, a prop
 * combination from JavaScript) and for a deprecated name (`docs/versioning.md`:
 * one release of overlap, the warning names the replacement and the release that
 * removes it).
 */
export const warnOnce = (key: string, message: string) => {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`@puranderdua/ui: ${message}`);
};

/** Test helper: forget which warnings were already shown. */
export const resetWarnings = () => {
  warned.clear();
};
