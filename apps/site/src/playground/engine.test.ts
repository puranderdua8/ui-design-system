import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { converter, parse } from "culori";
import { describe, expect, it } from "vitest";
import base from "@puranderdua/ui/themes/base.json";
import corporate from "@puranderdua/ui/themes/corporate.json";
import nature from "@puranderdua/ui/themes/nature.json";
import quirky from "@puranderdua/ui/themes/quirky.json";
import pairs from "@puranderdua/ui/contrast-pairs.json";
import { evaluateContrast } from "./contrast";
import { parseShadow, resolveState, resolveTheme } from "./engine";
import { toCss, toDtcg } from "./output";
import { brandRamp, brandSteps, neutralRamp, neutralSteps } from "./ramps";
import type {
  ContrastPairsSpec,
  PlaygroundState,
  ThemeJson,
  ThemeName,
  VarMap,
} from "./types";

const themes: Record<ThemeName, ThemeJson> = {
  base,
  corporate,
  nature,
  quirky,
};
const names = Object.keys(themes) as ThemeName[];
const spec = pairs as ContrastPairsSpec;

// Vitest runs in apps/site.
const repo = join(process.cwd(), "../..");
const packageDist = join(process.cwd(), "node_modules/@puranderdua/ui/dist");

const lightness = (hex: string): number => converter("oklch")(parse(hex)!).l;

const state = (
  start: ThemeName,
  knobs: PlaygroundState["knobs"] = {},
  overrides: PlaygroundState["overrides"] = {},
): PlaygroundState => ({ start, knobs, overrides });

describe("colour ramps", () => {
  const inputs = [
    "#595959",
    "#1762b6",
    "#2f7442",
    "#703dc6",
    "#e11d48",
    "#facc15",
    "#0000ff",
    "#111111",
    "#ffffff",
    "#000000",
  ];

  it.each(inputs)(
    "brand ramp from %s is strictly darker with each step",
    (hex) => {
      const ramp = brandRamp(hex);
      expect(Object.keys(ramp)).toEqual([...brandSteps]);
      const values = brandSteps.map((step) => lightness(ramp[step]));
      for (let i = 1; i < values.length; i++)
        expect(values[i]).toBeLessThan(values[i - 1]);
    },
  );

  it("keeps the chosen colour as step 600 when its lightness is in range", () => {
    expect(brandRamp("#1762b6")["600"]).toBe("#1762b6");
    expect(brandRamp("#703dc6")["600"]).toBe("#703dc6");
  });

  it("rejects something that is not a colour", () => {
    expect(() => brandRamp("not-a-colour")).toThrow(RangeError);
  });

  it.each([0, 90, 200, 330])(
    "neutral ramp at hue %s is strictly darker with each step",
    (hue) => {
      const ramp = neutralRamp(base.vars, { hue, chroma: 0.03 });
      expect(Object.keys(ramp)).toEqual([...neutralSteps]);
      const values = neutralSteps.map((step) => lightness(ramp[step]));
      for (let i = 1; i < values.length; i++)
        expect(values[i]).toBeLessThan(values[i - 1]);
    },
  );
});

describe("an unchanged state", () => {
  it.each(names)("resolves to the %s theme exactly", (name) => {
    const resolved = resolveState(state(name), themes);
    expect(resolved.vars).toEqual(themes[name].vars);
    expect(Object.keys(resolved.vars)).toEqual(Object.keys(themes[name].vars));
    expect(resolved.refs).toEqual(themes[name].refs);
    expect(resolved.semanticOverrides).toEqual([]);
    expect(resolved.ignored).toEqual([]);
  });

  it("is not changed by knobs at their neutral values", () => {
    const neutral = {
      radiusScale: 1,
      shadowStrength: 1,
      density: 1,
      motionSpeed: 1,
    };
    for (const name of names)
      expect(resolveState(state(name, neutral), themes).vars).toEqual(
        themes[name].vars,
      );
  });

  it("is not changed by choosing the theme's own fonts", () => {
    const resolved = resolveState(
      state("nature", { headingFont: "fraunces", bodyFont: "nunito" }),
      themes,
    );
    expect(resolved.vars).toEqual(nature.vars);
  });
});

