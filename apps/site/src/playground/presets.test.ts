import { describe, expect, it } from "vitest";
import { converter, parse } from "culori";
import { builderContent } from "../content/builder";
import { themeMaps as themes } from "./data";
import { resolveState } from "./engine";
import {
  applyDims,
  outlineWidths,
  presetChoices,
  presetDimensions,
  recommend,
  shuffle,
  suggestHighlights,
  withPreset,
} from "./presets";
import { defaultState, parseState, sanitiseKnobs, startFrom } from "./state";
import type { PlaygroundState, ThemeName, VarMap } from "./types";

const names = Object.keys(themes) as ThemeName[];
const oklch = converter("oklch");

/** A seeded random source, so a shuffle test is repeatable. */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const remOf = (value: string | number): number => parseFloat(String(value));
const vars = (state: PlaygroundState): VarMap =>
  resolveState(state, themes).vars;

/** The vars of one dimension, for comparing two resolved states. */
const pick = (map: VarMap, prefixes: string[]): VarMap =>
  Object.fromEntries(
    Object.entries(map).filter(([key]) =>
      prefixes.some((p) => key.startsWith(p)),
    ),
  );

const dimensionPrefixes: Record<string, string[]> = {
  type: ["--ds-font-size-", "--ds-font-weight-", "--ds-font-line-height-"],
  shape: ["--ds-radius-"],
  spacing: ["--ds-space-", "--ds-size-control-", "--ds-size-icon-"],
  depth: ["--ds-shadow-", "--ds-elevation-"],
  motion: ["--ds-duration-", "--ds-easing-"],
};

describe("presets: one choice, the same values from every starting look", () => {
  for (const dim of presetDimensions) {
    for (const choice of presetChoices[dim]) {
      it(`${dim} / ${choice.id} gives identical values from all four looks`, () => {
        const results = names.map((start) =>
          pick(
            vars(withPreset(startFrom(start), dim, choice.from)),
            dimensionPrefixes[dim]!,
          ),
        );
        for (const result of results) expect(result).toEqual(results[0]);
      });
    }
  }

  it("takes the values from the named look", () => {
    const rounded = vars(withPreset(startFrom("base"), "shape", "nature"));
    expect(rounded["--ds-radius-md"]).toBe(
      themes.nature.vars["--ds-radius-md"],
    );
    // Nothing else moved.
    expect(rounded["--ds-space-4"]).toBe(themes.base.vars["--ds-space-4"]);
    expect(rounded["--ds-color-brand-600"]).toBe(
      themes.base.vars["--ds-color-brand-600"],
    );
  });

  it("re-resolves roles that point at a preset value (elevation follows shadows)", () => {
    const hard = vars(withPreset(startFrom("base"), "depth", "quirky"));
    expect(hard["--ds-elevation-raised"]).toBe(
      themes.quirky.vars["--ds-shadow-sm"],
    );
  });

  it("leaves a dimension that is not set following the starting look", () => {
    const state = withPreset(startFrom("corporate"), "spacing", "nature");
    const out = vars(state);
    expect(out["--ds-radius-md"]).toBe(themes.corporate.vars["--ds-radius-md"]);
    expect(out["--ds-space-4"]).toBe(themes.nature.vars["--ds-space-4"]);
  });

  it("clears a preset with undefined", () => {
    const state = withPreset(
      withPreset(startFrom("base"), "shape", "quirky"),
      "shape",
      undefined,
    );
    expect(state.dims).toEqual({});
  });
});

describe("presets: a state with no preset equals its starting look", () => {
  for (const start of names) {
    it(`${start}`, () => {
      expect(vars(startFrom(start))).toEqual(themes[start].vars);
      expect(applyDims(themes[start], themes, {})).toBe(themes[start]);
    });
  }

  it("is also true when every dimension is set to the starting look", () => {
    for (const start of names) {
      const dims = Object.fromEntries(presetDimensions.map((d) => [d, start]));
      expect(vars({ ...startFrom(start), dims })).toEqual(themes[start].vars);
    }
  });

  it("the default state resolves to the base look", () => {
    expect(vars(defaultState)).toEqual(themes.base.vars);
  });
});

describe("presets: Flat shadows", () => {
  it("removes every shadow, from any starting look, and elevation follows", () => {
    for (const start of names) {
      const out = vars(withPreset(startFrom(start), "depth", "flat"));
      for (const key of [
        "--ds-shadow-sm",
        "--ds-shadow-lg",
        "--ds-elevation-raised",
        "--ds-elevation-overlay",
      ])
        expect(out[key], `${start} ${key}`).toBe("0px 0px 0px 0px #00000000");
    }
  });

  it("survives the stored-state reader, and an unknown depth does not", () => {
    const flat = withPreset(startFrom("base"), "depth", "flat");
    expect(parseState(JSON.parse(JSON.stringify(flat)))?.dims.depth).toBe(
      "flat",
    );
    expect(
      parseState({ ...flat, dims: { depth: "wet", shape: "flat" } })?.dims,
    ).toEqual({});
  });
});

