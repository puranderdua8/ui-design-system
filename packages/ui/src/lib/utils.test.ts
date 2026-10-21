import { describe, expect, it } from "vitest";
import {
  dsFontSizes,
  dsThemeValues,
  dsTypeRecipes,
} from "./generated/ds-classes";
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

  it("treats shadow-ds-* as a shadow, not a shadow colour", () => {
    expect(cn("shadow-ds-raised", "shadow-ds-overlay")).toBe(
      "shadow-ds-overlay",
    );
    expect(cn("shadow-md", "shadow-ds-raised")).toBe("shadow-ds-raised");
    expect(cn("shadow-ds-raised", "shadow-md")).toBe("shadow-md");
    expect(cn("shadow-ds-raised", "shadow-ds-text")).toBe(
      "shadow-ds-raised shadow-ds-text",
    );
  });

  it("keeps ds link colours apart from ds sizes and replaces colours", () => {
    expect(cn("text-ds-link", "text-ds-body")).toBe(
      "text-ds-link text-ds-body",
    );
    expect(cn("text-ds-link", "text-ds-link-hover")).toBe("text-ds-link-hover");
    expect(cn("text-ds-text", "text-ds-on-brand")).toBe("text-ds-on-brand");
    expect(cn("bg-ds-surface-subtle", "bg-ds-surface-brand")).toBe(
      "bg-ds-surface-brand",
    );
  });

  it("groups ds radius, container, spacing and ease with their Tailwind kin", () => {
    expect(cn("rounded-md", "rounded-ds-card")).toBe("rounded-ds-card");
    expect(cn("rounded-ds-card", "rounded-ds-pill")).toBe("rounded-ds-pill");
    expect(cn("max-w-lg", "max-w-ds-md")).toBe("max-w-ds-md");
    expect(cn("gap-4", "gap-ds-gap-md")).toBe("gap-ds-gap-md");
    expect(cn("py-ds-section-sm", "py-ds-section-lg")).toBe("py-ds-section-lg");
    expect(cn("ease-in", "ease-ds-standard")).toBe("ease-ds-standard");
  });

  it("a type recipe replaces font-ds-heading and font-ds-body", () => {
    expect(cn("font-ds-body", "ds-type-h1")).toBe("ds-type-h1");
    expect(cn("font-ds-heading", "font-ds-body")).toBe("font-ds-body");
    expect(cn("font-ds-body", "font-bold")).toBe("font-ds-body font-bold");
  });

  it("generated class lists match theme.css (run `pnpm build` if this fails)", async () => {
    // No @types/node in this package, so type the two Node bits we need locally.
    const nodeFs: string = "node:fs";
    const { readFileSync } = (await import(nodeFs)) as {
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
    for (const [key, ns] of Object.entries({
      shadow: "shadow",
      radius: "radius",
      container: "container",
      spacing: "spacing",
      ease: "ease",
    })) {
      const values = [
        ...css.matchAll(new RegExp(`--${ns}-(ds-[a-z0-9-]+):`, "g")),
      ].map((m) => m[1]);
      expect(dsThemeValues[key]).toEqual(values);
      expect(values.length).toBeGreaterThan(0);
    }
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(cn("text-ds-text", `text-${size}`)).toBe(
        `text-ds-text text-${size}`,
      );
    }
  });
});