describe("knobs", () => {
  it("a new brand colour flows through the refs to every role that uses it", () => {
    const resolved = resolveState(state("base", { brand: "#1762b6" }), themes);
    expect(resolved.vars["--ds-color-brand-600"]).toBe("#1762b6");
    expect(resolved.vars["--ds-action-primary-bg"]).toBe("#1762b6");
    expect(resolved.vars["--ds-focus-ring"]).toBe("#1762b6");
    expect(resolved.vars["--ds-on-brand-action-primary-fg"]).toBe(
      resolved.vars["--ds-color-brand-700"],
    );
    // Nothing else moved.
    expect(resolved.vars["--ds-text-primary"]).toBe(
      base.vars["--ds-text-primary"],
    );
  });

  it("a neutral tint re-tints text and surfaces and the scrim, keeping its alpha", () => {
    const resolved = resolveState(
      state("base", { neutral: { hue: 30, chroma: 0.03 } }),
      themes,
    );
    expect(resolved.vars["--ds-text-primary"]).toBe(
      resolved.vars["--ds-color-neutral-900"],
    );
    expect(resolved.vars["--ds-text-primary"]).not.toBe(
      base.vars["--ds-text-primary"],
    );
    expect(String(resolved.vars["--ds-color-scrim"])).toMatch(
      /^rgba\(.*, 0\.7\)$/,
    );
    expect(resolved.vars["--ds-color-scrim"]).not.toBe(
      base.vars["--ds-color-scrim"],
    );
    expect(resolved.vars["--ds-overlay-scrim"]).toBe(
      resolved.vars["--ds-color-scrim"],
    );
  });

  it("adds an accent scale after neutral-950 without touching anything else", () => {
    const resolved = resolveState(state("base", { accent: "#e11d48" }), themes);
    const keys = Object.keys(resolved.vars);
    expect(keys).toContain("--ds-color-accent-600");
    expect(keys.indexOf("--ds-color-accent-50")).toBe(
      keys.indexOf("--ds-color-neutral-950") + 1,
    );
    expect(keys.filter((k) => k.includes("accent"))).toHaveLength(10);
    const baseVars: VarMap = base.vars;
    for (const key of Object.keys(baseVars))
      expect(resolved.vars[key]).toBe(baseVars[key]);
  });

  it("swaps heading and body fonts independently", () => {
    const resolved = resolveState(
      state("base", { headingFont: "fraunces", bodyFont: "plex" }),
      themes,
    );
    expect(resolved.vars["--ds-font-family-heading"]).toBe(
      "Fraunces, Georgia, serif",
    );
    expect(resolved.vars["--ds-type-h1-font-family"]).toBe(
      "Fraunces, Georgia, serif",
    );
    expect(resolved.vars["--ds-font-family-body"]).toBe(
      "'IBM Plex Sans', system-ui, sans-serif",
    );
  });

  it("scales radii but not the pill, and the semantic radii follow", () => {
    const resolved = resolveState(state("base", { radiusScale: 2 }), themes);
    expect(resolved.vars["--ds-radius-md"]).toBe("1rem");
    expect(resolved.vars["--ds-radius-control"]).toBe("1rem");
    expect(resolved.vars["--ds-radius-card"]).toBe("1.5rem");
    expect(resolved.vars["--ds-radius-full"]).toBe("9999px");
  });

  it("sets the border width and keeps the step to the strong width", () => {
    const resolved = resolveState(state("base", { borderWidth: 2 }), themes);
    expect(resolved.vars["--ds-border-width-1"]).toBe("2px");
    expect(resolved.vars["--ds-border-width-2"]).toBe("3px");
    expect(resolved.vars["--ds-border-width-default"]).toBe("2px");
    // Quirky is 2px / 3px: a step of 1.
    expect(
      resolveState(state("quirky", { borderWidth: 1 }), themes).vars[
        "--ds-border-width-2"
      ],
    ).toBe("2px");
  });

  it("scales shadow alpha and blur, and elevation follows", () => {
    const resolved = resolveState(state("base", { shadowStrength: 2 }), themes);
    const sm = parseShadow(resolved.vars["--ds-shadow-sm"]);
    expect(sm.blur).toBe("6px");
    expect(sm.offsetY).toBe("1px");
    expect(sm.color).toBe("#0d0f1234");
    expect(resolved.vars["--ds-elevation-raised"]).toBe(
      resolved.vars["--ds-shadow-sm"],
    );
    expect(resolved.vars["--ds-elevation-overlay"]).toBe(
      resolved.vars["--ds-shadow-lg"],
    );
    const weak = parseShadow(
      resolveState(state("base", { shadowStrength: 0.5 }), themes).vars[
        "--ds-shadow-lg"
      ],
    );
    expect(weak.blur).toBe("12px");
    expect(weak.color).toBe("#0d0f1215");
  });

  it("clamps shadow alpha at 1 (a hard shadow stays opaque)", () => {
    const resolved = resolveState(
      state("quirky", { shadowStrength: 3 }),
      themes,
    );
    expect(parseShadow(resolved.vars["--ds-shadow-sm"]).color).toBe("#1e1b24");
  });

  it("scales space and control heights with density, never below the 24px target", () => {
    const loose = resolveState(state("base", { density: 1.25 }), themes);
    expect(loose.vars["--ds-space-4"]).toBe("1.25rem");
    expect(loose.vars["--ds-layout-gap-md"]).toBe("1.25rem");
    expect(loose.vars["--ds-size-control-md"]).toBe("3.125rem");
    const tight = resolveState(state("base", { density: 0.1 }), themes);
    expect(tight.vars["--ds-size-control-sm"]).toBe("1.5rem");
    expect(tight.vars["--ds-size-control-md"]).toBe("1.5rem");
    expect(tight.vars["--ds-control-md-height"]).toBe("1.5rem");
  });

  it("speeds motion up and down", () => {
    const fast = resolveState(state("base", { motionSpeed: 2 }), themes);
    expect(fast.vars["--ds-duration-100"]).toBe("50ms");
    expect(fast.vars["--ds-motion-duration-normal"]).toBe("100ms");
    const slow = resolveState(state("base", { motionSpeed: 0.5 }), themes);
    expect(slow.vars["--ds-motion-duration-fast"]).toBe("200ms");
  });

  it("rejects values that cannot be meant", () => {
    expect(() => resolveState(state("base", { density: 0 }), themes)).toThrow(
      RangeError,
    );
    expect(() =>
      resolveState(state("base", { radiusScale: -1 }), themes),
    ).toThrow(RangeError);
    expect(() =>
      resolveState(state("base", { borderWidth: -1 }), themes),
    ).toThrow(RangeError);
  });

  it("does not mutate the starting theme", () => {
    const before = JSON.stringify(base);
    resolveState(
      state(
        "base",
        { brand: "#1762b6", density: 0.8, shadowStrength: 2 },
        {
          "--ds-text-primary": "#000000",
        },
      ),
      themes,
    );
    expect(JSON.stringify(base)).toBe(before);
  });
});