describe("presets: controls are never under the 24px target", () => {
  const target = (map: VarMap) => remOf(map["--ds-size-target-min"]!) * 16;

  it("holds for every spacing choice, from every look, with the densest fine-tune", () => {
    for (const start of names) {
      for (const choice of presetChoices.spacing) {
        for (const density of [undefined, 0.5, 0.1, 0.01]) {
          const state = withPreset(startFrom(start), "spacing", choice.from);
          const map = vars({
            ...state,
            knobs: density === undefined ? {} : { density },
          });
          for (const size of ["sm", "md"])
            expect(
              remOf(map[`--ds-size-control-${size}`]!) * 16,
              `${start} ${choice.id} ${density} ${size}`,
            ).toBeGreaterThanOrEqual(target(map));
        }
      }
    }
    expect(24).toBe(remOf(themes.base.vars["--ds-size-target-min"]!) * 16);
  });

  it("holds for every shuffled mix", () => {
    const random = seeded(7);
    for (let i = 0; i < 200; i++) {
      const start = names[i % 4]!;
      const state = shuffle(startFrom(start), { random });
      const map = vars(state);
      for (const size of ["sm", "md"])
        expect(
          remOf(map[`--ds-size-control-${size}`]!) * 16,
        ).toBeGreaterThanOrEqual(24);
    }
  });
});

describe("type scale fine-tune", () => {
  it("scales sizes and never goes under 12px", () => {
    const map = vars({ ...startFrom("base"), knobs: { typeScale: 0.1 } });
    const sizes = Object.entries(map).filter(([k]) =>
      k.startsWith("--ds-font-size-"),
    );
    expect(sizes.length).toBeGreaterThan(0);
    for (const [key, value] of sizes)
      expect(remOf(value) * 16, key).toBeGreaterThanOrEqual(12);
  });

  it("makes larger sizes larger and leaves a neutral value alone", () => {
    const big = vars({ ...startFrom("base"), knobs: { typeScale: 1.25 } });
    expect(remOf(big["--ds-font-size-base"]!)).toBeCloseTo(
      remOf(themes.base.vars["--ds-font-size-base"]!) * 1.25,
      3,
    );
    expect(vars({ ...startFrom("base"), knobs: { typeScale: 1 } })).toEqual(
      themes.base.vars,
    );
  });

  it("is kept by the stored-state reader only when positive", () => {
    expect(sanitiseKnobs({ typeScale: 1.1 })).toEqual({ typeScale: 1.1 });
    expect(sanitiseKnobs({ typeScale: 0 })).toEqual({});
    expect(sanitiseKnobs({ typeScale: "big" })).toEqual({});
  });

  it("stacks on a preset: fine-tune applies on top", () => {
    const state: PlaygroundState = {
      ...withPreset(startFrom("base"), "type", "nature"),
      knobs: { typeScale: 1.1 },
    };
    expect(remOf(vars(state)["--ds-font-size-base"]!)).toBeCloseTo(
      remOf(themes.nature.vars["--ds-font-size-base"]!) * 1.1,
      3,
    );
  });
});

describe("outline widths", () => {
  it("thin and bold are the border-width fine-tune", () => {
    const bold = vars({
      ...startFrom("base"),
      knobs: { borderWidth: outlineWidths.bold },
    });
    expect(bold["--ds-border-width-1"]).toBe("2px");
  });
});

describe("choices match the content file (names and order)", () => {
  const nameOf = (stepId: string, group: number) =>
    builderContent.steps
      .find((s) => s.id === stepId)!
      .groups[group]!.choices.map((c) => c.name);
  const idToName = (id: string) =>
    id === "extraRound" ? "Extra round" : id[0]!.toUpperCase() + id.slice(1);

  it.each([
    ["shape", "shape", 0],
    ["spacing", "spacing", 0],
    ["depth", "depth", 0],
    ["motion", "depth", 1],
    ["type", "typography", 1],
  ] as const)("%s", (dim, stepId, group) => {
    expect(presetChoices[dim].map((c) => idToName(c.id))).toEqual(
      nameOf(stepId, group),
    );
  });
});

