import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import {
  Section,
  sectionPaddingClasses,
  sectionToneClasses,
  type SectionTone,
} from "./section";
import { Split, splitAlignClasses, splitRatioClasses } from "./split";
import {
  Sidebar,
  sidebarAsideClasses,
  sidebarContentClasses,
  sidebarSideClasses,
} from "./sidebar";

const themeCss = readFileSync(
  resolve(__dirname, "../styles/theme.css"),
  "utf8",
);
const contrastPairs = JSON.parse(
  readFileSync(
    resolve(__dirname, "../../../../tokens/contrast-pairs.json"),
    "utf8",
  ),
) as {
  contexts: Record<string, { surface: string }>;
  roles: { fg: string }[];
};

// Compile-time checks (tsc, via `pnpm typecheck`).
const refChecks = () => {
  const section = React.createRef<HTMLElement>();
  const div = React.createRef<HTMLDivElement>();

  <Section ref={section} />;
  <Section as="div" ref={div} />;
  <Split ref={div} />;
  <Sidebar sidebar="x" ref={div} />;

  // @ts-expect-error a callback ref for a div on the default section element
  <Section ref={(el: HTMLDivElement | null) => void el} />;
  // @ts-expect-error `tone` is a closed union
  <Section tone="danger" />;
  // @ts-expect-error `ratio` is a closed union
  <Split ratio="1:3" />;
  // @ts-expect-error reordering is visual only and breaks focus order
  <Split reverse />;
  // @ts-expect-error the layout follows the container width instead
  <Sidebar sidebar="x" collapseBelow="lg" />;
  // @ts-expect-error the sidebar slot is required
  <Sidebar />;
};
void refChecks;

describe("Section", () => {
  it("renders a section by default and the chosen element via as", () => {
    render(
      <>
        <Section>a</Section>
        <Section as="footer">b</Section>
      </>,
    );
    expect(screen.getByText("a").tagName).toBe("SECTION");
    expect(screen.getByText("b").tagName).toBe("FOOTER");
  });

  it("defaults to canvas tone and medium padding", () => {
    render(<Section>x</Section>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("ds-tone-canvas");
    expect(cls).toContain("py-ds-section-md");
  });

  it.each(["canvas", "subtle", "inverse", "brand"] as const)(
    "tone=%s uses its .ds-tone-* recipe, which exists in theme.css",
    (tone) => {
      render(<Section tone={tone}>x</Section>);
      const cls = screen.getByText("x").className;
      expect(cls).toContain(`ds-tone-${tone}`);
      expect(themeCss).toContain(`.ds-tone-${tone} {`);
      // The surface and text come from the recipe, not loose utilities.
      expect(cls).not.toMatch(/\bbg-ds-|\btext-ds-/);
    },
  );

  it("a tone passed through className replaces the Section's tone", () => {
    render(
      <Section tone="inverse" className="ds-tone-brand">
        x
      </Section>,
    );
    const cls = screen.getByText("x").className;
    expect(cls).toContain("ds-tone-brand");
    expect(cls).not.toContain("ds-tone-inverse");
  });

  it.each(["sm", "md", "lg"] as const)("padding=%s uses the token", (p) => {
    render(<Section padding={p}>x</Section>);
    expect(screen.getByText("x").className).toContain(`py-ds-section-${p}`);
  });

  it("wraps children in a Container only when asked", () => {
    const { rerender } = render(<Section>x</Section>);
    expect(screen.getByText("x").dataset.slot).toBe("section");
    rerender(<Section container="md">x</Section>);
    const inner = screen.getByText("x");
    expect(inner.dataset.slot).toBe("container");
    expect(inner.className).toContain("max-w-ds-md");
    expect(inner.parentElement?.dataset.slot).toBe("section");
  });

  it("forwards ref and lets className override", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Section ref={ref} className="py-ds-section-lg">
        x
      </Section>,
    );
    expect(ref.current?.className).toContain("py-ds-section-lg");
    expect(ref.current?.className).not.toContain("py-ds-section-md");
  });

  it("every tone is a contrast context, so every role is checked on it", () => {
    expect(Object.keys(contrastPairs.contexts).sort()).toEqual(
      (Object.keys(sectionToneClasses) as SectionTone[]).sort(),
    );
    const surfaces = Object.fromEntries(
      Object.entries(contrastPairs.contexts).map(([k, v]) => [k, v.surface]),
    );
    expect(surfaces).toEqual({
      canvas: "surface.canvas",
      subtle: "surface.subtle",
      inverse: "surface.inverse",
      brand: "surface.brand",
    });
    // Links and the focus ring are the roles F02 found broken on dark tones.
    const roles = contrastPairs.roles.map((r) => r.fg);
    expect(roles).toContain("text.link");
    expect(roles).toContain("focus.ring");
    expect(roles).toContain("action.primary.bg");
  });
});