describe("overrides", () => {
  it("a primitive override wins over a knob and re-resolves its dependants", () => {
    const resolved = resolveState(
      state(
        "base",
        { brand: "#1762b6" },
        { "--ds-color-brand-600": "#aa0000" },
      ),
      themes,
    );
    expect(resolved.vars["--ds-color-brand-600"]).toBe("#aa0000");
    expect(resolved.vars["--ds-action-primary-bg"]).toBe("#aa0000");
    expect(resolved.vars["--ds-color-brand-700"]).toBe(
      brandRamp("#1762b6")["700"],
    );
    expect(resolved.semanticOverrides).toEqual([]);
  });

  it("a semantic literal wins over a knob and is reported as unrepresentable", () => {
    const resolved = resolveState(
      state(
        "base",
        { brand: "#1762b6" },
        { "--ds-action-primary-bg": "#ff00aa" },
      ),
      themes,
    );
    expect(resolved.vars["--ds-action-primary-bg"]).toBe("#ff00aa");
    expect(resolved.vars["--ds-action-primary-bg-hover"]).not.toBe("#ff00aa");
    expect(resolved.refs["--ds-action-primary-bg"]).toBeUndefined();
    expect(resolved.semanticOverrides).toEqual(["--ds-action-primary-bg"]);
    expect(toDtcg(resolved).unrepresentable).toEqual([
      "--ds-action-primary-bg",
    ]);
  });

  it("a semantic alias override re-points the token", () => {
    const resolved = resolveState(
      state("base", {}, { "--ds-focus-ring": "--ds-color-neutral-900" }),
      themes,
    );
    expect(resolved.vars["--ds-focus-ring"]).toBe(
      base.vars["--ds-color-neutral-900"],
    );
    expect(resolved.refs["--ds-focus-ring"]).toBe("--ds-color-neutral-900");
  });

  it("an override of a shadow-derived elevation wins over the shadow knob", () => {
    const resolved = resolveState(
      state("base", { shadowStrength: 2 }, { "--ds-elevation-raised": "none" }),
      themes,
    );
    expect(resolved.vars["--ds-elevation-raised"]).toBe("none");
    expect(resolved.vars["--ds-elevation-overlay"]).toBe(
      resolved.vars["--ds-shadow-lg"],
    );
  });

  it("ignores, and reports, overrides it cannot apply", () => {
    const resolved = resolveState(
      state(
        "base",
        {},
        {
          "--ds-does-not-exist": "red",
          "--ds-color-brand-600": "--ds-color-neutral-900",
          "--ds-focus-ring": "--ds-nope",
          "--ds-text-primary": "--ds-text-primary",
        },
      ),
      themes,
    );
    expect(resolved.ignored.map((i) => i.key)).toEqual([
      "--ds-does-not-exist",
      "--ds-color-brand-600",
      "--ds-focus-ring",
      "--ds-text-primary",
    ]);
    expect(resolved.vars).toEqual(base.vars);
    expect(resolved.refs).toEqual(base.refs);
  });

  it("detects an alias cycle made of two overrides", () => {
    const resolved = resolveTheme(
      base,
      {},
      {
        "--ds-text-muted": "--ds-text-primary",
        "--ds-text-primary": "--ds-text-muted",
      },
    );
    expect(resolved.ignored).toHaveLength(1);
    expect(resolved.ignored[0].key).toBe("--ds-text-primary");
    expect(resolved.vars["--ds-text-muted"]).toBe(
      base.vars["--ds-text-primary"],
    );
  });
});

