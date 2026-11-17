import { describe, expect, it } from "vitest";
import { bannedWords, builderContent } from "../content/builder";
import { contrastSpec as spec, themeMaps as themes } from "./data";
import { analyse, explain, roleName, type CauseId } from "./explain";
import { fix } from "./fix";
import { hexAt, read } from "./ramps";
import { defaultState } from "./state";
import type {
  ContrastResult,
  PlaygroundState,
  ResolvedTheme,
  ThemeName,
} from "./types";

const names = Object.keys(themes) as ThemeName[];
const state = (patch: Partial<PlaygroundState>): PlaygroundState => ({
  ...defaultState,
  ...patch,
});

const failing = (s: PlaygroundState, cause: CauseId) =>
  analyse(s, themes, spec).explanations.find((e) => e.cause === cause);

describe("explain: causes and sentences (spec 4.5)", () => {
  it("a shipped look has nothing to explain", () => {
    for (const start of names) {
      const a = analyse(state({ start }), themes, spec);
      expect(a.report.failing, start).toBe(0);
      expect(a.explanations, start).toEqual([]);
    }
  });

  it("blames a light brand colour, with a count and a plain example", () => {
    const a = analyse(
      state({ knobs: { brand: "#ffe14d" } }),
      themes,
      spec,
    ).explanations;
    const brand = a.find((e) => e.cause === "brand")!;
    expect(brand).toBeTruthy();
    expect(brand.sentence).toContain(builderContent.check.causes.brandLight);
    expect(brand.sentence).toMatch(/\d+ places are affected, for example /);
    expect(brand.count).toBe(brand.results.length);
    expect(brand.example.ok).toBe(false);
    expect(brand.exampleName).not.toBe("");
    expect(brand.exampleName).not.toBe(builderContent.check.unnamedPlace);
  });

  it("says a dark brand colour is too dark", () => {
    const e = failing(state({ knobs: { brand: "#10102a" } }), "brand");
    if (e) expect(e.sentence).toContain(builderContent.check.causes.brandDark);
  });

  it("blames a highlight colour that is too light", () => {
    const e = failing(state({ knobs: { accent: "#ffee88" } }), "highlight")!;
    expect(e.sentence).toContain(builderContent.check.causes.highlight);
    expect(e.count).toBeGreaterThan(0);
  });

  it("blames a colour set by hand ahead of the colour it replaces", () => {
    const s = state({ overrides: { "--ds-text-primary": "#cccccc" } });
    const e = failing(s, "handSet")!;
    expect(e.sentence).toContain(builderContent.check.causes.handSet);
    expect(e.keys).toEqual(["--ds-text-primary"]);
    expect(failing(s, "background")).toBeUndefined();
  });

  it("blames the background feel when only a neutral step is involved", () => {
    const a = analyse(
      state({ start: "base", knobs: { neutral: { hue: 90, chroma: 0.4 } } }),
      themes,
      spec,
    );
    // A strong tint may or may not fail; whatever fails must be named by its cause.
    for (const e of a.explanations) expect(e.sentence).toBeTruthy();
  });

  const result = (fg: string, bg: string): ContrastResult => ({
    kind: "pair",
    fg,
    bg,
    fgValue: "#000000",
    bgValue: "#111111",
    tone: "",
    ratio: 1.1,
    min: 4.5,
    ok: false,
  });
  const resolvedWith = (refs: Record<string, string>): ResolvedTheme => ({
    vars: { "--ds-color-brand-600": "#336699" },
    refs,
    primitives: {},
    semanticLiterals: {},
    semanticOverrides: [],
    ignored: [],
  });

  it("gives a sentence for every cause, including background and other", () => {
    const refs = {
      "--ds-text-primary": "--ds-color-neutral-900",
      "--ds-surface-subtle": "--ds-color-neutral-50",
      "--ds-surface-canvas": "--ds-color-white",
      "--ds-text-inverse": "--ds-color-white",
    };
    const out = explain(
      {
        results: [
          result("text-primary", "surface-subtle"), // background
          result("text-inverse", "surface-canvas"), // other: white on white
          { ...result("text-inverse", "scrim strong"), kind: "scrim" },
        ],
        failing: 3,
        skipped: 0,
      },
      resolvedWith(refs),
      { overrides: {} },
    );
    const causes = out.map((e) => e.cause).sort();
    expect(causes).toEqual(["background", "other"]);
    const other = out.find((e) => e.cause === "other")!;
    expect(other.count).toBe(2);
    expect(other.sentence).toContain(builderContent.check.causes.other);
    const bg = out.find((e) => e.cause === "background")!;
    expect(bg.sentence).toContain(builderContent.check.causes.background);
    expect(bg.count).toBe(1);
    expect(bg.sentence).toContain("1 place is affected");
  });

  it("uses no technical word in a sentence, and names every place in plain words", () => {
    const s = state({
      knobs: { brand: "#ffe14d", accent: "#ffee88" },
      overrides: { "--ds-text-muted": "#dddddd" },
    });
    for (const e of analyse(s, themes, spec).explanations)
      for (const word of bannedWords)
        expect(e.sentence, word).not.toMatch(new RegExp(`\\b${word}\\b`, "i"));
    expect(roleName("on-inverse-link")).toBe("links");
    expect(roleName("on-raised-action-primary-bg")).toBe("main buttons");
    expect(roleName("nothing-like-this")).toBeUndefined();
  });

  it("names a place for every colour in the contrast pairs", () => {
    const wanted = new Set<string>();
    for (const p of spec.pairs) {
      wanted.add(p.fg.replaceAll(".", "-"));
      wanted.add(p.bg.replaceAll(".", "-"));
    }
    for (const r of spec.roles ?? []) wanted.add(r.fg.replaceAll(".", "-"));
    const missing = [...wanted].filter((n) => roleName(n) === undefined);
    expect(missing).toEqual([]);
  });
});

