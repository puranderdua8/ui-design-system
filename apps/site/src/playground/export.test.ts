// Round trip (S35): export a playground theme, write it to a scratch copy of
// tokens/themes/custom/, register it in a scratch resolver and run the repo's own
// build-tokens, validate-tokens and contrast scripts on it.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { evaluateContrast } from "./contrast";
import { contrastSpec, themeMaps } from "./data";
import { resolveState } from "./engine";
import { exportTheme, themeSlug } from "./export";
import type { PlaygroundState, ThemeName } from "./types";

const root = resolve(__dirname, "../../../..");
const scripts = join(root, "scripts");
const tmp = mkdtempSync(join(tmpdir(), "ds-export-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const state = (
  start: ThemeName,
  knobs: PlaygroundState["knobs"] = {},
  overrides: PlaygroundState["overrides"] = {},
): PlaygroundState => ({ start, knobs, overrides });

const run = (script: string, ...args: string[]) => {
  try {
    const output = execFileSync(
      process.execPath,
      [join(scripts, script), ...args],
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    return { ok: true, output };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string };
    return { ok: false, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};

// A scratch tokens/ with the exported theme as themes/custom/ and a resolver that lists it.
const scratch = (id: string, files: { name: string; content: string }[]) => {
  const dir = join(tmp, id);
  cpSync(join(root, "tokens"), dir, { recursive: true });
  const themeDir = join(dir, "themes/custom");
  mkdirSync(themeDir, { recursive: true });
  for (const file of files)
    if (file.name.endsWith(".json"))
      writeFileSync(join(themeDir, file.name), file.content);
  const resolverFile = join(dir, "resolver.json");
  const resolver = JSON.parse(readFileSync(resolverFile, "utf8"));
  resolver.modifiers.theme.contexts.custom = [
    "color",
    "dimension",
    "effects",
    "typography",
  ].map((name) => ({ $ref: `themes/custom/${name}.json` }));
  writeFileSync(resolverFile, JSON.stringify(resolver, null, 2));
  return dir;
};

const build = async (dir: string, out: string) => {
  // Same module the repo scripts use (ESM, plain JS).
  const { buildTokens } = (await import(
    /* @vite-ignore */ join(scripts, "build-tokens.mjs")
  )) as { buildTokens: (out: string, tokens: string) => Promise<string> };
  await buildTokens(out, dir);
};

const readVars = (out: string) =>
  JSON.parse(readFileSync(join(out, "themes/custom.json"), "utf8"))
    .vars as Record<string, string | number>;

describe("exportTheme", () => {
  it("returns the four DTCG files and a CSS file named after the theme", () => {
    const out = exportTheme(
      resolveState(state("base"), themeMaps),
      "My Theme!",
    );
    expect(out.files.map((f) => f.name)).toEqual([
      "color.json",
      "dimension.json",
      "effects.json",
      "typography.json",
      "my-theme.css",
    ]);
    for (const file of out.files.slice(0, 4))
      expect(() => JSON.parse(file.content)).not.toThrow();
    expect(out.files[4].content).toContain(":root {");
    expect(out.unrepresentable).toEqual([]);
  });

  it("slugs names to something usable as a folder", () => {
    expect(themeSlug("  Hello World ")).toBe("hello-world");
    expect(themeSlug("***")).toBe("custom");
  });

  it("reports semantic overrides the files cannot hold", () => {
    const out = exportTheme(
      resolveState(
        state("base", {}, { "--ds-action-primary-bg": "#112233" }),
        themeMaps,
      ),
    );
    expect(out.unrepresentable).toEqual(["--ds-action-primary-bg"]);
  });
});

describe("round trip through the repo scripts", () => {
  const cases: [string, PlaygroundState][] = [
    ["an unchanged Base", state("base")],
    ["an unchanged Quirky", state("quirky")],
    [
      "every knob on Nature",
      state("nature", {
        brand: "#7a1fa2",
        accent: "#c2410c",
        neutral: { hue: 60, chroma: 0.02 },
        headingFont: "fraunces",
        bodyFont: "nunito",
        radiusScale: 1.5,
        borderWidth: 2,
        shadowStrength: 1.4,
        density: 1.1,
        motionSpeed: 2,
      }),
    ],
  ];

  it.each(cases)(
    "%s validates, builds and keeps its values",
    async (label, input) => {
      const resolved = resolveState(input, themeMaps);
      const { files } = exportTheme(resolved);
      const id = label.replace(/\W+/g, "-");
      const dir = scratch(id, files);

      const validated = run("validate-tokens.mjs", dir);
      expect(validated.output).not.toMatch(/missing|error/i);
      expect(validated.ok).toBe(true);

      const out = join(tmp, `${id}-out`);
      await build(dir, out);
      const built = readVars(out);
      // The built theme has the same var names as the one the playground resolved,
      // and the same values (font weights are numbers in both).
      expect(Object.keys(built).sort()).toEqual(
        Object.keys(resolved.vars).sort(),
      );
      for (const [key, value] of Object.entries(resolved.vars))
        expect([key, String(built[key]).replace(/['"]/g, "")]).toEqual([
          key,
          String(value).replace(/['"]/g, ""),
        ]);

      // The script's verdict matches the playground's own contrast report.
      const report = evaluateContrast(resolved.vars, contrastSpec);
      const contrast = run("contrast.mjs", join(out, "themes/custom.json"));
      expect(contrast.output).toContain("[custom]");
      expect(contrast.ok).toBe(report.failing === 0);
    },
    60_000,
  );

  it("a low-contrast export still validates and builds, and the script flags it", async () => {
    const resolved = resolveState(
      state("base", { brand: "#cfcfcf" }),
      themeMaps,
    );
    expect(
      evaluateContrast(resolved.vars, contrastSpec).failing,
    ).toBeGreaterThan(0);
    const dir = scratch("low", exportTheme(resolved).files);
    expect(run("validate-tokens.mjs", dir).ok).toBe(true);
    const out = join(tmp, "low-out");
    await build(dir, out);
    const contrast = run("contrast.mjs", join(out, "themes/custom.json"));
    expect(contrast.ok).toBe(false);
    expect(contrast.output).toContain("FAIL");
  }, 60_000);

  it("the exported CSS lists the same declarations as the built CSS", async () => {
    const resolved = resolveState(
      state("corporate", { brand: "#0b6b4f" }),
      themeMaps,
    );
    const { files } = exportTheme(resolved);
    const dir = scratch("css", files);
    const out = join(tmp, "css-out");
    await build(dir, out);
    const decls = (css: string) =>
      css
        .split("\n")
        .filter((line) => /^\s+--ds-/.test(line))
        // The build appends each semantic token's description as a comment.
        .map((line) => line.replace(/\s*\/\*\*.*\*\/\s*$/, "").trim())
        .sort();
    const exported = files.find((f) => f.name.endsWith(".css"))!.content;
    expect(decls(exported)).toEqual(
      decls(readFileSync(join(out, "themes/custom.css"), "utf8")),
    );
  }, 60_000);
});
