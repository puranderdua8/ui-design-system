// "Design with it" format (spec 4.6): one DTCG 2025.10 file with the primitives and the
// roles. Primitives hold values; a role is an alias to a primitive (`{color.brand.600}`),
// or holds a value of its own when the person set one. Pure: no React, no DOM.
//
// A role's group is the first word of its var name (`--ds-action-primary-bg` is
// `action.primary-bg`): the var name does not say where the repo's own source nests it.
import { shadowAliases } from "../engine";
import { UnsafeValueError, safeValue } from "../grammar";
import { literalSlot, primitiveSlot, toDtcg } from "../output";
import type { ResolvedTheme } from "../types";
import { credit } from "./credit";

type Node = { [key: string]: Node | string | number | object };

export type DtcgFile = {
  name: string;
  mime: string;
  content: string;
  /** Roles with a value DTCG 2025.10 cannot hold (an `em` dimension, a keyword easing). */
  unrepresentable: string[];
};

const place = (root: Node, path: string[], token: Node, key: string): void => {
  let node = root;
  for (const segment of path.slice(0, -1)) {
    const existing = node[segment];
    if (existing === undefined) node[segment] = {};
    else if (typeof existing !== "object" || "$value" in existing)
      throw new Error(`${key}: ${path.join(".")} collides with another token`);
    node = node[segment] as Node;
  }
  const leaf = path[path.length - 1]!;
  if (leaf in node)
    throw new Error(`${key}: ${path.join(".")} collides with another token`);
  node[leaf] = token;
};

const roleSlot = (name: string): string[] => {
  const rest = name.slice("--ds-".length);
  const dash = rest.indexOf("-");
  return dash > 0 ? [rest.slice(0, dash), rest.slice(dash + 1)] : [rest];
};

export const toDtcgFile = (theme: ResolvedTheme, name = "custom"): DtcgFile => {
  const root: Node = { $description: credit };
  // The primitives come from the same conversion as the theme-folder export.
  const { files } = toDtcg(theme);
  for (const file of Object.values(files))
    for (const [group, node] of Object.entries(file)) root[group] = node;

  const unrepresentable: string[] = [];
  for (const [key, value] of Object.entries(theme.vars)) {
    if (key in theme.primitives) continue;
    const target = theme.refs[key] ?? shadowAliases[key];
    if (target !== undefined) {
      const slot = primitiveSlot(target);
      if (slot === null || !(target in theme.primitives))
        throw new UnsafeValueError(key, target);
      place(
        root,
        roleSlot(key),
        { $type: slot.type, $value: `{${slot.path.join(".")}}` },
        key,
      );
      continue;
    }
    const slot = literalSlot(key);
    if (slot === null) throw new UnsafeValueError(key, value);
    let converted: unknown;
    try {
      converted = slot.convert(safeValue(key, value));
    } catch (error) {
      if (error instanceof UnsafeValueError) throw error;
      unrepresentable.push(key);
      continue;
    }
    // A conversion that gave back a string could not make the DTCG object.
    if (typeof converted === "string" && slot.type !== "fontFamily") {
      unrepresentable.push(key);
      continue;
    }
    place(
      root,
      roleSlot(key),
      { $type: slot.type, $value: converted as string },
      key,
    );
  }

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "custom";
  return {
    name: `${slug}.tokens.json`,
    mime: "application/json",
    content: `${JSON.stringify(root, null, 2)}\n`,
    unrepresentable,
  };
};
