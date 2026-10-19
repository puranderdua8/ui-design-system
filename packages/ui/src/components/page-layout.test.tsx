import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Section, sectionPaddingClasses, sectionToneClasses } from "./section";
import {
  Split,
  splitAlignClasses,
  splitRatioClasses,
  splitReverseClasses,
} from "./split";
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
) as { pairs: { fg: string; bg: string }[] };

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
    expect(cls).toContain("bg-ds-canvas");
    expect(cls).toContain("text-ds-text");
    expect(cls).toContain("py-ds-section-md");
  });

  it.each([
    ["subtle", "bg-ds-surface-subtle", "text-ds-text"],
    ["inverse", "bg-ds-surface-inverse", "text-ds-text-inverse"],
    ["brand", "bg-ds-surface-brand", "text-ds-on-brand"],
  ] as const)(
    "tone=%s sets surface and matching text colour",
    (tone, bg, fg) => {
      render(<Section tone={tone}>x</Section>);
      const cls = screen.getByText("x").className;
      expect(cls).toContain(bg);
      expect(cls).toContain(fg);
    },
  );

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

  it("every tone's text/surface pair is contrast-checked", () => {
    const has = (fg: string, bg: string) =>
      contrastPairs.pairs.some((p) => p.fg === fg && p.bg === bg);
    expect(has("text.primary", "surface.canvas")).toBe(true);
    expect(has("text.primary", "surface.subtle")).toBe(true);
    expect(has("text.inverse", "surface.inverse")).toBe(true);
    expect(has("text.on-brand", "surface.brand")).toBe(true);
  });
});

describe("Split", () => {
  it("is a one-column grid under md with a gap and stretch", () => {
    render(<Split>x</Split>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("grid");
    expect(cls).toContain("grid-cols-1");
    expect(cls).toContain("md:grid-cols-2");
    expect(cls).toContain("gap-ds-gap-lg");
    expect(cls).toContain("items-stretch");
  });

  it("1:2 and 2:1 span the wider child over two of three tracks", () => {
    render(
      <>
        <Split ratio="1:2">a</Split>
        <Split ratio="2:1">b</Split>
      </>,
    );
    expect(screen.getByText("a").className).toContain(
      "md:[&>:last-child]:col-span-2",
    );
    expect(screen.getByText("b").className).toContain(
      "md:[&>:first-child]:col-span-2",
    );
  });

  it("reverse only reorders from md up", () => {
    render(<Split reverse>x</Split>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("md:[&>:first-child]:order-2");
    expect(cls).toContain("md:[&>:last-child]:order-1");
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
  it("renders aside then content with the sidebar width token", () => {
    render(<Sidebar sidebar={<span>side</span>}>main</Sidebar>);
    const aside = screen.getByText("side").parentElement!;
    const content = screen.getByText("main");
    expect(aside.tagName).toBe("ASIDE");
    expect(aside.className).toContain("md:w-ds-sidebar");
    expect(aside.className).toContain("md:shrink-0");
    expect(aside.nextElementSibling).toBe(content);
    expect(content.className).toContain("min-w-0");
    expect(content.className).toContain("md:min-w-1/2");
  });

  it("stacks below the breakpoint and is a row from it", () => {
    render(<Sidebar sidebar="s">x</Sidebar>);
    const root = screen.getByText("x").parentElement!;
    expect(root.className).toContain("flex-col");
    expect(root.className).toContain("md:flex-row");
    expect(root.className).not.toContain("flex-row-reverse");
  });

  it("side=end reverses the row, collapseBelow=lg moves the breakpoint", () => {
    render(
      <Sidebar sidebar="s" side="end" collapseBelow="lg">
        x
      </Sidebar>,
    );
    const root = screen.getByText("x").parentElement!;
    expect(root.className).toContain("lg:flex-row-reverse");
    expect(root.className).not.toContain("md:");
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
    splitReverseClasses,
    ...Object.values(sidebarSideClasses).flatMap((m) => Object.values(m)),
    ...Object.values(sidebarAsideClasses),
    ...Object.values(sidebarContentClasses),
  ];

  it("contain only literal class names (no template placeholders)", () => {
    for (const value of maps) expect(value).not.toMatch(/[${}]/);
  });

  it("the tokens they use exist in the bridge", () => {
    for (const t of ["sm", "md", "lg"])
      expect(themeCss).toContain(`--spacing-ds-section-${t}:`);
    expect(themeCss).toContain("--spacing-ds-sidebar:");
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
          <Split ratio="1:2" reverse>
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
