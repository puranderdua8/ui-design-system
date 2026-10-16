import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Text, textVariants } from "./text";

describe("Text", () => {
  it("renders a p by default", () => {
    render(<Text>hi</Text>);
    expect(screen.getByText("hi").tagName).toBe("P");
  });

  it.each(["p", "span", "div", "label"] as const)("renders as %s", (as) => {
    render(<Text as={as}>hi</Text>);
    expect(screen.getByText("hi").tagName).toBe(as.toUpperCase());
  });

  it("keeps the variant class regardless of element", () => {
    render(
      <>
        <Text as="span" variant="lead">
          a
        </Text>
        <Text as="div" variant="lead">
          b
        </Text>
      </>,
    );
    expect(screen.getByText("a").className).toContain("ds-type-lead");
    expect(screen.getByText("b").className).toContain("ds-type-lead");
  });

  it("applies the right class per variant", () => {
    for (const v of ["body", "lead", "caption", "label"] as const) {
      expect(textVariants({ variant: v })).toContain(`ds-type-${v}`);
    }
  });

  it("merges className and lets it override conflicting utilities", () => {
    render(
      <Text variant="caption" className="text-ds-text mt-2">
        x
      </Text>,
    );
    const cls = screen.getByText("x").className;
    expect(cls).toContain("mt-2");
    expect(cls).toContain("ds-type-caption");
    expect(cls).not.toContain("text-ds-text-muted");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Text ref={ref}>x</Text>);
    expect(ref.current?.tagName).toBe("P");
  });

  it("has no a11y violations", async () => {
    const { container } = render(
      <main>
        <Text>body</Text>
        <Text as="label" htmlFor="f" variant="label">
          Name
        </Text>
        <input id="f" />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("variant map has no template interpolation", () => {
    const classes = (["body", "lead", "caption", "label"] as const).map((v) =>
      textVariants({ variant: v }),
    );
    for (const c of classes) expect(c).not.toMatch(/\$\{|undefined/);
    expect(classes).toMatchInlineSnapshot(`
      [
        "text-ds-text ds-type-body",
        "text-ds-text ds-type-lead",
        "text-ds-text ds-type-caption text-ds-text-muted",
        "text-ds-text ds-type-label",
      ]
    `);
  });
});
