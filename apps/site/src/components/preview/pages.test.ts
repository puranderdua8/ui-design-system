import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as ui from "@puranderdua/ui";

// The preview's five pages use package components only, and "All components" shows
// exactly the components the other four do not (spec 4.8).

const here = __dirname;
const source = (name: string) => readFileSync(join(here, name), "utf8");

/** Exports that are not components to show. */
const notShown = new Set(["ThemeScope", "DirectionProvider", "ScopedPortal"]);

const names = Object.keys(ui).filter(
  (key) => /^[A-Z]/.test(key) && !notShown.has(key),
);
/** The roots: `CardHeader` belongs to `Card`, but `Fieldset` is not part of `Field`. */
const roots = names.filter(
  (name) =>
    !names.some(
      (other) =>
        other !== name &&
        name.startsWith(other) &&
        /[A-Z]/.test(name.charAt(other.length)),
    ),
);

const used = (file: string): Set<string> => {
  const code = source(file);
  return new Set(
    roots.filter((root) => new RegExp(`<${root}[\\s>/]`).test(code)),
  );
};

const four = ["landing", "signup", "settings", "article"].map(
  (n) => `${n}.tsx`,
);

describe("preview pages", () => {
  it("finds the package's components", () => {
    expect(roots).toContain("Banner");
    expect(roots).toContain("Fieldset");
    expect(roots).not.toContain("CardHeader");
  });

  it("imports only from the package (and no landmark element)", () => {
    for (const file of [...four, "all-components.tsx"]) {
      const code = source(file);
      for (const match of code.matchAll(/from "([^"]+)"/g))
        expect(match[1], file).toBe("@puranderdua/ui");
      expect(code, file).not.toMatch(/<(main|nav|header|footer|aside)[\s>]/);
    }
  });

  it("shows every component on some page", () => {
    const covered = new Set<string>();
    for (const file of [...four, "all-components.tsx"])
      used(file).forEach((name) => covered.add(name));
    expect(roots.filter((name) => !covered.has(name))).toEqual([]);
  });

  it("puts on 'All components' exactly what the four pages do not use", () => {
    const fromFour = new Set<string>();
    for (const file of four) used(file).forEach((name) => fromFour.add(name));
    const rest = roots.filter((name) => !fromFour.has(name)).sort();
    // The page's own headings and text are scaffolding, not something it shows.
    const scaffolding = new Set(["Heading", "Stack", "Text"]);
    expect(
      [...used("all-components.tsx")].filter((n) => !scaffolding.has(n)).sort(),
    ).toEqual(rest);
  });

  it("starts headings below the tool's (no h1 or h2 on a page)", () => {
    for (const file of [...four, "all-components.tsx"])
      expect(source(file), file).not.toMatch(/as="h[12]"/);
  });
});
