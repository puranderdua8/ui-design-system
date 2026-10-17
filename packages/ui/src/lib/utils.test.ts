import { describe, expect, it } from "vitest";
import { dsFontSizes, dsTypeRecipes } from "./generated/ds-classes";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a ds colour and a ds size together", () => {
    expect(cn("text-ds-text", "text-ds-lead")).toBe(
      "text-ds-text text-ds-lead",
    );
  });

  it("lets a later ds colour replace an earlier one", () => {
    expect(cn("text-ds-text", "text-ds-primary")).toBe("text-ds-primary");
  });

  it("lets a later ds size replace a Tailwind size", () => {
    expect(cn("text-lg", "text-ds-body")).toBe("text-ds-body");
  });

  it("keeps only the last ds-type recipe", () => {
    expect(cn("ds-type-body", "ds-type-caption")).toBe("ds-type-caption");
    expect(cn("ds-type-h1", "mt-2", "ds-type-h3")).toBe("mt-2 ds-type-h3");
  });

  it("a recipe replaces earlier loose type utilities, not colours", () => {
    expect(cn("text-ds-text text-ds-lead", "ds-type-caption")).toBe(
      "text-ds-text ds-type-caption",
    );
  });

  it("generated class lists match theme.css (run `pnpm build` if this fails)", async () => {
    // No @types/node in this package, so type the two Node bits we need locally.
    const { readFileSync } = (await import("node:fs" as string)) as {
      readFileSync: (path: string, encoding: string) => string;
    };
    const dir = (import.meta as unknown as { dirname: string }).dirname;
    const css = readFileSync(`${dir}/../styles/theme.css`, "utf8");
    const sizes = [
      ...new Set(
        [...css.matchAll(/--text-ds-([a-z0-9]+(?:-[a-z0-9]+)?):/g)].map(
          (m) => `ds-${m[1]}`,
        ),
      ),
    ];
    const recipes = [...css.matchAll(/^\s*\.(ds-type-[a-z0-9-]+)\s*\{/gm)].map(
      (m) => m[1],
    );
    expect(dsFontSizes).toEqual(sizes);
    expect(dsTypeRecipes).toEqual(recipes);
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(cn("text-ds-text", `text-${size}`)).toBe(
        `text-ds-text text-${size}`,
      );
    }
  });
});
