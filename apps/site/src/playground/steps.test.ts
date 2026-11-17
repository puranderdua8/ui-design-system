import { describe, expect, it } from "vitest";
import { builderContent } from "../content/builder";
import { withKnobs, startFrom } from "./state";
import { withPreset } from "./presets";
import {
  currentChoice,
  getStep,
  isStepId,
  neighbours,
  stepHref,
  stepIds,
} from "./steps";

describe("step URLs", () => {
  it("has one URL per step, in the order of the content file", () => {
    expect(stepIds).toEqual(builderContent.steps.map((s) => s.id));
    expect(stepIds.map(stepHref)).toEqual([
      "/build/start",
      "/build/colour",
      "/build/typography",
      "/build/shape",
      "/build/spacing",
      "/build/depth",
      "/build/check",
      "/build/use",
    ]);
  });

  it("only knows its own steps", () => {
    expect(isStepId("shape")).toBe(true);
    expect(isStepId("studio")).toBe(false);
    expect(isStepId("../x")).toBe(false);
    expect(isStepId(undefined)).toBe(false);
  });

  it("knows the neighbours of a step", () => {
    expect(neighbours("start")).toEqual({
      previous: undefined,
      next: "colour",
    });
    expect(neighbours("use")).toEqual({ previous: "check", next: undefined });
    expect(neighbours("shape")).toEqual({
      previous: "typography",
      next: "spacing",
    });
  });
});

describe("the current choice in words", () => {
  it("names the starting look from the content file", () => {
    expect(currentChoice("start", startFrom("base")).lines).toEqual([
      "Starting look: Quiet and neutral",
    ]);
    expect(currentChoice("start", startFrom("quirky")).lines).toEqual([
      "Starting look: Bold and playful",
    ]);
  });

  it("follows a preset, and the starting look where there is none", () => {
    const state = withPreset(startFrom("base"), "shape", "quirky");
    expect(currentChoice("shape", state).lines[0]).toBe("Corners: Extra round");
    expect(currentChoice("shape", startFrom("base")).lines[0]).toBe(
      "Corners: Soft",
    );
    expect(currentChoice("spacing", startFrom("nature")).lines).toEqual([
      "Spacing: Spacious",
    ]);
    expect(
      currentChoice("depth", withPreset(startFrom("base"), "depth", "flat"))
        .lines,
    ).toEqual(["Shadows: Flat", "Motion: Standard"]);
  });

  it("does not name a shadow choice the Base look does not have", () => {
    expect(currentChoice("depth", startFrom("base")).lines[0]).toBe(
      "Shadows: As in your starting look",
    );
    expect(currentChoice("depth", startFrom("quirky")).lines[0]).toBe(
      "Shadows: Hard",
    );
  });

  it("reads the outline width", () => {
    const bold = withKnobs(startFrom("base"), { borderWidth: 2 });
    expect(currentChoice("shape", bold).lines[1]).toBe("Outline: Bold");
    expect(currentChoice("shape", startFrom("base")).lines[1]).toBe(
      "Outline: Thin",
    );
  });

  it("shows the brand colour, with a swatch, when one is set", () => {
    const state = withKnobs(startFrom("base"), { brand: "#3366cc" });
    expect(currentChoice("colour", state)).toEqual({
      lines: ["Brand colour: #3366cc"],
      swatch: "#3366cc",
    });
    expect(currentChoice("colour", startFrom("base")).swatch).toBeUndefined();
  });

  it("says how many things to fix on Check", () => {
    const state = startFrom("base");
    expect(currentChoice("check", state, 0).lines).toEqual(["Readable"]);
    expect(currentChoice("check", state, 1).lines).toEqual(["1 thing to fix"]);
    expect(currentChoice("check", state, 3).lines).toEqual(["3 things to fix"]);
  });

  it("has a choice for every step, made only of content-file words", () => {
    for (const id of stepIds) {
      const { lines } = currentChoice(id, startFrom("corporate"));
      expect(lines.length, id).toBeGreaterThan(0);
      expect(getStep(id).name, id).toBeTruthy();
    }
  });
});