describe("Split", () => {
  it("wraps by its own width, with a gap and stretch", () => {
    render(<Split>x</Split>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("ds-split");
    expect(cls).toContain("gap-ds-gap-lg");
    expect(cls).toContain("items-stretch");
    expect(cls).not.toMatch(/(^| )(sm|md|lg):/);
  });

  it("1:2 and 2:1 add their ratio recipe", () => {
    render(
      <>
        <Split ratio="1:2">a</Split>
        <Split ratio="2:1">b</Split>
      </>,
    );
    expect(screen.getByText("a").className).toContain("ds-split-1-2");
    expect(screen.getByText("b").className).toContain("ds-split-2-1");
  });

  it("align and as", () => {
    render(
      <Split as="section" align="center">
        x
      </Split>,
    );
    const el = screen.getByText("x");
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toContain("items-center");
  });
});

describe("Sidebar", () => {
  it("renders aside then content on the sidebar width token", () => {
    render(<Sidebar sidebar={<span>side</span>}>main</Sidebar>);
    const aside = screen.getByText("side").parentElement!;
    const content = screen.getByText("main");
    expect(aside.tagName).toBe("ASIDE");
    expect(aside.className).toContain("basis-ds-sidebar");
    expect(aside.nextElementSibling).toBe(content);
    expect(content.className).toContain("min-w-1/2");
    expect(content.className).toContain("basis-0");
  });

  it("wraps by its own width; side=end reverses the row", () => {
    const { rerender } = render(<Sidebar sidebar="s">x</Sidebar>);
    let root = screen.getByText("x").parentElement!;
    expect(root.className).toContain("flex-wrap");
    expect(root.className).not.toContain("flex-row-reverse");
    expect(root.className).not.toMatch(/(^| )(sm|md|lg):/);
    rerender(
      <Sidebar sidebar="s" side="end">
        x
      </Sidebar>,
    );
    root = screen.getByText("x").parentElement!;
    expect(root.className).toContain("flex-row-reverse");
  });

  it("sidebarAs swaps the aside element", () => {
    render(
      <Sidebar sidebar={<span>side</span>} sidebarAs="nav">
        x
      </Sidebar>,
    );
    expect(screen.getByText("side").parentElement!.tagName).toBe("NAV");
  });
});

describe("static class maps", () => {
  const maps = [
    ...Object.values(sectionToneClasses),
    ...Object.values(sectionPaddingClasses),
    ...Object.values(splitRatioClasses),
    ...Object.values(splitAlignClasses),
    ...Object.values(sidebarSideClasses),
    sidebarAsideClasses,
    sidebarContentClasses,
  ];

  it("contain only literal class names (no template placeholders)", () => {
    for (const value of maps) expect(value).not.toMatch(/[${}]/);
  });

  it("the tokens they use exist in the bridge", () => {
    for (const t of ["sm", "md", "lg"])
      expect(themeCss).toContain(`--spacing-ds-section-${t}:`);
    expect(themeCss).toContain("--spacing-ds-sidebar:");
    for (const r of [".ds-split ", ".ds-split-1-2 ", ".ds-split-2-1 "])
      expect(themeCss).toContain(r);
    for (const c of [
      "--color-ds-canvas:",
      "--color-ds-surface-subtle:",
      "--color-ds-surface-inverse:",
      "--color-ds-surface-brand:",
      "--color-ds-text-inverse:",
      "--color-ds-on-brand:",
    ])
      expect(themeCss).toContain(c);
  });
});

describe("a11y", () => {
  it("has no violations when composed", async () => {
    const { container } = render(
      <main>
        <Section tone="inverse" container="lg" aria-label="intro">
          <Split ratio="1:2">
            <p>one</p>
            <p>two</p>
          </Split>
        </Section>
        <Section tone="brand" aria-label="promo">
          <p>brand</p>
        </Section>
        <Sidebar sidebar={<p>side</p>} sidebarAs="div" side="end">
          <p>content</p>
        </Sidebar>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
