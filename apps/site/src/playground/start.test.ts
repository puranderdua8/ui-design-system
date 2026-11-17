import { describe, expect, it } from "vitest";
import { themeMaps } from "./data";
import { resolveState } from "./engine";
import {
  currentFeel,
  dominantColour,
  feelIds,
  parseBrand,
  readabilityLine,
  shadeStrip,
  withBrand,
  withFeel,
  withLook,
} from "./start";
import { defaultState, startFrom } from "./state";

const resolve = (state = defaultState) => resolveState(state, themeMaps).vars;

describe("parseBrand", () => {
  it("accepts a code with or without the hash, short or long, in any case", () => {
    expect(parseBrand("#3366CC")).toEqual({ ok: true, hex: "#3366cc" });
    expect(parseBrand("  3366cc ")).toEqual({ ok: true, hex: "#3366cc" });
    expect(parseBrand("#36c")).toEqual({ ok: true, hex: "#3366cc" });
  });

  it("refuses anything else with a sentence and a suggestion", () => {
    for (const bad of [
      "",
      "blue",
      "#12",
      "#3366cc80",
      "rgba(1, 2, 3, 0.5)",
      "#fff; } body { display: none",
      "url(javascript:alert(1))",
    ]) {
      const result = parseBrand(bad);
      expect(result.ok, bad).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain("did not work");
        expect(result.message).toContain("#3366cc");
      }
    }
  });
});

describe("dominantColour", () => {
  const solid = (r: number, g: number, b: number, count: number, a = 255) =>
    Array.from({ length: count }, () => [r, g, b, a]).flat();

  it("returns the colour of a plain picture", () => {
    expect(dominantColour(solid(51, 102, 204, 50))).toBe("#3366cc");
  });

  it("prefers the colourful subject over a bigger white background", () => {
    const pixels = [...solid(255, 255, 255, 60), ...solid(200, 40, 40, 40)];
    expect(dominantColour(pixels)).toBe("#c82828");
  });

  it("skips transparent pixels and gives null for an empty picture", () => {
    expect(dominantColour(solid(10, 20, 30, 20, 0))).toBeNull();
    expect(dominantColour([])).toBeNull();
  });
});

describe("withBrand", () => {
  it("restyles the main button's colour and keeps the rest of the state", () => {
    const before = resolve();
    const next = withBrand(defaultState, "#c0392b");
    const after = resolve(next);
    expect(next.knobs.brand).toBe("#c0392b");
    expect(after["--ds-color-brand-600"]).toBe("#c0392b");
    expect(after["--ds-action-primary-bg"]).not.toBe(
      before["--ds-action-primary-bg"],
    );
    expect(withBrand(next, undefined).knobs.brand).toBeUndefined();
  });

  it("keeps a background tinted to the brand following the brand", () => {
    const first = withFeel(withBrand(defaultState, "#c0392b"), "tinted");
    const hue1 = first.knobs.neutral?.hue;
    const second = withBrand(first, "#2980b9");
    expect(second.knobs.neutral?.hue).not.toBe(hue1);
    expect(currentFeel(second)).toBe("tinted");
  });
});

describe("withLook", () => {
  it("keeps the brand and highlight colours and starts the rest again", () => {
    const state = {
      ...withBrand(startFrom("base"), "#c0392b"),
      knobs: { brand: "#c0392b", accent: "#2980b9", radiusScale: 2 },
    };
    const next = withLook(state, "nature");
    expect(next.start).toBe("nature");
    expect(next.knobs).toEqual({ brand: "#c0392b", accent: "#2980b9" });
  });
});

describe("background feel", () => {
  it("round-trips every feel", () => {
    const base = withBrand(defaultState, "#c0392b");
    for (const feel of feelIds)
      expect(currentFeel(withFeel(base, feel)), feel).toBe(feel);
    expect(currentFeel(withFeel(base, undefined))).toBeUndefined();
  });

  it("changes the greys, and plain neutral has no tint", () => {
    const warm = resolve(withFeel(defaultState, "warm"));
    const neutral = resolve(withFeel(defaultState, "neutral"));
    expect(warm["--ds-color-neutral-100"]).not.toBe(
      neutral["--ds-color-neutral-100"],
    );
    const hex = String(neutral["--ds-color-neutral-500"]);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!)).toBeLessThanOrEqual(2);
  });
});

describe("readabilityLine", () => {
  it("says a readable brand is readable and a pale one is not", () => {
    const dark = readabilityLine(
      resolve(withBrand(defaultState, "#1d3f8f")),
      "brand",
    );
    const pale = readabilityLine(
      resolve(withBrand(defaultState, "#f5e663")),
      "brand",
    );
    expect(dark).toContain("easy to read");
    expect(pale).toContain("hard to read");
  });

  it("covers highlight and background too", () => {
    expect(readabilityLine(resolve(), "highlight")).toMatch(/read/);
    expect(readabilityLine(resolve(), "background")).toMatch(/read/);
  });
});

describe("shadeStrip", () => {
  it("lists ten shades, with the brand colour at 600", () => {
    const strip = shadeStrip(resolve(withBrand(defaultState, "#c0392b")));
    expect(strip).toHaveLength(10);
    expect(strip.find((s) => s.step === "600")!.hex).toBe("#c0392b");
  });
});
