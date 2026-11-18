import { describe, expect, it } from "vitest";
import { themeMaps } from "./data";
import {
  fontName,
  guideColours,
  guideDepths,
  guideMotions,
  guideShapes,
  guideSpaces,
  readSummary,
} from "./guide";

const vars = themeMaps.base.vars;

describe("style guide data (S58)", () => {
  it("names every colour with a hex value and a place to use it", () => {
    const colours = guideColours(vars);
    expect(colours.length).toBeGreaterThanOrEqual(8);
    for (const colour of colours) {
      expect(colour.name).not.toMatch(/--ds-/);
      expect(colour.hex).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);
      expect(colour.useFor).not.toBe("");
    }
    expect(colours[0]).toMatchObject({ name: "Main colour", hex: "#595959" });
  });

  it("gives shape, spacing, shadow and motion samples for a shipped theme", () => {
    expect(guideShapes(vars)).toHaveLength(3);
    expect(guideSpaces(vars)).toHaveLength(3);
    expect(guideDepths(vars)).toHaveLength(2);
    expect(guideMotions(vars)).toEqual([
      { name: "Quick", value: "100ms" },
      { name: "Everyday", value: "200ms" },
    ]);
  });

  it("drops any value the grammar refuses", () => {
    const bad = {
      ...vars,
      "--ds-action-primary-bg": "red; } body { display: none",
      "--ds-radius-card": "1rem; color: red",
      "--ds-elevation-raised": "url(https://example.com/x)",
      "--ds-motion-duration-fast": "fast",
    };
    expect(guideColours(bad).map((c) => c.name)).not.toContain("Main colour");
    expect(guideShapes(bad).map((s) => s.name)).not.toContain("Cards");
    expect(guideDepths(bad).map((s) => s.name)).not.toContain("Raised");
    expect(guideMotions(bad).map((s) => s.name)).not.toContain("Quick");
  });

  it("reads a font's name and refuses one that is not plain", () => {
    expect(fontName("Inter, system-ui, sans-serif")).toBe("Inter");
    expect(fontName("'Space Grotesk', sans-serif")).toBe("Space Grotesk");
    expect(fontName("a;b")).toBeNull();
    expect(fontName(undefined)).toBeNull();
  });

  it("says how easy it is to read", () => {
    expect(readSummary(0)).toMatch(/easy to read/);
    expect(readSummary(3)).toMatch(/3 colour pairs/);
  });
});