describe("contrast", () => {
  it("evaluates the pairs file on a resolved map", () => {
    const report = evaluateContrast(base.vars, spec);
    expect(report.results.length).toBeGreaterThan(100);
    expect(report.failing).toBe(0);
    expect(report.skipped).toBeGreaterThan(0);
  });

  it("matches scripts/contrast.mjs for Base, line for line", () => {
    const script = execFileSync(
      process.execPath,
      [
        join(repo, "scripts/contrast.mjs"),
        join(packageDist, "themes/base.json"),
      ],
      { encoding: "utf8" },
    );
    const expected = script
      .split("\n")
      .filter((line) => /^(ok  |FAIL) /.test(line));

    const report = evaluateContrast(base.vars, spec);
    const actual = report.results.map((r) => {
      const state = r.ok ? "ok  " : "FAIL";
      if (r.kind === "scrim")
        // The script prints the pairs file's own token name ("text.inverse") here.
        return `${state} [base] ${spec.scrim!.fg} on ${r.bg} (strength ${r.strength}) over white = ${r.ratio!.toFixed(2)}:1 (min ${r.min}:1)`;
      return `${state} [base] ${r.fg} (${r.fgValue}) on ${r.bg} (${r.bgValue})${r.tone} = ${r.ratio!.toFixed(2)}:1 (min ${r.min}:1)`;
    });
    expect(expected.length).toBe(actual.length);
    expect(actual).toEqual(expected);
  });

  it("passes for every shipped theme, as tokens:check does", () => {
    for (const name of names)
      expect(evaluateContrast(themes[name].vars, spec).failing).toBe(0);
  });

  it("flags a light brand colour", () => {
    const resolved = resolveState(state("base", { brand: "#facc15" }), themes);
    const report = evaluateContrast(resolved.vars, spec);
    expect(report.failing).toBeGreaterThan(0);
    const failing = report.results.filter((r) => !r.ok);
    expect(failing.some((r) => r.fg === "action-primary-fg")).toBe(true);
  });

  it("reports a missing token and an unsupported colour instead of throwing", () => {
    const vars: VarMap = { ...base.vars, "--ds-text-primary": "#12345678" };
    delete vars["--ds-surface-canvas"];
    const report = evaluateContrast(vars, spec);
    expect(report.results.some((r) => r.error === "token missing")).toBe(true);
    expect(
      report.results.some((r) => r.error?.includes("unsupported color")),
    ).toBe(true);
  });
});

// Flattens a DTCG document into var names and values (the way the build names tokens).
const flatten = (
  node: object,
  path: string[] = [],
  out: VarMap = {},
): VarMap => {
  const record = node as Record<string, unknown>;
  if ("$value" in record) {
    const value = record.$value;
    let text: string | number;
    if (Array.isArray(value)) text = `cubic-bezier(${value.join(", ")})`;
    else if (value && typeof value === "object") {
      const s = value as Record<string, string>;
      text = `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`;
    } else text = value as string | number;
    out[`--ds-${path.join("-")}`] = text;
    return out;
  }
  for (const [key, child] of Object.entries(record))
    if (!key.startsWith("$") && child && typeof child === "object")
      flatten(child, [...path, key], out);
  return out;
};

