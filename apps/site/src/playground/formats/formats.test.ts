// The two single-file formats (S49): CSS variables for any site, one DTCG file for design
// tools. The DTCG file is checked by the repo's own validator; the CSS is applied to a
// plain HTML page in `e2e/css-vars.spec.ts`.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { themeMaps } from "../data";
import { resolveState } from "../engine";
import { UnsafeValueError } from "../grammar";
import type { PlaygroundState, ResolvedTheme, ThemeName } from "../types";
import { credit } from "./credit";
import { toCssVars } from "./css-vars";
import { toDtcgFile } from "./dtcg-file";

const root = resolve(__dirname, "../../../../..");
const tmp = mkdtempSync(join(tmpdir(), "ds-formats-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const state = (
  start: ThemeName,
  knobs: PlaygroundState["knobs"] = {},
  overrides: PlaygroundState["overrides"] = {},
): PlaygroundState => ({
  start,
  mode: "light",
  dims: {},
  fonts: {},
  knobs,
  overrides,
});
const resolved = (...args: Parameters<typeof state>): ResolvedTheme =>
  resolveState(state(...args), themeMaps);

const themes: ThemeName[] = ["base", "corporate", "nature", "quirky"];

type Json = { [key: string]: Json | string | number | object };
type Leaf = { path: string; type?: string; value: unknown };

/** Every token in a DTCG file, with its own or inherited `$type`. */
const leaves = (node: Json, path: string[] = [], type?: string): Leaf[] =>
  Object.entries(node).flatMap(([key, child]) => {
    if (key.startsWith("$") || typeof child !== "object") return [];
    const own = (child as Json).$type;
    const t = typeof own === "string" ? own : type;
    return "$value" in child
      ? [{ path: [...path, key].join("."), type: t, value: child.$value }]
      : leaves(child as Json, [...path, key], t);
  });

describe("toCssVars", () => {
  it("is one :root block with every var of the theme, resolved, after the credit", () => {
    const theme = resolved("corporate", { brand: "#0b6b4f" });
    const css = toCssVars(theme);
    expect(css.startsWith(`/* ${credit} */\n:root {\n`)).toBe(true);
    expect(css.match(/:root \{/g)).toHaveLength(1);
    const declared = [...css.matchAll(/^ {2}(--ds-[a-z0-9-]+): (.+);$/gm)];
    expect(declared.map((m) => m[1])).toEqual(Object.keys(theme.vars));
    // Resolved: no value points at another var, so no package file is needed.
    expect(css).not.toMatch(/var\(/);
    expect(css).toContain("--ds-color-brand-600: #0b6b4f;");
  });

  it.each(themes)("has the same value as the theme map for %s", (name) => {
    const theme = resolved(name);
    const css = toCssVars(theme);
    for (const [key, value] of Object.entries(theme.vars))
      expect(css).toContain(`  ${key}: ${String(value)};`);
  });

  it("refuses a value that bypassed the grammar", () => {
    const theme = resolved("base");
    const bad: ResolvedTheme = {
      ...theme,
      vars: {
        ...theme.vars,
        "--ds-color-brand-600": "red; } body { display: none } :root {",
      },
    };
    expect(() => toCssVars(bad)).toThrow(UnsafeValueError);
  });
});

describe("toDtcgFile", () => {
  it("has the credit, every primitive as a value and every role as an alias", () => {
    const theme = resolved("nature");
    const file = toDtcgFile(theme, "My Look!");
    expect(file.name).toBe("my-look.tokens.json");
    expect(file.unrepresentable).toEqual([]);
    const json = JSON.parse(file.content) as Json;
    expect(json.$description).toBe(credit);
    const all = leaves(json);
    const aliases = all.filter(
      (l) => typeof l.value === "string" && /^\{.+\}$/.test(l.value),
    );
    // One token per var, primitives and roles together.
    expect(all).toHaveLength(Object.keys(theme.vars).length);
    expect(all.length - aliases.length).toBe(
      Object.keys(theme.primitives).length,
    );
    // Every alias points at a token that exists, of the same type.
    const byPath = new Map(all.map((l) => [l.path, l]));
    for (const a of aliases) {
      const target = byPath.get((a.value as string).slice(1, -1));
      expect(target, a.path).toBeDefined();
      expect(target!.type, a.path).toBe(a.type);
      expect(
        typeof target!.value === "string" && target!.value.startsWith("{"),
      ).toBe(false);
    }
  });

  it("writes a role the person set as a value of its own", () => {
    const theme = resolved("base", {}, { "--ds-action-primary-bg": "#112233" });
    const json = JSON.parse(toDtcgFile(theme).content) as Json;
    const role = leaves(json).find((l) => l.path === "action.primary-bg");
    expect(role?.type).toBe("color");
    expect(role?.value).toMatchObject({
      colorSpace: "srgb",
      hex: "#112233",
    });
  });

  it("reports a role it cannot hold instead of writing a wrong value", () => {
    const theme = resolved("base");
    const odd: ResolvedTheme = {
      ...theme,
      vars: { ...theme.vars, "--ds-control-gap": "0.5em" },
      refs: Object.fromEntries(
        Object.entries(theme.refs).filter(([k]) => k !== "--ds-control-gap"),
      ),
    };
    const file = toDtcgFile(odd);
    expect(file.unrepresentable).toEqual(["--ds-control-gap"]);
    expect(file.content).not.toContain('"0.5em"');
  });

  it("refuses a value that bypassed the grammar", () => {
    const theme = resolved("base");
    const bad: ResolvedTheme = {
      ...theme,
      primitives: {
        ...theme.primitives,
        "--ds-color-brand-600": "red; } body { display: none }",
      },
    };
    expect(() => toDtcgFile(bad)).toThrow(UnsafeValueError);
  });

  // The repo's validator checks the format of every value and that every alias resolves.
  // The file is split back into a scratch token folder (aliases are roles, the rest are
  // primitives); roles get a placeholder description because the validator requires one.
  const split = (json: Json) => {
    const primitives: Json = {};
    const roles: Json = {};
    const walk = (
      node: Json,
      path: string[],
      type: string | undefined,
    ): void => {
      for (const [key, child] of Object.entries(node)) {
        if (key.startsWith("$") || typeof child !== "object") continue;
        const own = (child as Json).$type;
        const t = typeof own === "string" ? own : type;
        const here = [...path, key];
        if ("$value" in child) {
          const isRole =
            typeof child.$value === "string" && /^\{.+\}$/.test(child.$value);
          const target = isRole ? roles : primitives;
          let at = target;
          for (const segment of path) at = (at[segment] ??= {}) as Json;
          at[key] = {
            $type: t,
            $value: child.$value,
            ...(isRole ? { $description: "A role." } : {}),
          } as Json;
        } else walk(child as Json, here, t);
      }
    };
    walk(json, [], undefined);
    return { primitives, roles };
  };

  const fileFor = (group: string): string =>
    group === "color"
      ? "color.json"
      : ["shadow", "duration", "easing"].includes(group)
        ? "effects.json"
        : group === "font"
          ? "typography.json"
          : "dimension.json";

  it.each(themes)(
    "passes the repo's token validator (%s)",
    (name) => {
      const { primitives, roles } = split(
        JSON.parse(toDtcgFile(resolved(name, { brand: "#7a1fa2" })).content),
      );
      const dir = join(tmp, `validate-${name}`);
      mkdirSync(join(dir, "themes/custom"), { recursive: true });
      mkdirSync(join(dir, "semantic"), { recursive: true });
      const grouped: Record<string, Json> = {};
      for (const [group, node] of Object.entries(primitives))
        (grouped[fileFor(group)] ??= {})[group] = node;
      for (const [file, node] of Object.entries(grouped))
        writeFileSync(join(dir, "themes/custom", file), JSON.stringify(node));
      writeFileSync(join(dir, "semantic/roles.json"), JSON.stringify(roles));
      writeFileSync(
        join(dir, "resolver.json"),
        JSON.stringify({
          version: "2025.10",
          sets: {
            shared: { sources: [] },
            semantic: { sources: [{ $ref: "semantic/roles.json" }] },
          },
          modifiers: {
            theme: {
              default: "custom",
              contexts: {
                custom: Object.keys(grouped).map((file) => ({
                  $ref: `themes/custom/${file}`,
                })),
              },
            },
            mode: { default: "light", contexts: { light: [], dark: [] } },
          },
        }),
      );
      // The contrast file names roles; these exist in the file under any naming.
      writeFileSync(
        join(dir, "contrast-pairs.json"),
        JSON.stringify({
          pairs: [{ fg: "text.primary", bg: "surface.canvas", min: "text" }],
          contexts: { c: { surface: "surface.canvas", map: {} } },
          roles: [{ fg: "text.primary", bg: "surface.canvas", min: "text" }],
          exclusions: [],
        }),
      );
      let output = "";
      try {
        output = execFileSync(
          process.execPath,
          [join(root, "scripts/validate-tokens.mjs"), dir],
          { encoding: "utf8", stdio: "pipe" },
        );
      } catch (error) {
        const e = error as { stdout?: string; stderr?: string };
        throw new Error(`${e.stdout ?? ""}${e.stderr ?? ""}`);
      }
      expect(output).toContain("validate-tokens: OK");
    },
    30_000,
  );
});
