import { describe, expect, it } from "vitest";
import { themeMaps } from "./data";
import { toCss, toDtcg } from "./output";
import { fontPairings, fontChoices, ownFontStack } from "./fonts";
import { parseFontName } from "./grammar";
import { presetChoices } from "./presets";
import { builderContent } from "../content/builder";
import {
  currentPairing,
  parseState,
  previewVars,
  safeResolve,
  startFrom,
  withKnobs,
  withOwnFont,
  withPairing,
} from "./state";
import { currentChoice } from "./steps";

const resolve = (state: ReturnType<typeof startFrom>) =>
  safeResolve(state, themeMaps).resolved;

describe("parseFontName", () => {
  it("accepts plain names and tidies spaces", () => {
    expect(parseFontName("Space Grotesk")).toBe("Space Grotesk");
    expect(parseFontName("  Space   Grotesk ")).toBe("Space Grotesk");
    expect(parseFontName("Source Serif 4")).toBe("Source Serif 4");
  });

  it("refuses anything that could close a quote or carry CSS", () => {
    for (const bad of [
      "",
      "   ",
      "Space';}",
      "a, b",
      "Font</style>",
      "url(x)",
      "x".repeat(61),
      "-Font",
      42,
      undefined,
    ])
      expect(parseFontName(bad)).toBeNull();
  });
});

describe("a typed font", () => {
  const typed = withOwnFont(startFrom("base"), "heading", "Space Grotesk");

  it("writes the quoted name, keeping the fallbacks of the stack it replaces", () => {
    const { vars } = resolve(typed);
    expect(vars["--ds-font-family-heading"]).toBe(
      "'Space Grotesk', system-ui, sans-serif",
    );
    expect(vars["--ds-type-h1-font-family"]).toBe(
      "'Space Grotesk', system-ui, sans-serif",
    );
    // The other role is untouched.
    expect(vars["--ds-font-family-body"]).toBe("Inter, system-ui, sans-serif");
  });

  it("keeps a serif fallback when it replaces a serif stack", () => {
    expect(ownFontStack("Acme", "Fraunces, Georgia, serif")).toBe(
      "'Acme', Georgia, serif",
    );
  });

  it("wins over a pairing for its role", () => {
    const state = withOwnFont(
      withKnobs(startFrom("base"), { headingFont: "fraunces" }),
      "heading",
      "Space Grotesk",
    );
    expect(resolve(state).vars["--ds-font-family-heading"]).toMatch(
      /^'Space Grotesk', Georgia, serif$/,
    );
  });

  it("reaches the CSS and the design-token file", () => {
    const resolved = resolve(typed);
    expect(toCss(resolved)).toContain("'Space Grotesk', system-ui");
    expect(JSON.stringify(toDtcg(resolved))).toContain("Space Grotesk");
  });

  it("is shown as a stand-in in the preview and never named there", () => {
    const { vars } = resolve(typed);
    const shown = previewVars(vars, typed.fonts);
    expect(shown["--ds-font-family-heading"]).toBe("system-ui, sans-serif");
    expect(JSON.stringify(shown)).not.toContain("Space Grotesk");
    // A curated font is still the self-hosted one.
    expect(shown["--ds-font-family-body"]).toBe(
      "var(--font-inter), system-ui, sans-serif",
    );
  });

  it("is dropped when a stored state carries an unsafe name", () => {
    const parsed = parseState({
      version: 2,
      start: "base",
      fonts: { heading: "A';}body{display:none", body: "Fine Font" },
    });
    // Every character outside the name set is stripped; what is left must still pass.
    expect(parsed?.fonts.heading).toBeUndefined();
    expect(parsed?.fonts.body).toBe("Fine Font");
    expect(
      parseState({ version: 2, start: "base", fonts: { heading: "';}" } })
        ?.fonts,
    ).toEqual({});
  });
});

describe("pairings", () => {
  it("use only fonts the site already serves itself", () => {
    const ids = new Set(fontChoices.map((font) => font.id));
    for (const pairing of fontPairings) {
      expect(ids.has(pairing.heading)).toBe(true);
      expect(ids.has(pairing.body)).toBe(true);
    }
  });

  it("have one card each in the content file", () => {
    const group = builderContent.steps.find((s) => s.id === "typography")!
      .groups[0]!;
    expect(group.choices).toHaveLength(fontPairings.length);
  });

  it("change both fonts and read back as the chosen pairing", () => {
    for (const pairing of fontPairings) {
      const state = withPairing(startFrom("quirky"), pairing);
      const { vars } = resolve(state);
      expect(currentPairing(state, vars)?.id).toBe(pairing.id);
    }
    const classic = withPairing(startFrom("base"), fontPairings[1]);
    const { vars } = resolve(classic);
    expect(vars["--ds-font-family-heading"]).toBe("Fraunces, Georgia, serif");
    expect(vars["--ds-font-family-body"]).toBe(
      "'Nunito Sans', system-ui, sans-serif",
    );
  });

  it("clear a typed font, and a typed font hides the selection", () => {
    const typed = withOwnFont(startFrom("base"), "body", "Acme Sans");
    expect(currentPairing(typed, resolve(typed).vars)).toBeUndefined();
    expect(withPairing(typed, fontPairings[0]).fonts).toEqual({});
  });

  it("show the starting look's own pairing as selected", () => {
    const base = startFrom("base");
    expect(currentPairing(base, resolve(base).vars)?.id).toBe("clean");
  });
});

describe("text size", () => {
  it("has three sizes and the fine-tune scales every size", () => {
    expect(presetChoices.type).toHaveLength(3);
    const plain = resolve(startFrom("base")).vars["--ds-font-size-base"];
    const bigger = resolve(withKnobs(startFrom("base"), { typeScale: 1.2 }))
      .vars["--ds-font-size-base"];
    expect(Number.parseFloat(String(bigger))).toBeGreaterThan(
      Number.parseFloat(String(plain)),
    );
  });
});

describe("the step's summary line", () => {
  it("names the pairing, a typed font, or the look's own", () => {
    const line = (state: ReturnType<typeof startFrom>) =>
      currentChoice("typography", state).lines[0]!;
    const names = builderContent.steps.find((s) => s.id === "typography")!
      .groups[0]!.choices;
    expect(line(withPairing(startFrom("base"), fontPairings[2]))).toContain(
      names[2]!.name,
    );
    expect(line(withOwnFont(startFrom("base"), "heading", "Acme"))).toContain(
      "Acme",
    );
    expect(line(startFrom("base"))).toContain(builderContent.shell.sameAsLook);
  });
});