describe("the three questions", () => {
  it("maps mood to a starting look, room to spacing and corners to shape", () => {
    const result = recommend({ mood: "bold", room: "airy", corners: "sharp" });
    expect(result.start).toBe("quirky");
    expect(result.dims).toEqual({ spacing: "nature", shape: "corporate" });
  });

  it("gives every answer a reason in plain text", () => {
    const { mood, room, corners } = builderContent.questions;
    for (const m of Object.keys(mood.options))
      for (const r of Object.keys(room.options))
        for (const c of Object.keys(corners.options)) {
          const result = recommend({
            mood: m as keyof typeof mood.options,
            room: r as keyof typeof room.options,
            corners: c as keyof typeof corners.options,
          });
          expect(result.reason).toContain(
            mood.options[m as keyof typeof mood.options].reason,
          );
          expect(result.reason.length).toBeGreaterThan(30);
          expect(themes[result.start]).toBeDefined();
        }
  });

  it("the recommendation applies cleanly and gives the chosen spacing", () => {
    const result = recommend({
      mood: "calm",
      room: "airy",
      corners: "rounded",
    });
    const map = vars({ ...startFrom(result.start), dims: result.dims });
    expect(map["--ds-space-4"]).toBe(themes.nature.vars["--ds-space-4"]);
    expect(map["--ds-radius-md"]).toBe(themes.nature.vars["--ds-radius-md"]);
  });
});

describe("highlight colour suggestions", () => {
  const hue = (hex: string) => oklch(parse(hex)!).h ?? 0;
  const gap = (a: number, b: number) => {
    const d = Math.abs(a - b) % 360;
    return Math.min(d, 360 - d);
  };

  it("gives four valid, distinct colours with other hues than the brand colour", () => {
    for (const brand of [
      "#3366cc",
      "#cc3333",
      "#2e8b57",
      "#e6b800",
      "#7a3db8",
    ]) {
      const out = suggestHighlights(brand);
      expect(out).toHaveLength(4);
      expect(new Set(out).size).toBe(4);
      for (const hex of out) {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        expect(gap(hue(hex), hue(brand))).toBeGreaterThan(15);
      }
    }
  });

  it("still gives four for a grey brand colour", () => {
    const out = suggestHighlights("#595959");
    expect(new Set(out).size).toBe(4);
  });

  it("rejects something that is not a colour", () => {
    expect(() => suggestHighlights("not a colour")).toThrow();
  });
});

describe("shuffle", () => {
  const fullState = (): PlaygroundState => ({
    ...startFrom("corporate"),
    dims: { shape: "quirky", colour: "nature" },
    fonts: { heading: "My Font" },
    knobs: {
      brand: "#3366cc",
      accent: "#cc3333",
      neutral: { hue: 40 },
      headingFont: "fraunces",
      radiusScale: 1.4,
      density: 0.8,
    },
    overrides: { "--ds-action-primary-bg": "#112233" },
  });

  it("keeps colours, fonts and overrides, and clears the fine-tunes it replaces", () => {
    const before = fullState();
    const after = shuffle(before, { random: seeded(3) });
    expect(after.start).toBe(before.start);
    expect(after.dims.colour).toBe("nature");
    expect(after.knobs.brand).toBe("#3366cc");
    expect(after.knobs.accent).toBe("#cc3333");
    expect(after.knobs.neutral).toEqual({ hue: 40 });
    expect(after.knobs.headingFont).toBe("fraunces");
    expect(after.knobs.radiusScale).toBeUndefined();
    expect(after.knobs.density).toBeUndefined();
    expect(after.fonts).toEqual(before.fonts);
    expect(after.overrides).toEqual(before.overrides);
  });

  it("always gives a different mix, and a valid state", () => {
    const random = seeded(11);
    let state = startFrom("base");
    for (let i = 0; i < 300; i++) {
      const next = shuffle(state, { random });
      const differs = presetDimensions.some(
        (dim) =>
          (next.dims[dim] ?? next.start) !== (state.dims[dim] ?? state.start),
      );
      expect(differs, `step ${i}`).toBe(true);
      expect(() => resolveState(next, themes)).not.toThrow();
      expect(parseState(JSON.parse(JSON.stringify(next)))?.dims).toEqual(
        next.dims,
      );
      state = next;
    }
  });

  it("guarantees a change even when the random source repeats", () => {
    const first = shuffle(startFrom("base"), { random: () => 0 });
    const second = shuffle(first, { random: () => 0 });
    expect(second.dims).not.toEqual(first.dims);
  });

  it("changes the starting look and drops the colours only when asked", () => {
    const before = fullState();
    const after = shuffle(before, { colours: true, random: seeded(5) });
    expect(after.start).not.toBe(before.start);
    expect(after.knobs.brand).toBeUndefined();
    expect(after.knobs.accent).toBeUndefined();
    expect(after.knobs.neutral).toBeUndefined();
    expect(after.dims.colour).toBeUndefined();
    expect(after.knobs.headingFont).toBe("fraunces");
  });

  it("does not change the colours of the resolved result when colours are kept", () => {
    const before = fullState();
    const after = shuffle(before, { random: seeded(9) });
    const colour = (s: PlaygroundState) => pick(vars(s), ["--ds-color-"]);
    expect(colour(after)).toEqual(colour(before));
  });
});
