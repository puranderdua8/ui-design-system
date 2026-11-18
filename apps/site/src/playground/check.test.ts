import { describe, expect, it } from "vitest";
import { builderContent } from "../content/builder";
import { detailsLine, fixable, fixAll, shownText } from "./check";
import { contrastSpec as spec, themeMaps as themes } from "./data";
import { analyse } from "./explain";
import { defaultState } from "./state";
import type { PlaygroundState } from "./types";

const ctx = { themes, spec };
const withKnobs = (knobs: PlaygroundState["knobs"]): PlaygroundState => ({
  ...defaultState,
  knobs: { ...defaultState.knobs, ...knobs },
});

describe("fixAll (spec 4.5)", () => {
  it("does nothing when everything is readable", () => {
    const result = fixAll(defaultState, ctx);
    expect(result.changed).toBe(false);
    expect(result.state).toBe(defaultState);
    expect(result.totalBefore).toBe(0);
  });

  it("fixes a pale brand colour and a pale highlight together, as one new state", () => {
    const state = withKnobs({ brand: "#f5e663", accent: "#fff200" });
    const before = analyse(state, themes, spec);
    expect(before.report.failing).toBeGreaterThan(0);
    const result = fixAll(state, ctx);
    expect(result.changed).toBe(true);
    expect(result.totalBefore).toBe(before.report.failing);
    expect(result.totalAfter).toBeLessThan(result.totalBefore);
    expect(analyse(result.state, themes, spec).report.failing).toBe(
      result.totalAfter,
    );
    // The original state is not changed (undo needs it intact).
    expect(state.knobs.brand).toBe("#f5e663");
  });

  it("never leaves more failures than it found, for pale colours of several hues", () => {
    const pale = ["#f5e663", "#ffd6e0", "#d6ffe0", "#d6e4ff", "#ffffff"];
    for (const brand of pale) {
      const result = fixAll(withKnobs({ brand }), ctx);
      expect(result.totalAfter, brand).toBeLessThanOrEqual(result.totalBefore);
    }
  });
});

describe("Check text", () => {
  it("only an unnamed cause cannot be fixed", () => {
    expect(fixable("brand")).toBe(true);
    expect(fixable("other")).toBe(false);
  });

  it("says how many places are shown, or that there are none", () => {
    expect(shownText(0)).toBe(builderContent.check.noPlace);
    expect(shownText(1)).toBe("Showing 1 place in the preview.");
    expect(shownText(14)).toBe("Showing 14 places in the preview.");
  });

  it("writes a technical line with the ratio and the minimum", () => {
    const line = detailsLine({
      kind: "pair",
      fg: "text-primary",
      bg: "surface-canvas",
      fgValue: "#000",
      bgValue: "#fff",
      tone: "",
      ratio: 2.5,
      min: 4.5,
      ok: false,
    });
    expect(line).toBe(
      "text-primary on surface-canvas: 2.50 to 1, needs 4.5 to 1",
    );
  });
});