const normalise = (vars: VarMap): VarMap =>
  Object.fromEntries(
    Object.entries(vars)
      .map(([key, value]): [string, string | number] => [
        key,
        typeof value === "string" ? value.replace(/['"]/g, "") : value,
      ])
      .sort(([a], [b]) => a.localeCompare(b)),
  );

const readDtcg = (name: ThemeName): VarMap => {
  const out: VarMap = {};
  for (const file of ["color", "dimension", "effects", "typography"]) {
    const json = JSON.parse(
      readFileSync(join(repo, "tokens/themes", name, `${file}.json`), "utf8"),
    );
    flatten(json, [], out);
  }
  return out;
};

const at = (node: object, ...path: string[]): unknown =>
  path.reduce<unknown>(
    (current, key) => (current as Record<string, unknown>)[key],
    node,
  );

const emitted = (state_: PlaygroundState): VarMap => {
  const { files } = toDtcg(resolveState(state_, themes));
  const out: VarMap = {};
  for (const file of Object.values(files)) flatten(file, [], out);
  return out;
};

describe("DTCG output", () => {
  it.each(names)(
    "an unchanged %s state has the values of its tokens/themes folder",
    (name) => {
      // The shipped scrim is `#0d0f12b3` in DTCG and `rgba()` in the JSON map.
      expect(normalise(emitted(state(name)))).toEqual(
        normalise(readDtcg(name)),
      );
    },
  );

  it("has the four files of a theme folder", () => {
    const { files } = toDtcg(resolveState(state("base"), themes));
    expect(Object.keys(files)).toEqual([
      "color.json",
      "dimension.json",
      "effects.json",
      "typography.json",
    ]);
    const typography = files["typography.json"];
    expect(at(typography, "font", "weight", "$type")).toBe("fontWeight");
    expect(at(typography, "font", "weight", "bold", "$value")).toBe(700);
    expect(at(typography, "font", "family", "heading", "$value")).toBe(
      "Inter, system-ui, sans-serif",
    );
    const dimension = files["dimension.json"];
    expect(at(dimension, "space", "1-5", "$value")).toBe("0.375rem");
    expect(at(dimension, "size", "target", "min", "$value")).toBe("1.5rem");
    expect(at(dimension, "size", "sidebar", "$value")).toBe("16rem");
    const effects = files["effects.json"];
    expect(at(effects, "shadow", "sm", "$value")).toEqual({
      color: "#0d0f121a",
      offsetX: "0px",
      offsetY: "1px",
      blur: "3px",
      spread: "0px",
    });
    expect(at(effects, "easing", "in-out", "$value")).toEqual([0.4, 0, 0.2, 1]);
  });

  it("carries knob changes and the accent scale, but never elevation or semantics", () => {
    const out = emitted(
      state("base", { brand: "#1762b6", accent: "#e11d48", radiusScale: 2 }),
    );
    expect(out["--ds-color-brand-600"]).toBe("#1762b6");
    expect(out["--ds-color-accent-600"]).toBeDefined();
    expect(out["--ds-radius-md"]).toBe("1rem");
    expect(Object.keys(out).some((k) => k.includes("elevation"))).toBe(false);
    expect(Object.keys(out).some((k) => k.startsWith("--ds-action-"))).toBe(
      false,
    );
  });
});

describe("CSS output", () => {
  const declarations = (css: string): Map<string, string> => {
    const map = new Map<string, string>();
    for (const line of css.split("\n")) {
      const match = /^\s*(--ds-[\w-]+):\s*(.+?);(?:\s*\/\*\*.*\*\/)?\s*$/.exec(
        line,
      );
      if (match) map.set(match[1], match[2]);
    }
    return map;
  };

  it.each(names)("an unchanged %s state matches its shipped css", (name) => {
    const shipped = readFileSync(
      join(packageDist, `themes/${name}.css`),
      "utf8",
    );
    const css = toCss(resolveState(state(name), themes));
    // Same declarations and values. The order differs in one place only (the shipped
    // file lists space-1-5 after space-1, the var map after space-24).
    expect(Object.fromEntries(declarations(css))).toEqual(
      Object.fromEntries(declarations(shipped)),
    );
    expect(declarations(css).size).toBe(declarations(shipped).size);
    expect(css).toMatch(/^\/\*\*\n \* Do not edit directly/);
    expect(css).toMatch(/\n:root \{\n/);
  });

  it("writes semantic vars as references and overridden ones as literals", () => {
    const css = toCss(
      resolveState(
        state("base", { brand: "#1762b6" }, { "--ds-text-muted": "#123456" }),
        themes,
      ),
    );
    const map = declarations(css);
    expect(map.get("--ds-color-brand-600")).toBe("#1762b6");
    expect(map.get("--ds-action-primary-bg")).toBe("var(--ds-color-brand-600)");
    expect(map.get("--ds-text-muted")).toBe("#123456");
    expect(map.get("--ds-elevation-raised")).toBe("0px 1px 3px 0px #0d0f121a");
  });
});
