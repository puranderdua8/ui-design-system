// The "Build with it" extras (S57): the package CSS file and the font snippet.
import { describe, expect, it } from "vitest";
import { themeMaps } from "../data";
import { resolveState } from "../engine";
import { UnsafeValueError } from "../grammar";
import type { PlaygroundState, ResolvedTheme, ThemeName } from "../types";
import { credit } from "./credit";
import { fontFamilies, fontSnippet } from "./font-snippet";
import { toPackageCss } from "./package-css";

const resolved = (
  start: ThemeName,
  patch: Partial<PlaygroundState> = {},
): ResolvedTheme =>
  resolveState(
    {
      start,
      mode: "light",
      dims: {},
      fonts: {},
      knobs: {},
      overrides: {},
      ...patch,
    },
    themeMaps,
  );

describe("toPackageCss", () => {
  it("is the theme file after the credit, named from the project", () => {
    const file = toPackageCss(resolved("nature"), "My Brand!");
    expect(file.name).toBe("my-brand.css");
    expect(file.mime).toBe("text/css");
    expect(file.content.startsWith(`/* ${credit} */\n`)).toBe(true);
    expect(file.content).toContain("--ds-color-brand-600:");
    // Roles point at the shades, so the package's components follow every change.
    expect(file.content).toMatch(/var\(--ds-color-/);
  });

  it("refuses a value that does not parse (the grammar guards the exit)", () => {
    const theme = resolved("base");
    const bad: ResolvedTheme = {
      ...theme,
      vars: {
        ...theme.vars,
        "--ds-color-brand-600": "red; } body { display: none } :root {",
      },
    };
    expect(() => toPackageCss(bad)).toThrow(UnsafeValueError);
  });
});

describe("fontSnippet", () => {
  it("names the fonts of the look once each, heading first", () => {
    expect(fontFamilies(resolved("nature"))).toEqual([
      "Fraunces",
      "Nunito Sans",
    ]);
    expect(fontFamilies(resolved("base"))).toEqual(["Inter"]);
    expect(fontSnippet(resolved("nature"))).toBe(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces&family=Nunito+Sans&display=swap">',
    );
  });

  it("includes a font the person typed", () => {
    const theme = resolved("base", { fonts: { heading: "Space Grotesk" } });
    expect(fontSnippet(theme)).toContain("family=Space+Grotesk");
    expect(fontSnippet(theme)).toContain("family=Inter");
  });

  it("is null when only built-in fonts are named", () => {
    const base = resolved("base");
    const plain: ResolvedTheme = {
      ...base,
      vars: {
        ...base.vars,
        "--ds-font-family-heading": "system-ui, sans-serif",
        "--ds-font-family-body": "Georgia, serif",
      },
    };
    expect(fontSnippet(plain)).toBeNull();
  });

  it("never writes a name that is not letters, numbers and spaces", () => {
    const base = resolved("base");
    const hostile: ResolvedTheme = {
      ...base,
      vars: {
        ...base.vars,
        "--ds-font-family-heading": "'Evil\"><script>', serif",
      },
    };
    const snippet = fontSnippet(hostile) ?? "";
    expect(snippet).not.toContain("script");
    expect(snippet).not.toContain("Evil");
  });
});
