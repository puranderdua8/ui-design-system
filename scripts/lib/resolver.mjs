// Reads tokens/resolver.json (DTCG Resolver Module 2025.10 shape) and returns
// absolute source paths: shared, semantic, and per theme. Only the subset of
// the spec we use is supported; anything else is an error.
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Modes the build emits. `dark` is reserved in the manifest (D-047).
export const BUILT_MODES = ["light"];

export function loadResolver(tokensDir) {
  const file = join(tokensDir, "resolver.json");
  const json = JSON.parse(readFileSync(file, "utf8"));
  const errors = [];
  const refs = (list, where) => {
    if (!Array.isArray(list)) {
      errors.push(`resolver.json: ${where} must be an array`);
      return [];
    }
    return list.map((s) => {
      if (typeof s?.$ref !== "string" || !s.$ref.endsWith(".json")) {
        errors.push(
          `resolver.json: ${where} has an entry without a .json $ref`,
        );
        return "";
      }
      return join(tokensDir, s.$ref);
    });
  };

  if (json.version !== "2025.10")
    errors.push(`resolver.json: version must be "2025.10"`);
  const shared = refs(json.sets?.shared?.sources, "sets.shared.sources");
  const semantic = refs(json.sets?.semantic?.sources, "sets.semantic.sources");
  const themeMod = json.modifiers?.theme;
  const modeMod = json.modifiers?.mode;
  const themes = {};
  for (const [name, list] of Object.entries(themeMod?.contexts ?? {}))
    themes[name] = refs(list, `modifiers.theme.contexts.${name}`);
  if (!Object.keys(themes).length)
    errors.push("resolver.json: modifiers.theme has no contexts");
  if (!(themeMod?.default in themes))
    errors.push("resolver.json: modifiers.theme.default is not a context");
  if (!("light" in (modeMod?.contexts ?? {})))
    errors.push('resolver.json: modifiers.mode needs a "light" context');
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  return {
    shared,
    semantic,
    themes,
    defaultTheme: themeMod.default,
    modes: BUILT_MODES,
  };
}