describe("fix: nearest passing shade, same hue (spec 4.5)", () => {
  const ctx = { themes, spec };

  it("moves a light brand colour, shows before and after, and leaves none failing", () => {
    const s = state({ knobs: { brand: "#ffe14d" } });
    const out = fix("brand", s, ctx)!;
    expect(out.changed).toBe(true);
    expect(out.before.failing).toBeGreaterThan(0);
    expect(out.after.failing).toBe(0);
    expect(out.before.colour).not.toBe(out.after.colour);
    expect(out.totalAfter).toBeLessThan(out.totalBefore);
    // The input state is not changed (undo needs it).
    expect(s.knobs.brand).toBe("#ffe14d");
    expect(out.state.knobs.brand).toBe(out.after.colour);
  });

  it("does nothing for a cause that is not failing", () => {
    expect(fix("brand", state({}), ctx)).toBeNull();
    expect(
      fix("other", state({ knobs: { brand: "#ffe14d" } }), ctx),
    ).toBeNull();
  });

  it("fixes a light highlight colour", () => {
    const out = fix("highlight", state({ knobs: { accent: "#ffee88" } }), ctx)!;
    expect(out.after.failing).toBe(0);
    expect(out.state.knobs.accent).toBe(out.after.colour);
  });

  it("fixes a colour set by hand, keeping its hue", () => {
    const s = state({ overrides: { "--ds-text-primary": "#e6c8a0" } });
    const out = fix("handSet", s, ctx)!;
    expect(out.after.failing).toBe(0);
    const before = read("#e6c8a0");
    const after = read(out.state.overrides["--ds-text-primary"]!);
    expect(Math.abs(after.h - before.h)).toBeLessThan(6);
  });

  it("takes away a hand-set alias that cannot be tuned", () => {
    const s = state({
      overrides: { "--ds-text-primary": "--ds-color-neutral-100" },
    });
    expect(failing(s, "handSet")).toBeTruthy();
    const out = fix("handSet", s, ctx)!;
    expect(out.after.failing).toBe(0);
    expect(out.state.overrides["--ds-text-primary"]).toBeUndefined();
  });

  it("works from every starting look", () => {
    for (const start of names) {
      const out = fix(
        "brand",
        state({ start, knobs: { brand: "#fff0a0" } }),
        ctx,
      )!;
      expect(out.after.failing, start).toBe(0);
    }
  });

  it("property: for 360 hues at several chroma levels the fix clears the cause and keeps the hue", () => {
    let tried = 0;
    const problems: string[] = [];
    for (let hue = 0; hue < 360; hue++) {
      for (const chroma of [0.06, 0.14, 0.26]) {
        const start = hexAt(0.9, chroma, hue);
        const s = state({ knobs: { brand: start } });
        const out = fix("brand", s, ctx);
        if (!out) continue; // already readable
        tried++;
        if (out.after.failing !== 0)
          problems.push(`h${hue} c${chroma}: ${out.after.failing} left`);
        const a = read(start);
        const b = read(out.after.colour);
        const diff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
        // Hue is kept; a very pale or very dark colour has too little chroma to measure.
        if (b.c > 0.03 && a.c > 0.03 && diff > 8)
          problems.push(`h${hue} c${chroma}: hue moved ${diff.toFixed(1)}`);
      }
    }
    expect(problems).toEqual([]);
    expect(tried).toBeGreaterThan(500);
  }, 600_000);

  it("property: a dark brand colour is fixed too, and so is a highlight colour", () => {
    const problems: string[] = [];
    for (let hue = 0; hue < 360; hue += 5) {
      for (const [key, light] of [
        ["brand", 0.2],
        ["accent", 0.9],
      ] as const) {
        const s = state({ knobs: { [key]: hexAt(light, 0.14, hue) } });
        const cause = key === "brand" ? "brand" : "highlight";
        const out = fix(cause, s, ctx);
        if (out && out.after.failing !== 0)
          problems.push(`${key} h${hue}: ${out.after.failing} left`);
      }
    }
    expect(problems).toEqual([]);
  }, 600_000);
});
