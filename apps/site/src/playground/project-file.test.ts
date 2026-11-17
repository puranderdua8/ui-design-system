import { describe, expect, it } from "vitest";
import {
  maxProjectFileLength,
  projectFileVersion,
  readProjectFile,
  writeProjectFile,
} from "./project-file";
import { serialiseState, startFrom } from "./state";
import type { PlaygroundState } from "./types";

const state: PlaygroundState = {
  ...startFrom("corporate"),
  knobs: { brand: "#1762b6", density: 0.9 },
  overrides: { "--ds-action-primary-bg": "#112233" },
};

const file = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    format: "ds-project",
    version: projectFileVersion,
    name: "Acme",
    state: serialiseState(state),
    ...over,
  });

describe("project file", () => {
  it("round-trips a project", () => {
    const text = writeProjectFile({ name: "Acme", state });
    expect(text.endsWith("\n")).toBe(true);
    expect(readProjectFile(text)).toEqual({ kind: "ok", name: "Acme", state });
  });

  it("cleans the name and the state of what was written by hand", () => {
    const result = readProjectFile(
      file({
        name: "<img src=x onerror=alert(1)>Acme; }",
        state: {
          ...serialiseState(state),
          overrides: {
            "--ds-action-primary-bg": "red; } body { display: none } :root {",
            "--ds-surface-canvas": "#ffffff",
          },
        },
      }),
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.name).toBe("img srcx onerroralert(1)Acme");
    expect(result.name).not.toMatch(/[<>;{}=]/);
    expect(result.state.overrides).toEqual({
      "--ds-surface-canvas": "#ffffff",
    });
  });

  it("refuses a newer file or state version", () => {
    expect(readProjectFile(file({ version: 2 }))).toEqual({ kind: "newer" });
    expect(
      readProjectFile(
        file({ state: { ...serialiseState(state), version: 99 } }),
      ),
    ).toEqual({ kind: "newer" });
  });

  it("refuses what is not a project file", () => {
    for (const bad of [
      file({ format: "other" }),
      file({ version: "1" }),
      file({ version: 0 }),
      file({ state: null }),
      file({ state: { start: "hacked" } }),
      "[]",
      "null",
    ])
      expect(readProjectFile(bad)).toEqual({
        kind: "invalid",
        reason: "not-a-project",
      });
    expect(readProjectFile("{not json")).toEqual({
      kind: "invalid",
      reason: "not-json",
    });
    expect(readProjectFile(42)).toEqual({
      kind: "invalid",
      reason: "not-json",
    });
  });

  it("refuses an oversized file", () => {
    expect(
      readProjectFile(file({ pad: "x".repeat(maxProjectFileLength) })),
    ).toEqual({ kind: "invalid", reason: "too-large" });
  });
});
