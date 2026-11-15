import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const here = import.meta.dirname;
const theme = readFileSync(join(here, "../styles/theme.css"), "utf8");

// Component sources (no tests, no stories): the files whose classes ship.
const sources = readdirSync(here)
  .filter((f) => /\.(tsx|ts)$/.test(f) && !f.includes(".test."))
  .map((f) => [f, readFileSync(join(here, f), "utf8")] as const);

describe("H17: design values come from tokens (R13)", () => {
  // Tailwind default-scale utilities that R13 moved onto semantic tokens.
  const scale = [
    /\bsize-(4|3\.5|2)\b/,
    /\bfont-medium\b/,
    /\bunderline-offset-4\b/,
    /\bmin-w-32\b/,
    /\bafter:transition-opacity\b/,
    /\bafter:[hw]-0\.5\b/,
    /\bgap-2\b/,
  ];
  it.each(sources)("%s uses no scale utility for a token role", (_f, src) => {
    for (const re of scale) expect(src).not.toMatch(re);
  });

  it("the bridge exposes the new roles", () => {
    for (const name of [
      "--spacing-ds-icon-sm",
      "--spacing-ds-icon-md",
      "--spacing-ds-icon-dot",
      "--spacing-ds-menu",
      "--spacing-ds-menu-offset",
      "--spacing-ds-menu-item-x",
      "--spacing-ds-menu-item-y",
      "--spacing-ds-menu-item-end",
      "--spacing-ds-marker",
      "--spacing-ds-control-gap",
      "--container-ds-menu",
      "--font-weight-ds-control",
    ])
      expect(theme).toContain(name);
  });

  it("control text sizes carry a line-height companion (R23)", () => {
    expect(theme).toContain(
      "--text-ds-control-sm--line-height: var(--ds-control-sm-line-height)",
    );
    expect(theme).toContain(
      "--text-ds-control-md--line-height: var(--ds-control-md-line-height)",
    );
  });

  it("the Tabs marker fades on the motion tokens and honours reduced motion", () => {
    expect(theme).toMatch(
      /\.ds-transition-marker::after\s*\{[^}]*--ds-motion-duration-normal/,
    );
    expect(theme).toMatch(
      /prefers-reduced-motion[\s\S]*\.ds-transition-marker::after/,
    );
  });
});

describe("H17: print and consumer CSS (R24, R20)", () => {
  it("print resets the dark tones and keeps state fills", () => {
    const print = /@media print \{([\s\S]*?)\n {2}\}\n/.exec(theme)?.[1] ?? "";
    expect(print).toContain(".ds-tone-inverse");
    expect(print).toContain("--ds-text-primary: unset");
    expect(print).toContain('[data-slot="checkbox"]');
    expect(print).toContain("print-color-adjust: exact");
  });

  it("foundations scan their own folder", () => {
    expect(theme).toContain('@source "./";');
  });
});
