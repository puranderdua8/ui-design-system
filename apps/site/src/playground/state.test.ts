import { describe, expect, it } from "vitest";
import { evaluateContrast } from "./contrast";
import { contrastSpec, themeMaps } from "./data";
import {
  asPickerColour,
  defaultState,
  groupSemantic,
  parseState,
  previewVars,
  safeResolve,
  sanitiseKnobs,
  semanticKeys,
  startFrom,
  withKnobs,
  withOverride,
} from "./state";

describe("parseState", () => {
  it("round-trips a state through JSON", () => {
    const state = {
      start: "nature" as const,
      knobs: { brand: "#1762b6", radiusScale: 2, neutral: { hue: 30 } },
      overrides: { "--ds-action-primary-bg": "#112233" },
    };
    expect(parseState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it.each([null, 3, "x", [], { start: "nope" }, { knobs: {} }])(
    "rejects %j",
    (input) => {
      expect(parseState(input)).toBeNull();
    },
  );

  it("drops values the engine would reject instead of throwing later", () => {
    const parsed = parseState({
      start: "base",
      knobs: {
        brand: "red",
        accent: "#e11d48",
        radiusScale: 0,
        density: -1,
        borderWidth: -2,
        headingFont: "comic",
        bodyFont: "plex",
        neutral: { hue: "x", chroma: -1 },
      },
      overrides: { "--ds-x": "1px", notDs: "1px", "--ds-y": 4, "--ds-z": "" },
    });
    expect(parsed?.knobs).toEqual({ accent: "#e11d48", bodyFont: "plex" });
    expect(parsed?.overrides).toEqual({ "--ds-x": "1px" });
    expect(safeResolve(parsed!, themeMaps).error).toBeUndefined();
  });
});

describe("safeResolve", () => {
  it("resolves a valid state", () => {
    const { resolved, error } = safeResolve(
      { ...defaultState, knobs: { brand: "#1762b6" } },
      themeMaps,
    );
    expect(error).toBeUndefined();
    expect(resolved.vars["--ds-action-primary-bg"]).toBe("#1762b6");
  });

  it("falls back to the starting theme instead of throwing", () => {
    const { resolved, error } = safeResolve(
      { start: "nature", knobs: { radiusScale: -1 }, overrides: {} },
      themeMaps,
    );
    expect(error).toMatch(/radiusScale/);
    expect(resolved.vars).toEqual(themeMaps.nature.vars);
  });
});

describe("state edits", () => {
  it("sets and clears a knob", () => {
    const set = withKnobs(defaultState, { brand: "#1762b6", density: 1.25 });
    expect(set.knobs).toEqual({ brand: "#1762b6", density: 1.25 });
    expect(withKnobs(set, { brand: undefined }).knobs).toEqual({
      density: 1.25,
    });
  });

  it("ignores a knob value the engine rejects", () => {
    expect(withKnobs(defaultState, { radiusScale: 0 }).knobs).toEqual({});
    expect(withKnobs(defaultState, { brand: "blue" }).knobs).toEqual({});
  });

  it("sets and removes an override", () => {
    const set = withOverride(defaultState, "--ds-text-primary", "#000000");
    expect(set.overrides).toEqual({ "--ds-text-primary": "#000000" });
    expect(withOverride(set, "--ds-text-primary", "").overrides).toEqual({});
  });

  it("starting from a theme drops knobs and overrides", () => {
    expect(startFrom("quirky")).toEqual({
      start: "quirky",
      knobs: {},
      overrides: {},
    });
  });

  it("only a 6-digit hex goes to a colour picker", () => {
    expect(asPickerColour("#AABBCC")).toBe("#aabbcc");
    expect(asPickerColour("#aabbcc80")).toBeNull();
    expect(asPickerColour("rgba(0, 0, 0, 0.7)")).toBeNull();
    expect(asPickerColour(400)).toBeNull();
  });

  it("sanitiseKnobs keeps a zero border width", () => {
    expect(sanitiseKnobs({ borderWidth: 0 })).toEqual({ borderWidth: 0 });
  });
});

describe("token groups", () => {
  it("lists every semantic var of a theme once, grouped", () => {
    const keys = semanticKeys(themeMaps.base);
    const groups = groupSemantic(keys);
    expect(keys.length).toBeGreaterThan(50);
    expect(groups.length).toBeGreaterThan(5);
    expect(groups.flatMap((group) => group.keys).sort()).toEqual(
      [...keys].sort(),
    );
    expect(keys).toContain("--ds-action-primary-bg");
    expect(keys).toContain("--ds-elevation-raised");
    // Primitives are not semantic.
    expect(keys).not.toContain("--ds-color-brand-600");
  });

  it("every theme has the same semantic keys (the contract)", () => {
    const base = semanticKeys(themeMaps.base).sort();
    for (const theme of Object.values(themeMaps))
      expect(semanticKeys(theme).sort()).toEqual(base);
  });
});

describe("previewVars", () => {
  it("swaps the family name for the next/font variable, fallbacks kept", () => {
    const vars = previewVars(themeMaps.nature.vars);
    expect(vars["--ds-font-family-heading"]).toBe(
      "var(--font-fraunces), Georgia, serif",
    );
    expect(vars["--ds-font-family-body"]).toBe(
      "var(--font-nunito), system-ui, sans-serif",
    );
    expect(vars["--ds-type-h1-font-family"]).toBe(
      "var(--font-fraunces), Georgia, serif",
    );
  });

  it("changes only family vars", () => {
    const before = themeMaps.corporate.vars;
    const after = previewVars(before);
    for (const key of Object.keys(before))
      if (!key.includes("font-family")) expect(after[key]).toBe(before[key]);
  });

  it("leaves an unknown family alone", () => {
    const vars = previewVars({
      "--ds-font-family-body": "Comic Sans, cursive",
    });
    expect(vars["--ds-font-family-body"]).toBe("Comic Sans, cursive");
  });
});

describe("contrast on a playground state", () => {
  it("passes for an untouched start and fails for a light brand colour", () => {
    const ok = safeResolve(startFrom("corporate"), themeMaps).resolved;
    expect(evaluateContrast(ok.vars, contrastSpec).failing).toBe(0);
    const bad = safeResolve(
      withKnobs(startFrom("corporate"), { brand: "#facc15" }),
      themeMaps,
    ).resolved;
    expect(evaluateContrast(bad.vars, contrastSpec).failing).toBeGreaterThan(0);
  });
});
